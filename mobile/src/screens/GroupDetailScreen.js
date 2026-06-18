// src/screens/GroupDetailScreen.js — group page: posts, join/leave, and manager controls.
import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PostCard from "../components/PostCard";
import { Button } from "../components/ui";
import { groupApi, postApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function GroupDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState(null);

  const load = useCallback(async () => {
    try {
      const g = await groupApi.getOne(id);
      setGroup(g);
      try { setPosts(await postApi.byGroup(id)); } catch { setPosts(null); }
    } catch (e) { Alert.alert("Error", e.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!group) return <View style={styles.root}><Text style={styles.muted}>loading…</Text></View>;

  const isManager = String(group.owner?._id || group.owner) === String(user._id) || user.role === "admin";
  const isMember = group.members?.some((m) => String(m._id || m) === String(user._id));
  const isPending = group.pendingRequests?.some((m) => String(m._id || m) === String(user._id));

  const act = async (fn) => { try { await fn(); load(); } catch (e) { Alert.alert("Error", e.message); } };
  const deleteGroup = () =>
    Alert.alert("Delete group", "Delete this group and its posts?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => act(async () => { await groupApi.remove(id); navigation.goBack(); }) },
    ]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 14 }}>
      <View style={styles.head}>
        <Text style={styles.name}>{group.name}</Text>
        <Text style={styles.muted}>{group.privacy === "private" ? "🔒 private" : "🌍 public"} · {group.members?.length} members</Text>
        {!!group.description && <Text style={styles.desc}>{group.description}</Text>}
        <Text style={styles.muted}>manager: {group.owner?.name}</Text>

        <View style={styles.actions}>
          {!isMember && !isPending && <Button small title="join group" onPress={() => act(() => groupApi.join(id))} />}
          {isPending && <Text style={styles.muted}>⏳ request pending</Text>}
          {isMember && !isManager && <Button small variant="ghost" title="leave" onPress={() => act(() => groupApi.leave(id))} />}
          {isManager && <Button small variant="danger" title="delete group" onPress={deleteGroup} />}
        </View>
      </View>

      {isManager && (
        <View style={styles.card}>
          <Text style={styles.section}>manage members</Text>
          {group.pendingRequests?.length > 0 && <Text style={styles.muted}>pending requests</Text>}
          {group.pendingRequests?.map((p) => (
            <View key={p._id} style={styles.memberRow}>
              <Text style={styles.memberName}>{p.name} <Text style={styles.muted}>@{p.username}</Text></Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button small title="approve" onPress={() => act(() => groupApi.approve(id, p._id))} />
                <Button small variant="ghost" title="reject" onPress={() => act(() => groupApi.reject(id, p._id))} />
              </View>
            </View>
          ))}
          <Text style={[styles.muted, { marginTop: 8 }]}>members</Text>
          {group.members?.map((m) => (
            <View key={m._id} style={styles.memberRow}>
              <Pressable onPress={() => navigation.navigate("UserProfile", { id: m._id })}>
                <Text style={styles.memberName}>{m.name} <Text style={styles.muted}>@{m.username}</Text></Text>
              </Pressable>
              {String(m._id) !== String(group.owner?._id || group.owner) && (
                <Button small variant="danger" title="remove" onPress={() => act(() => groupApi.removeMember(id, m._id))} />
              )}
            </View>
          ))}
        </View>
      )}

      <Text style={styles.section}>group posts</Text>
      {posts === null ? (
        <Text style={styles.muted}>this is a private group. join to see its posts.</Text>
      ) : posts.length === 0 ? (
        <Text style={styles.muted}>no posts in this group yet.</Text>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} onDeleted={(pid) => setPosts((prev) => prev.filter((x) => x._id !== pid))} />)
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  name: { color: colors.text, fontSize: 22, fontWeight: "800" },
  muted: { color: colors.muted, marginTop: 4 },
  desc: { color: "#d6d8db", marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  section: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: 10, marginTop: 4 },
  memberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberName: { color: colors.text, fontWeight: "600" },
});
