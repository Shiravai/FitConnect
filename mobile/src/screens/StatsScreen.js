// src/screens/StatsScreen.js — live community statistics with SVG + d3 charts.
import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Chart from "../components/Chart";
import { statsApi } from "../api/endpoints";
import { colors, radius } from "../theme";

export default function StatsScreen() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      statsApi.overview().then(setData).catch((e) => setError(e.message));
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Text style={styles.title}>community statistics</Text>
        <Text style={styles.muted}>live charts from the database (d3 + svg)</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!data ? (
          <Text style={styles.muted}>loading charts…</Text>
        ) : (
          <>
            <View style={styles.card}><Chart type="bar" title="posts per sport type" data={data.bySport} /></View>
            <View style={styles.card}><Chart type="line" title="calories burned per month" data={data.caloriesByMonth} /></View>
            <View style={styles.card}><Chart type="pie" title="posts per group" data={data.byGroup} /></View>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  muted: { color: colors.muted, marginTop: 4, marginBottom: 12 },
  error: { color: colors.danger, marginVertical: 8 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 12, alignItems: "center" },
});
