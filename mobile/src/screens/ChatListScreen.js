// src/screens/ChatListScreen.js — pick a contact to chat with (shows unread badges).
import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { messageApi } from "../api/endpoints";
import { useChat } from "../context/ChatContext";
import { colors, radius } from "../theme";

export default function ChatListScreen({ navigation }) {
  const { unread, refreshUnread } = useChat();
  const [contacts, setContacts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      messageApi.contacts().then(setContacts).catch(() => {});
      refreshUnread();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Text style={styles.title}>chat</Text>
      <FlatList
        data={contacts}
        keyExtractor={(c) => c._id}
        contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => {
          const count = unread[String(item._id)] || 0;
          return (
            <Pressable style={styles.row} onPress={() => navigation.navigate("ChatRoom", { otherId: item._id, name: item.name })}>
              <Avatar url={item.avatarUrl} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muted}>@{item.username}</Text>
              </View>
              {count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800", padding: 16 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, marginBottom: 10 },
  name: { color: colors.text, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 12 },
  badge: { backgroundColor: colors.danger, minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
});
