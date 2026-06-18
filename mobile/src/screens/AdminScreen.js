// src/screens/AdminScreen.js — admin-only control panel (requirement #21).
import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "../components/ui";
import { adminApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

const ROLES = ["user", "manager", "admin"];

export default function AdminScreen() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const load = useCallback(async () => {
    if (user.role !== "admin") return;
    try {
      const [o, u, g] = await Promise.all([adminApi.overview(), adminApi.users(), adminApi.groups()]);
      setOverview(o); setUsers(u); setGroups(g);
    } catch (e) { Alert.alert("Error", e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (user.role !== "admin") return <View style={styles.root}><Text style={styles.muted}>admins only.</Text></View>;

  const cycleRole = async (u) => {
    const next = ROLES[(ROLES.indexOf(u.role) + 1) % ROLES.length];
    try { await adminApi.setRole(u._id, next); load(); } catch (e) { Alert.alert("Error", e.message); }
  };
  const delUser = (u) =>
    Alert.alert("Delete user", `Delete "${u.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await adminApi.deleteUser(u._id); load(); } catch (e) { Alert.alert("Error", e.message); } } },
    ]);
  const delGroup = (g) =>
    Alert.alert("Delete group", `Delete "${g.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await adminApi.deleteGroup(g._id); load(); } catch (e) { Alert.alert("Error", e.message); } } },
    ]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 14 }}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>🛡️ admin control panel</Text>
        <Text style={styles.bannerSub}>site-wide management — admins only</Text>
      </View>

      {overview && (
        <View style={styles.statsRow}>
          <Stat n={overview.totals.users} label="users" />
          <Stat n={overview.totals.groups} label="groups" />
          <Stat n={overview.totals.posts} label="posts" />
          <Stat n={overview.totals.messages} label="messages" />
        </View>
      )}

      <Text style={styles.section}>manage users ({users.length})</Text>
      {users.map((u) => (
        <View key={u._id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{u.name} <Text style={styles.muted}>@{u.username}</Text></Text>
            <Pressable onPress={() => String(u._id) !== String(user._id) && cycleRole(u)}>
              <Text style={styles.role}>{u.role}{String(u._id) === String(user._id) ? " (you)" : "  ›  tap to change"}</Text>
            </Pressable>
          </View>
          {String(u._id) !== String(user._id) && <Button small variant="danger" title="delete" onPress={() => delUser(u)} />}
        </View>
      ))}

      <Text style={styles.section}>manage groups ({groups.length})</Text>
      {groups.map((g) => (
        <View key={g._id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{g.name}</Text>
            <Text style={styles.muted}>{g.sportType} · {g.members?.length || 0} members · @{g.owner?.username || "—"}</Text>
          </View>
          <Button small variant="danger" title="delete" onPress={() => delGroup(g)} />
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function Stat({ n, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statNum}>{n}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  banner: { backgroundColor: "#1b1b1f", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  bannerSub: { color: colors.muted, marginTop: 2 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statBox: { flexGrow: 1, minWidth: 70, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, alignItems: "center" },
  statNum: { color: colors.primary, fontSize: 24, fontWeight: "800" },
  section: { color: colors.text, fontSize: 17, fontWeight: "700", marginVertical: 10 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, marginBottom: 8 },
  name: { color: colors.text, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 12 },
  role: { color: colors.primary, fontWeight: "600", marginTop: 4, fontSize: 13, textTransform: "capitalize" },
});
