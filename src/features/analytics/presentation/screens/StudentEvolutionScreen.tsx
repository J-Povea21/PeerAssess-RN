// src/features/analytics/presentation/screens/StudentEvolutionScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GroupBarChart from "@/src/features/analytics/presentation/components/GroupBarChart";
import { useAnalyticsStore } from "@/src/features/analytics/presentation/store/useAnalyticsStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = {
  navigation: any;
  route: { params: { studentId: string; fullName: string; categoryIds: string[] } };
};

export default function StudentEvolutionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { studentId, fullName, categoryIds } = route.params;
  const { evolution, isLoadingEvolution, fetchStudentEvolution } = useAnalyticsStore();

  useEffect(() => {
    fetchStudentEvolution(categoryIds, studentId);
  }, [studentId]);

  const trend = useMemo(() => {
    const points = evolution?.points ?? [];
    if (points.length < 2) return null;
    const delta = points[points.length - 1].average - points[0].average;
    return delta;
  }, [evolution]);

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={[styles.appbar, { paddingTop: insets.top }]}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title={fullName} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {isLoadingEvolution && !evolution ? (
        <ActivityIndicator color={AppColors.olive} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Evolución a lo largo del curso</Text>

          {(evolution?.points ?? []).length === 0 ? (
            <Text style={styles.muted}>
              Este estudiante aún no tiene resultados de evaluaciones en el curso.
            </Text>
          ) : (
            <>
              {trend !== null && (
                <View style={styles.trendCard}>
                  <Text style={styles.trendLabel}>TENDENCIA</Text>
                  <Text
                    style={[
                      styles.trendValue,
                      { color: trend >= 0 ? AppColors.olive : AppColors.rose },
                    ]}
                  >
                    {trend >= 0 ? "▲ +" : "▼ "}
                    {trend.toFixed(1)} pts
                  </Text>
                  <Text style={styles.trendSub}>
                    Entre la primera y la última evaluación
                  </Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>PROMEDIO POR EVALUACIÓN</Text>
              <GroupBarChart
                data={(evolution?.points ?? []).map((p) => ({
                  key: p.assessmentId,
                  label: p.assessmentTitle,
                  value: p.average,
                }))}
              />

              <Text style={styles.sectionLabel}>DETALLE</Text>
              {(evolution?.points ?? []).map((p) => (
                <View key={p.assessmentId} style={styles.row}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {p.assessmentTitle}
                  </Text>
                  <Text style={styles.rowScore}>{p.average.toFixed(1)}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: AppColors.textDark },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  subtitle: { fontSize: 13, color: AppColors.textMuted, marginBottom: 16 },
  muted: { fontSize: 13, color: AppColors.textMuted, marginTop: 20, lineHeight: 20 },
  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
  },
  trendValue: { fontSize: 26, fontWeight: "700", marginTop: 6 },
  trendSub: { fontSize: 12, color: AppColors.textMuted, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  rowTitle: { flex: 1, fontSize: 14, color: AppColors.textDark, marginRight: 12 },
  rowScore: { fontSize: 15, fontWeight: "700", color: AppColors.olive },
});
