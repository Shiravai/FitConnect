// src/screens/SearchScreen.js — simple free-text search by default,
// with an "advanced search" button that reveals the full filters (requirement #20).
import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Field, Button } from "../components/ui";
import PostCard from "../components/PostCard";
import { postApi, groupApi, SPORT_TYPES } from "../api/endpoints";
import { colors, radius } from "../theme";

export default function SearchScreen({ navigation }) {
  const [mode, setMode] = useState("posts"); // "posts" | "groups"

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>search</Text>

      <View style={styles.toggle}>
        <Pressable style={[styles.toggleBtn, mode === "posts" && styles.toggleOn]} onPress={() => setMode("posts")}>
          <Text style={[styles.toggleText, mode === "posts" && { color: "#fff" }]}>posts</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, mode === "groups" && styles.toggleOn]} onPress={() => setMode("groups")}>
          <Text style={[styles.toggleText, mode === "groups" && { color: "#fff" }]}>groups</Text>
        </Pressable>
      </View>

      {mode === "posts" ? <PostSearch /> : <GroupSearch navigation={navigation} />}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ---- Posts: free-text keyword by default; advanced adds sport + minDistance + dates ----
function PostSearch() {
  const [q, setQ] = useState({ keyword: "", sportType: "", minDistance: "", from: "", to: "" });
  const [advanced, setAdvanced] = useState(false);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setQ({ ...q, [k]: v });

  const run = async () => {
    setBusy(true);
    try {
      // When advanced is closed, only the free-text keyword is sent.
      const active = advanced ? q : { keyword: q.keyword };
      const params = Object.fromEntries(Object.entries(active).filter(([, v]) => v !== ""));
      setResults(await postApi.search(params));
    } catch { setResults([]); }
    finally { setBusy(false); }
  };

  return (
    <View>
      <Field label="search posts" value={q.keyword} onChangeText={set("keyword")} placeholder="type anything…" />

      <AdvancedToggle open={advanced} onPress={() => setAdvanced(!advanced)} />
      {advanced && (
        <View style={styles.advanced}>
          <SportChips value={q.sportType} onChange={set("sportType")} />
          <Field label="min distance (km)" value={q.minDistance} onChangeText={set("minDistance")} keyboardType="numeric" />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field label="from (yyyy-mm-dd)" value={q.from} onChangeText={set("from")} /></View>
            <View style={{ flex: 1 }}><Field label="to (yyyy-mm-dd)" value={q.to} onChangeText={set("to")} /></View>
          </View>
        </View>
      )}

      <Button title={busy ? "searching…" : "search"} onPress={run} disabled={busy} />
      {results && <Text style={styles.count}>{results.length} result(s)</Text>}
      {results && results.map((p) => <PostCard key={p._id} post={p} onDeleted={() => run()} />)}
    </View>
  );
}

// ---- Groups: free-text name by default; advanced adds sport + privacy + minMembers ----
function GroupSearch({ navigation }) {
  const [q, setQ] = useState({ name: "", sportType: "", privacy: "", minMembers: "" });
  const [advanced, setAdvanced] = useState(false);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setQ({ ...q, [k]: v });

  const run = async () => {
    setBusy(true);
    try {
      const active = advanced ? q : { name: q.name };
      const params = Object.fromEntries(Object.entries(active).filter(([, v]) => v !== ""));
      setResults(await groupApi.search(params));
    } catch { setResults([]); }
    finally { setBusy(false); }
  };

  return (
    <View>
      <Field label="search groups" value={q.name} onChangeText={set("name")} placeholder="type a group name…" />

      <AdvancedToggle open={advanced} onPress={() => setAdvanced(!advanced)} />
      {advanced && (
        <View style={styles.advanced}>
          <SportChips value={q.sportType} onChange={set("sportType")} />
          <Text style={styles.label}>privacy</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {["", "public", "private"].map((p) => (
              <Pressable key={p || "any"} onPress={() => set("privacy")(p)} style={[styles.chip, q.privacy === p && styles.chipOn]}>
                <Text style={[styles.chipText, q.privacy === p && { color: "#fff" }]}>{p || "any"}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="min members" value={q.minMembers} onChangeText={set("minMembers")} keyboardType="numeric" />
        </View>
      )}

      <Button title={busy ? "searching…" : "search"} onPress={run} disabled={busy} />
      {results && <Text style={styles.count}>{results.length} result(s)</Text>}
      {results && results.map((g) => (
        <Pressable key={g._id} style={styles.groupCard} onPress={() => navigation.navigate("GroupDetail", { id: g._id })}>
          <Text style={styles.groupName}>{g.name}</Text>
          <Text style={styles.muted}>{g.sportType} · {g.privacy === "private" ? "🔒 private" : "🌍 public"} · {g.members?.length || 0} members</Text>
          {!!g.description && <Text style={styles.muted}>{g.description}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

function AdvancedToggle({ open, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.advBtn}>
      <Text style={styles.advText}>{open ? "▴ hide advanced search" : "🎛️ advanced search"}</Text>
    </Pressable>
  );
}

function SportChips({ value, onChange }) {
  return (
    <View>
      <Text style={styles.label}>sport type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <Pressable onPress={() => onChange("")} style={[styles.chip, value === "" && styles.chipOn]}>
          <Text style={[styles.chipText, value === "" && { color: "#fff" }]}>any</Text>
        </Pressable>
        {SPORT_TYPES.map((s) => (
          <Pressable key={s} onPress={() => onChange(s)} style={[styles.chip, value === s && styles.chipOn]}>
            <Text style={[styles.chipText, value === s && { color: "#fff" }]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 12 },
  toggle: { flexDirection: "row", backgroundColor: colors.card, borderRadius: radius.pill, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: "center" },
  toggleOn: { backgroundColor: colors.primary },
  toggleText: { color: colors.muted, fontWeight: "700" },
  advBtn: { paddingVertical: 8, marginBottom: 10 },
  advText: { color: colors.primary, fontWeight: "700" },
  advanced: { borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: 12, marginBottom: 6 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6, fontWeight: "600" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.06)", marginRight: 8 },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  count: { color: colors.muted, marginVertical: 10 },
  groupCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  groupName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  muted: { color: colors.muted, marginTop: 4 },
});
