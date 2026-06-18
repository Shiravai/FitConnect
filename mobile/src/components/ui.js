// src/components/ui.js — small reusable building blocks (dark sporty theme).
import { Text, TextInput, Pressable, View, ActivityIndicator, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

export function Button({ title, onPress, variant = "primary", small, disabled, style }) {
  const base = [styles.btn, small && styles.btnSmall, variantStyle[variant], disabled && styles.btnDisabled, style];
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [...base, pressed && !disabled && styles.pressed]}>
      <Text style={[styles.btnText, variant === "ghost" && styles.btnTextGhost, small && styles.btnTextSmall]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = "none", multiline }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && { height: 90, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.32)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ children, color }) {
  return (
    <View style={[styles.chip, color === "success" && { backgroundColor: "rgba(95,208,122,0.18)" }]}>
      <Text style={[styles.chipText, color === "success" && { color: colors.success }]}>{children}</Text>
    </View>
  );
}

export function Loading({ label = "loading…" }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={{ color: colors.muted, marginTop: 12 }}>{label}</Text>
    </View>
  );
}

const variantStyle = {
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
};

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 14 },
  btnDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnTextGhost: { color: "#fff" },
  btnTextSmall: { fontSize: 13 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15,
  },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  chip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  chipText: { color: "#e5e5e5", fontSize: 12 },
});

export { styles as uiStyles };
