// src/screens/LoginScreen.js — cinematic login with a looping snowboard video background.
import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Field, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const SNOW_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Looping muted background video (snowboarder).
  const player = useVideoPlayer(SNOW_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const submit = async () => {
    setError("");
    if (!email || !password) return setError("please fill in all fields.");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError((e.message || "login failed").toLowerCase());
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={styles.overlay} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.content}>
        <Text style={styles.brand}>fit<Text style={{ color: colors.primary }}>connect</Text></Text>
        <Text style={styles.tagline}>train · connect · move</Text>

        <View style={styles.card}>
          <Text style={styles.title}>log in</Text>
          <Field label="email or username" value={email} onChangeText={setEmail} placeholder="maya" />
          <Field label="password" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button title={busy ? "logging in…" : "log in"} onPress={submit} disabled={busy} />
          <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 16 }}>
            <Text style={styles.secondary}>new here? <Text style={{ color: "#fff", fontWeight: "700" }}>create account</Text></Text>
          </Pressable>
          <Text style={styles.demo}>demo · maya · 123456</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  brand: { color: "#fff", fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  tagline: { color: "rgba(255,255,255,0.7)", marginBottom: 28, marginTop: 4 },
  card: {
    backgroundColor: "rgba(18,18,21,0.82)", borderWidth: 1, borderColor: colors.border,
    borderRadius: 24, padding: 22,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 16 },
  error: { color: colors.danger, marginBottom: 10, fontWeight: "600" },
  secondary: { color: colors.muted, textAlign: "center" },
  demo: { color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 14, fontSize: 12 },
});
