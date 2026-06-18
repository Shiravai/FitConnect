// src/screens/ChatRoomScreen.js — real-time 1:1 conversation over Socket.io.
import { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { messageApi } from "../api/endpoints";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { colors, radius } from "../theme";

export default function ChatRoomScreen({ route }) {
  const { otherId } = route.params;
  const { user } = useAuth();
  const { setActiveUser, refreshUnread } = useChat();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    setActiveUser(otherId); // stop badging this conversation
    socket.emit("chat:join", { otherUserId: otherId });
    messageApi.history(otherId).then(({ messages }) => setMessages(messages)).catch(() => {});

    const onMessage = (msg) => {
      const senderId = String(msg.sender?._id || msg.sender);
      const otherOfMsg = senderId === String(user._id) ? String(msg.to) : senderId;
      if (otherOfMsg !== String(otherId)) return; // not this conversation
      setMessages((prev) => [...prev, msg]);
      if (senderId !== String(user._id)) messageApi.markRead(otherId).catch(() => {});
    };
    socket.on("chat:message", onMessage);

    return () => {
      socket.off("chat:message", onMessage);
      setActiveUser(null);
      refreshUnread();
    };
  }, [otherId]);

  const send = () => {
    if (!text.trim()) return;
    getSocket().emit("chat:message", { otherUserId: otherId, text });
    setText("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, i) => m._id || String(i)}
        contentContainerStyle={{ padding: 14 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = String(item.sender?._id || item.sender) === String(user._id);
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubbleText, mine && { color: "#fff" }]}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="type a message…" placeholderTextColor="rgba(255,255,255,0.3)" />
        <Pressable onPress={send} style={styles.send}><Text style={styles.sendText}>send</Text></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, marginBottom: 8 },
  mine: { backgroundColor: colors.primary, alignSelf: "flex-end" },
  theirs: { backgroundColor: "rgba(255,255,255,0.08)", alignSelf: "flex-start" },
  bubbleText: { color: colors.text, fontSize: 15 },
  inputRow: { flexDirection: "row", padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10, color: colors.text },
  send: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: radius.pill },
  sendText: { color: "#fff", fontWeight: "800" },
});
