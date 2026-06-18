// src/components/PostCard.js — one post: media (image/video), workout stats, likes, comments.
import { useState } from "react";
import { View, Text, Image, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import Avatar from "./Avatar";
import { postApi } from "../api/endpoints";
import { mediaUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

export default function PostCard({ post, onChanged, onDeleted }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.some((id) => String(id) === String(user._id)) || false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");

  const isOwner = String(post.author?._id) === String(user._id) || user.role === "admin";
  const w = post.workout || {};
  const hasWorkout = w.sportType || w.durationMin || w.distanceKm || w.calories;

  const like = async () => {
    try {
      const res = await postApi.like(post._id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const updated = await postApi.comment(post._id, commentText);
      setComments(updated.comments);
      setCommentText("");
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const remove = () => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await postApi.remove(post._id); onDeleted && onDeleted(post._id); }
          catch (e) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Pressable style={styles.author} onPress={() => navigation.navigate("UserProfile", { id: post.author?._id })}>
          <Avatar url={post.author?.avatarUrl} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.name}>{post.author?.name}</Text>
            <Text style={styles.muted}>
              @{post.author?.username}
              {post.group ? `  ·  ${post.group.name}` : ""}
            </Text>
            <Text style={styles.time}>{new Date(post.createdAt).toLocaleString()}</Text>
          </View>
        </Pressable>
        {isOwner && (
          <Pressable onPress={remove}><Text style={styles.delete}>🗑️</Text></Pressable>
        )}
      </View>

      {!!post.text && <Text style={styles.text}>{post.text}</Text>}

      {post.mediaType === "video" && post.mediaUrl ? (
        <Video
          source={{ uri: mediaUrl(post.mediaUrl) }}
          style={styles.media}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      ) : null}
      {(post.mediaType === "image" || post.mediaType === "drawing") && post.mediaUrl ? (
        <Image source={{ uri: mediaUrl(post.mediaUrl) }} style={styles.media} resizeMode="cover" />
      ) : null}

      {hasWorkout && (
        <View style={styles.chips}>
          {w.sportType ? <Chip>{`🏅 ${w.sportType}`}</Chip> : null}
          {w.durationMin ? <Chip>{`⏱ ${w.durationMin} min`}</Chip> : null}
          {w.distanceKm ? <Chip>{`📍 ${w.distanceKm} km`}</Chip> : null}
          {w.calories ? <Chip>{`🔥 ${w.calories} cal`}</Chip> : null}
        </View>
      )}

      <View style={styles.foot}>
        <Pressable onPress={like} style={[styles.likeBtn, liked && styles.likeBtnOn]}>
          <Text style={[styles.likeText, liked && { color: colors.primary }]}>♥ {likes}</Text>
        </Pressable>
        <Text style={styles.muted}>{comments.length} comments</Text>
      </View>

      {comments.map((c, i) => (
        <Text key={c._id || i} style={styles.comment}>
          <Text style={{ fontWeight: "700", color: colors.text }}>{c.author?.username || "user"}: </Text>
          {c.text}
        </Text>
      ))}

      <View style={styles.commentForm}>
        <TextInput
          style={styles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="write a comment…"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
        <Pressable onPress={addComment} style={styles.sendBtn}><Text style={styles.sendText}>send</Text></Pressable>
      </View>
    </View>
  );
}

function Chip({ children }) {
  return <View style={styles.chip}><Text style={styles.chipText}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  author: { flexDirection: "row", flex: 1 },
  name: { color: colors.text, fontWeight: "700", fontSize: 15 },
  muted: { color: colors.muted, fontSize: 12 },
  time: { color: colors.muted, fontSize: 11, marginTop: 2 },
  delete: { fontSize: 18 },
  text: { color: "#e9eaec", marginTop: 10, lineHeight: 21, fontSize: 15 },
  media: { width: "100%", height: 220, borderRadius: radius.sm, marginTop: 10, backgroundColor: "#000" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  chipText: { color: "#e5e5e5", fontSize: 12 },
  foot: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 },
  likeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.06)" },
  likeBtnOn: { backgroundColor: "rgba(255,87,34,0.18)" },
  likeText: { color: colors.text, fontWeight: "700" },
  comment: { color: "#d6d8db", fontSize: 13, marginTop: 6 },
  commentForm: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  commentInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, color: colors.text },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
