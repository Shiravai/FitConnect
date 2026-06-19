// src/screens/CreatePostScreen.js — create a post with text, image/video, group and workout stats.
import { useState, useCallback } from "react";
import { View, Text, ScrollView, Image, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { Field, Button } from "../components/ui";
import { postApi, groupApi, SPORT_TYPES } from "../api/endpoints";
import { uploadAsset, mediaUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function CreatePostScreen({ navigation }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [groupId, setGroupId] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [mediaUrlState, setMediaUrlState] = useState("");
  const [mediaType, setMediaType] = useState("none");
  const [sport, setSport] = useState(user.favoriteSport || "");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      groupApi.list().then((all) =>
        setMyGroups(all.filter((g) => g.members?.some((m) => String(m) === String(user._id)) || String(g.owner?._id || g.owner) === String(user._id)))
      ).catch(() => {});
    }, [user._id])
  );

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow photo access to add media.");
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    const kind = asset.type === "video" ? "video" : "image";
    try {
      setBusy(true);
      const { url } = await uploadAsset(asset.uri, kind);
      setMediaUrlState(url);
      setMediaType(kind);
    } catch (e) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!text.trim() && !mediaUrlState) return Alert.alert("Empty post", "Add some text or media first.");
    setBusy(true);
    try {
      await postApi.create({
        text,
        group: groupId || null,
        mediaType,
        mediaUrl: mediaUrlState,
        workout: {
          sportType: sport || "",
          durationMin: Number(duration) || 0,
          distanceKm: Number(distance) || 0,
          calories: Number(calories) || 0,
        },
      });
      // reset
      setText(""); setMediaUrlState(""); setMediaType("none"); setGroupId("");
      setDuration(""); setDistance(""); setCalories("");
      navigation.navigate("Feed");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>new post</Text>

        <Field label="what did you do today?" value={text} onChangeText={setText} placeholder="share your workout…" multiline />

        <Text style={styles.label}>post to group (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <Selectable label="public" active={!groupId} onPress={() => setGroupId("")} />
          {myGroups.map((g) => <Selectable key={g._id} label={g.name} active={groupId === g._id} onPress={() => setGroupId(g._id)} />)}
        </ScrollView>

        <Pressable style={styles.pickBtn} onPress={pick}>
          <Text style={styles.pickText}>📷 add photo / 🎬 video</Text>
        </Pressable>

        {!!mediaUrlState && (
          <View style={{ marginVertical: 10 }}>
            {mediaType === "video" ? (
              <PreviewVideo uri={mediaUrl(mediaUrlState)} />
            ) : (
              <Image source={{ uri: mediaUrl(mediaUrlState) }} style={styles.preview} />
            )}
            <Pressable onPress={() => { setMediaUrlState(""); setMediaType("none"); }}>
              <Text style={{ color: colors.muted, marginTop: 6 }}>remove media</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.label}>workout stats (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {SPORT_TYPES.map((s) => <Selectable key={s} label={s} active={sport === s} onPress={() => setSport(sport === s ? "" : s)} />)}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Field label="duration (min)" value={duration} onChangeText={setDuration} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Field label="distance (km)" value={distance} onChangeText={setDistance} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Field label="calories" value={calories} onChangeText={setCalories} keyboardType="numeric" /></View>
        </View>

        <Button title={busy ? "posting…" : "publish"} onPress={submit} disabled={busy} />
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PreviewVideo({ uri }) {
  const player = useVideoPlayer(uri, (p) => { p.loop = true; });
  return <VideoView player={player} style={styles.preview} contentFit="contain" nativeControls />;
}

function Selectable({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.sel, active && styles.selOn]}>
      <Text style={[styles.selText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 14 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6, fontWeight: "600" },
  pickBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", borderRadius: radius.pill, paddingVertical: 12, alignItems: "center" },
  pickText: { color: "#fff", fontWeight: "600" },
  preview: { width: "100%", height: 220, borderRadius: radius.sm, backgroundColor: "#000" },
  sel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.06)", marginRight: 8 },
  selOn: { backgroundColor: colors.primary },
  selText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
});
