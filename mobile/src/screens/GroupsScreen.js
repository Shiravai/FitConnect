// src/screens/GroupsScreen.js — list groups, create a group, join directly.
import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Field, Button } from "../components/ui";
import { groupApi, SPORT_TYPES } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function GroupsScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sportType: "Running", privacy: "public" });

  const load = useCallback(() => { groupApi.list().then(setGroups).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const create = async () => {
    if (!form.name.trim()) return Alert.alert("Missing name", "Group name is required.");
    try {
      await groupApi.create(form);
      if (user.role === "user") setUser({ ...user, role: "manager" });
      setShowForm(false);
      setForm({ name: "", description: "", sportType: "Running", privacy: "public" });
      load();
    } catch (e) { Alert.alert("Error", e.message); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>groups</Text>
        <Button small title={showForm ? "cancel" : "+ create"} onPress={() => setShowForm(!showForm)} />
      </View>

      {showForm && (
        <View style={styles.form}>
          <Field label="name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Field label="description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
          <Text style={styles.label}>sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {SPORT_TYPES.map((s) => (
              <Pressable key={s} onPress={() => setForm({ ...form, sportType: s })} style={[styles.sel, form.sportType === s && styles.selOn]}>
                <Text style={[styles.selText, form.sportType === s && { color: "#fff" }]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.label}>privacy</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {["public", "private"].map((p) => (
              <Pressable key={p} onPress={() => setForm({ ...form, privacy: p })} style={[styles.sel, form.privacy === p && styles.selOn]}>
                <Text style={[styles.selText, form.privacy === p && { color: "#fff" }]}>{p}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="create group" onPress={create} />
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(g) => g._id}
        contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => <GroupRow group={item} user={user} onOpen={() => navigation.navigate("GroupDetail", { id: item._id })} />}
      />
    </SafeAreaView>
  );
}

function GroupRow({ group, user, onOpen }) {
  const myId = String(user._id);
  const isOwner = String(group.owner?._id || group.owner) === myId || user.role === "admin";
  const member = (group.members || []).some((m) => String(m._id || m) === myId);
  const pending = (group.pendingRequests || []).some((m) => String(m._id || m) === myId);
  const [status, setStatus] = useState(isOwner ? "owner" : member ? "member" : pending ? "pending" : "none");
  const [busy, setBusy] = useState(false);

  const join = async () => {
    setBusy(true);
    try {
      const res = await groupApi.join(group._id);
      setStatus(res.status === "pending" ? "pending" : "member");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setBusy(false); }
  };

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={[styles.cover, coverColor(group.sportType)]}>
        <Text style={styles.coverText}>{group.sportType}</Text>
      </View>
      <Text style={styles.gName}>{group.name}</Text>
      <Text style={styles.muted}>{group.privacy === "private" ? "🔒 private" : "🌍 public"} · {group.members?.length || 0} members</Text>
      {!!group.description && <Text style={styles.desc}>{group.description}</Text>}
      <View style={styles.rowFoot}>
        {status === "owner" && <Text style={styles.tagOrange}>⭐ you manage this</Text>}
        {status === "member" && <Text style={styles.tagGreen}>✓ joined</Text>}
        {status === "pending" && <Text style={styles.muted}>⏳ pending</Text>}
        {status === "none" && (
          <Button small title={busy ? "…" : group.privacy === "private" ? "request" : "join"} onPress={join} disabled={busy} />
        )}
      </View>
    </Pressable>
  );
}

function coverColor(sport) {
  const map = {
    Yoga: "#7e57c2", Cycling: "#29b6f6", Swimming: "#00acc1", CrossFit: "#43a047",
    Boxing: "#b71c1c", Tennis: "#c0ca33", Skiing: "#0277bd", Basketball: "#ef6c00",
  };
  return { backgroundColor: map[sport] || colors.primary };
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  form: { backgroundColor: colors.card, margin: 14, marginTop: 0, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6, fontWeight: "600" },
  sel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.06)", marginRight: 8 },
  selOn: { backgroundColor: colors.primary },
  selText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  cover: { height: 64, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  coverText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  gName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 13, marginTop: 2 },
  desc: { color: "#c8cacd", marginTop: 6 },
  rowFoot: { marginTop: 10, flexDirection: "row", alignItems: "center" },
  tagOrange: { color: colors.primary, fontWeight: "700" },
  tagGreen: { color: colors.success, fontWeight: "700" },
});
