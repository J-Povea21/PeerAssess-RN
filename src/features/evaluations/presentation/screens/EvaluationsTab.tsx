// src/features/evaluations/presentation/screens/EvaluationsTab.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { CourseAssessment } from "@/src/features/evaluations/domain/repositories/EvaluationRepository";
import { Assessment } from "@/src/features/evaluations/domain/entities/Assessment";
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
  const { courseAssessments, allCourseAssessments, isLoadingCourseAssessments, isLoadingAllCourseAssessments, fetchAssessmentsForCourse, fetchAllAssessmentsForCourse, fetchCriteria } =
    useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();

  const [now, setNow] = useState(() => new Date());

  const categoryIds = useMemo(
    () => (categoriesByCourse[courseId] ?? []).map((c) => c._id),
    [categoriesByCourse, courseId]
  );

  useEffect(() => {
    fetchCategories(courseId);
  }, [courseId]);

  useEffect(() => {
    if (user?.id && categoryIds.length > 0) {
      fetchAssessmentsForCourse(user.id, categoryIds);
    }
  }, [user?.id, categoryIds]);

  useEffect(() => {
    if (user?.role === "teacher" && categoryIds.length > 0) {
      fetchAllAssessmentsForCourse(categoryIds);
    }
  }, [user?.role, categoryIds]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleStartEvaluation = async (ca: CourseAssessment) => {
    await fetchCriteria(ca.assessment._id);
    const criteria =
      useEvaluationStore.getState().criteriaByAssessment[ca.assessment._id] ?? [];
    navigation.navigate("EvaluationForm", {
      assessmentId: ca.assessment._id,
      assessmentTitle: ca.assessment.title,
      deadline: ca.assessment.deadline,
      peers: ca.pendingPeers,
      criteria,
      evaluatorId: user?.id ?? "",
    });
  };

const isTeacher = user?.role === "teacher";
  const isLoading = isTeacher ? isLoadingAllCourseAssessments : isLoadingCourseAssessments;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={AppColors.olive} />
      </View>
    );
  }

  if (!isTeacher && courseAssessments.length === 0) {
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

  if (isTeacher && allCourseAssessments.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons
          name="clipboard-check-outline"
          size={48}
          color={AppColors.textMuted}
          style={{ opacity: 0.5 }}
        />
        <Text style={styles.emptyText}>No hay evaluaciones en este curso</Text>
        <FAB
          icon="plus"
          label="Nueva evaluación"
          style={styles.fab}
          color="#FFFFFF"
          onPress={() => navigation.navigate("CreateAssessment", { courseId })}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isTeacher
          ? allCourseAssessments.map((assessment) => {
              const isExpired = new Date(assessment.deadline) < now;
              return (
                <View key={assessment._id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {assessment.title}
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
                      name={assessment.visibility === "public" ? "eye-outline" : "lock-outline"}
                      size={14}
                      color={AppColors.textMuted}
                    />
                    <Text style={styles.metaText}>
                      {assessment.visibility === "public" ? "Pública" : "Privada"}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color={AppColors.textMuted}
                      style={{ marginLeft: 12 }}
                    />
                    <Text style={styles.metaText}>
                      {formatDuration(assessment.timeWindowMinutes)}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={AppColors.textMuted}
                    />
                    <Text style={styles.metaText}>{formatDeadline(assessment.deadline)}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBadge, { backgroundColor: isExpired ? AppColors.textMuted + "1F" : AppColors.olive + "1F" }]}
                    >
                      <Text style={[styles.actionText, { color: isExpired ? AppColors.textMuted : AppColors.olive }]}>
                        {isExpired ? "Cerrar" : "Abrir"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          : courseAssessments.map((ca) => {
              const isExpired = new Date(ca.assessment.deadline) < now;
              const canEvaluate = ca.pendingPeers.length > 0 && !isExpired;
              const fullyEvaluated = ca.evaluatedPeerCount === ca.totalPeerCount && ca.totalPeerCount > 0;

              return (
                <TouchableOpacity
                  key={ca.assessment._id}
                  style={[styles.card, !canEvaluate && styles.cardDisabled]}
                  activeOpacity={canEvaluate ? 0.7 : 1}
                  onPress={() => canEvaluate && handleStartEvaluation(ca)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {ca.assessment.title}
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
                      name={ca.assessment.visibility === "public" ? "eye-outline" : "lock-outline"}
                      size={14}
                      color={AppColors.textMuted}
                    />
                    <Text style={styles.metaText}>
                      {ca.assessment.visibility === "public" ? "Pública" : "Privada"}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color={AppColors.textMuted}
                      style={{ marginLeft: 12 }}
                    />
                    <Text style={styles.metaText}>
                      {formatDuration(ca.assessment.timeWindowMinutes)}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={14}
                      color={AppColors.textMuted}
                    />
                    <Text style={styles.metaText}>{formatDeadline(ca.assessment.deadline)}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    {canEvaluate ? (
                      <View style={[styles.actionBadge, { backgroundColor: AppColors.olive + "1F" }]}>
                        <Text style={[styles.actionText, { color: AppColors.olive }]}>
                          Evaluar → ({ca.pendingPeers.length} pendiente{ca.pendingPeers.length !== 1 ? "s" : ""})
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.actionBadge, { backgroundColor: AppColors.textMuted + "1F" }]}>
                        <MaterialCommunityIcons name="check" size={12} color={AppColors.textMuted} />
                        <Text style={[styles.actionText, { color: AppColors.textMuted }]}>
                          {" "}{fullyEvaluated ? "Evaluado ✓" : "Sin compañeros"}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
      </ScrollView>
      {isTeacher && (
        <FAB
          icon="plus"
          label="Nueva evaluación"
          style={styles.fab}
          color="#FFFFFF"
          onPress={() => navigation.navigate("CreateAssessment", { courseId })}
        />
      )}
    </View>
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: AppColors.olive,
  },
});
