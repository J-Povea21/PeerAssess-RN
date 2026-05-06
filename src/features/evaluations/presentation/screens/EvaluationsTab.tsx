// src/features/evaluations/presentation/screens/EvaluationsTab.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { PendingAssessment } from "@/src/features/evaluations/domain/repositories/EvaluationRepository";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";

type Props = { courseId: string; navigation: any };

function formatDeadline(isoDate: string): string {
  const d = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export default function EvaluationsTab({ courseId, navigation }: Props) {
  const { user } = useAuthStore();
  const { pendingAssessments, isLoadingPending, fetchPendingAssessments, fetchCriteria } =
    useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();

  useEffect(() => {
    if (user?.id) fetchPendingAssessments(user.id);
    fetchCategories(courseId);
  }, [user?.id, courseId]);

  const categoryIds = useMemo(
    () => new Set((categoriesByCourse[courseId] ?? []).map((c) => c._id)),
    [categoriesByCourse, courseId]
  );

  const courseAssessments = useMemo(
    () => pendingAssessments.filter((pa) => categoryIds.has(pa.assessment.categoryId)),
    [pendingAssessments, categoryIds]
  );

  const handleStartEvaluation = async (pa: PendingAssessment) => {
    await fetchCriteria(pa.assessment._id);
    const criteria =
      useEvaluationStore.getState().criteriaByAssessment[pa.assessment._id] ?? [];
    navigation.navigate("EvaluationForm", {
      assessmentId: pa.assessment._id,
      assessmentTitle: pa.assessment.title,
      deadline: pa.assessment.deadline,
      peers: pa.peers,
      criteria,
      evaluatorId: user?.id ?? "",
    });
  };

  if (isLoadingPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={AppColors.olive} />
      </View>
    );
  }

  if (courseAssessments.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons
          name="clipboard-check-outline"
          size={48}
          color={AppColors.textMuted}
          style={{ opacity: 0.5 }}
        />
        <Text style={styles.emptyText}>No hay evaluaciones pendientes</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {courseAssessments.map((pa) => {
        const isExpired = new Date(pa.assessment.deadline) < new Date();
        const canEvaluate = pa.peers.length > 0 && !isExpired;

        return (
          <TouchableOpacity
            key={pa.assessment._id}
            style={[styles.card, !canEvaluate && styles.cardDisabled]}
            activeOpacity={canEvaluate ? 0.7 : 1}
            onPress={() => canEvaluate && handleStartEvaluation(pa)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {pa.assessment.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isExpired
                      ? AppColors.textMuted + "1F"
                      : AppColors.olive + "1F",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: isExpired ? AppColors.textMuted : AppColors.olive },
                  ]}
                >
                  {isExpired ? "Cerrada" : "Activa"}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name={pa.assessment.visibility === "public" ? "eye-outline" : "lock-outline"}
                size={14}
                color={AppColors.textMuted}
              />
              <Text style={styles.metaText}>
                {pa.assessment.visibility === "public" ? "Pública" : "Privada"}
              </Text>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={AppColors.textMuted}
                style={{ marginLeft: 12 }}
              />
              <Text style={styles.metaText}>
                {formatDuration(pa.assessment.timeWindowMinutes)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={14}
                color={AppColors.textMuted}
              />
              <Text style={styles.metaText}>{formatDeadline(pa.assessment.deadline)}</Text>
            </View>

            <View style={styles.actionRow}>
              {canEvaluate ? (
                <View style={[styles.actionBadge, { backgroundColor: AppColors.olive + "1F" }]}>
                  <Text style={[styles.actionText, { color: AppColors.olive }]}>Evaluar →</Text>
                </View>
              ) : (
                <View
                  style={[styles.actionBadge, { backgroundColor: AppColors.textMuted + "1F" }]}
                >
                  <MaterialCommunityIcons name="check" size={12} color={AppColors.textMuted} />
                  <Text style={[styles.actionText, { color: AppColors.textMuted }]}>
                    {" "}Evaluado
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: { fontSize: 14, color: AppColors.textMuted, marginTop: 12, textAlign: "center" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: { opacity: 0.7 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: AppColors.textDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  metaText: { fontSize: 12, color: AppColors.textMuted, marginLeft: 4 },
  actionRow: { marginTop: 8, flexDirection: "row" },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: { fontSize: 12, fontWeight: "600" },
});
