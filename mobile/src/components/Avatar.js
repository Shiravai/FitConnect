// src/components/Avatar.js — round profile image with an emoji fallback.
import { Image, View, Text } from "react-native";
import { mediaUrl } from "../api/client";
import { colors } from "../theme";

export default function Avatar({ url, size = 42 }) {
  const src = mediaUrl(url);
  if (src) {
    return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: "rgba(255,87,34,0.18)", alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>👤</Text>
    </View>
  );
}
