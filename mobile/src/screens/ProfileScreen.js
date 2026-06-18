// src/screens/ProfileScreen.js — used both for "me" (tab) and other users (pushed).
import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { Field, Button } from "../components/ui";
import { userApi, postApi } from "../api/endpoints";
import { uploadAsset } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function ProfileScreen({ route, navigation }) {
  const { user, setUser, logout } = useAuth();
  const profileId = route.params?.id || user._id;
  const isMe = String(profileId) === String(user._id);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", favoriteSport: "", avatarUrl: "" });

  const load = useCallback(async () => {
    try {
      const p = await userApi.getOne(profileId);
      setProfile(p);
      setForm({ name: p.name, bio: p.bio || "", favoriteSport: p.favoriteSport || "", avatarUrl: p.avatarUrl || "" });
      setPosts(await postApi.byUser(profileId));
    } catch (e) { Alert.alert("Error", e.message); }
  }, [profileId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (res.canceled) return;
    try {
      const { url } = await uploadAsset(res.assets[0].uri, "image");
      setForm((f) => ({ ...f, avatarUrl: url }));
    } catch (e) { Alert.alert("Upload failed", e.message); }
  };

  const save = async () => {
    try {
      const { user: updated } = await userApi.updateMe(form);
      setUser(updated);
      setProfile(updated);
      setEditing(false);
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const toggleFriend = async () => { try { await userApi.toggleFriend(profileId); load(); } catch (e) { Alert.alert("Error", e.message); } };
  const isFriend = user.friends?.some((f) => String(f) === String(profileId));

  if (!profile) return <View style={styles.root}><Text style={styles.muted}>loading…</Text></View>;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar url={form.avatarUrl || profile.avatarUrl} size={72} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.muted}>@{profile.username}</Text>
              {profile.role !== "user" && <Text style={styles.role}>{profile.role}</Text>}
            </View>
          </View>
          {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {!!profile.favoriteSport && <Text style={styles.muted}>🏅 {profile.favoriteSport}</Text>}
          <Text style={styles.muted}>{profile.friends?.length || 0} friends · {posts.length} posts</Text>

          <View style={styles.actions}>
            {isMe ? (
              <>
                <Button small title={editing ? "cancel" : "edit profile"} onPress={() => setEditing(!editing)} />
                {user.role === "admin" && <Button small variant="ghost" title="🛡️ admin" onPress={() => navigation.navigate("Admin")} />}
                <Button small variant="ghost" title="logout" onPress={logout} />
              </>
            ) : (
              <Button small title={isFriend ? "remove friend" : "add friend"} onPress={toggleFriend} />
            )}
          </View>

          {editing && (
            <View style={{ marginTop: 12 }}>
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Avatar url={form.avatarUrl} size={80} />
                <Pressable onPress={pickAvatar} style={{ marginTop: 8 }}><Text style={{ color: colors.primary, fontWeight: "700" }}>📷 upload photo</Text></Pressable>
              </View>
              <Field label="name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} autoCapitalize="words" />
              <Field label="bio" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline />
              <Field label="favorite sport" value={form.favoriteSport} onChangeText={(v) => setForm({ ...form, favoriteSport: v })} />
              <Button title="save" onPress={save} />
            </View>
          )}
        </View>

        <Text style={styles.section}>{isMe ? "my posts" : `${profile.name}'s posts`}</Text>
        {posts.length === 0 ? <Text style={styles.muted}>no posts yet.</Text> :
          posts.map((p) => <PostCard key={p._id} post={p} onDeleted={(pid) => setPosts((prev) => prev.filter((x) => x._id !== pid))} />)}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  name: { color: colors.text, fontSize: 20, fontWeight: "800" },
  muted: { color: colors.muted, marginTop: 4 },
  role: { color: colors.primary, fontWeight: "700", marginTop: 2, textTransform: "capitalize" },
  bio: { color: "#d6d8db", marginTop: 10 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  section: { color: colors.text, fontSize: 17, fontWeight: "700", marginVertical: 8 },
});
