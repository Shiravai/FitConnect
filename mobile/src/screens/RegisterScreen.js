// src/screens/RegisterScreen.js
import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Field, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", favoriteSport: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const validate = () => {
    if (!form.name.trim()) return "name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "enter a valid email.";
    if (form.username.trim().length < 3) return "username must be at least 3 characters.";
    if (form.password.length < 6) return "password must be at least 6 characters.";
    return "";
  };

  const submit = async () => {
    const v = validate();
    if (v) return setError(v);
    setBusy(true);
    setError("");
    try {
      await register(form);
    } catch (e) {
      setError((e.message || "registration failed").toLowerCase());
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>join fit<Text style={{ color: colors.primary }}>connect</Text></Text>
      <View style={styles.card}>
        <Field label="full name" value={form.name} onChangeText={set("name")} autoCapitalize="words" />
        <Field label="email" value={form.email} onChangeText={set("email")} keyboardType="email-address" />
        <Field label="username" value={form.username} onChangeText={set("username")} />
        <Field label="password" value={form.password} onChangeText={set("password")} secureTextEntry />
        <Field label="favorite sport" value={form.favoriteSport} onChangeText={set("favoriteSport")} placeholder="Running" />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title={busy ? "creating…" : "create account"} onPress={submit} disabled={busy} />
        <Pressable onPress={() => navigation.navigate("Login")} style={{ marginTop: 16 }}>
          <Text style={styles.secondary}>already a member? <Text style={{ color: "#fff", fontWeight: "700" }}>log in</Text></Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  brand: { color: "#fff", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 20 },
  error: { color: colors.danger, marginBottom: 10, fontWeight: "600" },
  secondary: { color: colors.muted, textAlign: "center" },
});
