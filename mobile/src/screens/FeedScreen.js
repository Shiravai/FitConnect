// src/screens/FeedScreen.js — personal feed (own + friends' + joined groups' posts).
import { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";
import { postApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function FeedScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPosts(await postApi.feed());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>fit<Text style={{ color: colors.primary }}>connect</Text></Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable onPress={() => navigation.navigate("Search")}><Text style={styles.searchBtn}>🔍 search</Text></Pressable>
          <Pressable onPress={logout}><Text style={styles.logout}>logout</Text></Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={<Text style={styles.title}>your feed</Text>}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.empty}>
              {error || "your feed is empty. join groups or add friends to see their workouts!"}
            </Text>
          )
        }
        renderItem={({ item }) => <PostCard post={item} onDeleted={onDeleted} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  brand: { color: "#fff", fontSize: 22, fontWeight: "800" },
  logout: { color: colors.muted, fontWeight: "600" },
  searchBtn: { color: colors.text, fontWeight: "600" },
  title: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 12 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40, paddingHorizontal: 20, lineHeight: 20 },
});
