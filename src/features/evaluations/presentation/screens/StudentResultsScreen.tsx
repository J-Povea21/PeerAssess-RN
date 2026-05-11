// src/features/evaluations/presentation/screens/StudentResultsScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { StudentResult } from "@/src/features/evaluations/domain/entities/StudentResult";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import LogoBox from "@/src/core/components/LogoBox";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Segment = { text: string; bold: boolean };

function generateAutoFeedback(result: StudentResult): Segment[] {
  if (result.criteriaAverages.length === 0) return [];
  const sorted = [...result.criteriaAverages].sort((a, b) => b.average - a.average);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const avg = result.averageScore;

  let opener = "";
  if (avg >= 4.5) opener = "¡Excelente desempeño! Tu equipo reconoce tu dedicación y compromiso.";
  else if (avg >= 3.5) opener = "Tuviste un buen desempeño general en esta evaluación.";
  else opener = "Esta evaluación muestra áreas con potencial de mejora.";

  const segments: Segment[] = [{ text: opener, bold: false }];

  segments.push({ text: " Tu fortaleza más destacada fue ", bold: false });
  segments.push({ text: best.criteriaName.toLowerCase(), bold: true });
  segments.push({ text: ` (${best.average.toFixed(1)}/5).`, bold: false });

  if (worst.criteriaId !== best.criteriaId) {
    segments.push({ text: " Considera trabajar en ", bold: false });
    segments.push({ text: worst.criteriaName.toLowerCase(), bold: true });
    segments.push({ text: ` (${worst.average.toFixed(1)}/5) para tu próxima actividad.`, bold: false });
  }

  return segments;
}

export default function StudentResultsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { myResults, isLoadingResults, fetchMyResults } = useEvaluationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

 useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchMyResults(user.id);
    }, [user?.id])
  );

  useEffect(() => {
    if (myResults.length > 0 && selectedId === null) {
      setSelectedId(myResults[0].assessmentId);
    }
  }, [myResults]);

  const selected = useMemo(
    () => myResults.find((r) => r.assessmentId === selectedId) ?? null,
    [myResults, selectedId]
  );

  const feedback = useMemo<Segment[]>(
    () => (selected ? generateAutoFeedback(selected) : []),
    [selected]
  );

  if (isLoadingResults && myResults.length === 0) {
    return (
      <LinearGradient colors={BG_COLORS} style={styles.centered}>
        <ActivityIndicator color={AppColors.olive} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={[styles.appbar, { paddingTop: insets.top }]}>
        <Appbar.Content title="Mis Resultados" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {myResults.length === 0 ? (
        <View style={styles.emptyState}>
          <LogoBox size={72} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No hay resultados disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Aquí verás tus calificaciones cuando{"\n"}una evaluación pública esté completa
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.pickerLabel} numberOfLines={1}>
              {selected?.assessmentTitle ?? "Seleccionar evaluación"}
            </Text>
            <Text style={styles.pickerChevron}>▾</Text>
          </TouchableOpacity>

          {selected && (
            <>
              <View style={styles.scoreBadgeContainer}>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreValue}>{selected.averageScore.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/5.0</Text>
                </View>
                <Text style={styles.assessmentTitle}>{selected.assessmentTitle}</Text>
                <Text style={styles.evalCount}>
                  {selected.evaluationCount}{" "}
                  {selected.evaluationCount === 1
                    ? "compañero te evaluó"
                    : "compañeros te evaluaron"}
                </Text>
              </View>

              {feedback.length > 0 && (
                <View style={styles.feedbackCard}>
                  <Text style={styles.feedbackTitle}>RETROALIMENTACIÓN AUTOMÁTICA</Text>
                  <Text style={styles.feedbackText}>
                    {feedback.map((seg, i) => (
                      <Text
                        key={i}
                        style={seg.bold ? styles.feedbackBold : styles.feedbackText}
                      >
                        {seg.text}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>DETALLE POR CRITERIO</Text>
              {selected.criteriaAverages.map((ca) => (
                <View key={ca.criteriaId} style={styles.criteriaRow}>
                  <View style={styles.criteriaHeader}>
                    <Text style={styles.criteriaName}>{ca.criteriaName}</Text>
                    <Text style={styles.criteriaScore}>{ca.average.toFixed(1)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((ca.average / 5) * 100, 100)}%` as any },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Seleccionar evaluación</Text>
            {myResults.map((r) => (
              <TouchableOpacity
                key={r.assessmentId}
                style={[
                  styles.modalItem,
                  r.assessmentId === selectedId && styles.modalItemSelected,
                ]}
                onPress={() => {
                  setSelectedId(r.assessmentId);
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    r.assessmentId === selectedId && styles.modalItemTextSelected,
                  ]}
                >
                  {r.assessmentTitle}
                </Text>
                <Text style={styles.modalItemScore}>{r.averageScore.toFixed(1)}/5.0</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: AppColors.textDark },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textMuted,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerLabel: { flex: 1, fontSize: 14, color: AppColors.textDark, fontWeight: "500" },
  pickerChevron: { fontSize: 14, color: AppColors.textMuted, marginLeft: 8 },
  scoreBadgeContainer: { alignItems: "center", marginBottom: 20 },
  scoreBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.wheat,
    borderWidth: 3,
    borderColor: AppColors.olive,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "700",
    color: AppColors.textDark,
    lineHeight: 34,
  },
  scoreMax: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 14,
    marginTop: 2,
  },
  assessmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textDark,
    textAlign: "center",
  },
  evalCount: { fontSize: 13, color: AppColors.textMuted, marginTop: 4 },
  feedbackCard: {
    backgroundColor: AppColors.beige,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  feedbackText: { fontSize: 14, color: "#2A2A2A", lineHeight: 20 },
  feedbackBold: { fontSize: 14, fontWeight: "700", color: "#2A2A2A", lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  criteriaRow: { marginBottom: 14 },
  criteriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  criteriaName: { fontSize: 14, color: AppColors.textDark, fontWeight: "500" },
  criteriaScore: { fontSize: 14, color: AppColors.olive, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: AppColors.beige,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: AppColors.olive, borderRadius: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textDark,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalItemSelected: { backgroundColor: AppColors.olive + "1F" },
  modalItemText: { fontSize: 14, color: AppColors.textDark, flex: 1 },
  modalItemTextSelected: { color: AppColors.olive, fontWeight: "600" },
  modalItemScore: { fontSize: 13, color: AppColors.textMuted, fontWeight: "600" },
});
