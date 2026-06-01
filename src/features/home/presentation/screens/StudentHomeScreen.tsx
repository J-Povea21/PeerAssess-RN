import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { Course } from "@/src/features/courses/domain/entities/Course";
import PendingBanner from "@/src/features/courses/presentation/components/PendingBanner";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { PendingAssessment } from "@/src/features/evaluations/domain/repositories/EvaluationRepository";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import LogoBox from "@/src/core/components/LogoBox";
import { HomeStackParamList } from "@/src/navigation/HomeStackNavigator";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export default function StudentHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { courses, isLoading, fetchCoursesByStudent } = useCourseStore();
  const {
    myResults,
    pendingAssessments,
    fetchMyResults,
    fetchPendingAssessments,
    fetchCriteria,
  } = useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchCoursesByStudent(user.id);
        fetchMyResults(user.id);
        fetchPendingAssessments(user.id);
      }
    }, [user?.id])
  );

  // Load categories for each enrolled course so pending assessments can be linked back to a course.
  useEffect(() => {
    courses.forEach((c) => {
      if (!(c._id in categoriesByCourse)) fetchCategories(c._id);
    });
  }, [courses]);

  const courseByCategoryId = useMemo(() => {
    const map = new Map<string, Course>();
    for (const course of courses) {
      const cats = categoriesByCourse[course._id] ?? [];
      for (const cat of cats) map.set(cat._id, course);
    }
    return map;
  }, [courses, categoriesByCourse]);

  const pendingCourseCount = useMemo<number>(() => {
    const seen = new Set<string>();
    for (const pa of pendingAssessments) {
      const c = courseByCategoryId.get(pa.assessment.categoryId);
      if (c) seen.add(c._id);
    }
    return seen.size;
  }, [pendingAssessments, courseByCategoryId]);

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

  const recentResults = myResults.slice(0, 3);

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  if (isLoading && courses.length === 0) {
    return (
      <LinearGradient colors={BG_COLORS} style={styles.centered}>
        <ActivityIndicator color={AppColors.olive} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: greeting + initials avatar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{user?.name ?? ""}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Pending evaluation alert banner */}
        {pendingCourseCount > 0 && <PendingBanner courseCount={pendingCourseCount} />}

        {/* Pending evaluations section */}
        <Text style={styles.sectionLabel}>EVALUACIONES PENDIENTES</Text>

        {pendingAssessments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={48}
              color={AppColors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              No ha habido evaluaciones pendientes
            </Text>
          </View>
        ) : (
          pendingAssessments.map((pa) => {
            const course = courseByCategoryId.get(pa.assessment.categoryId);
            const peerCount = pa.peers.length;
            return (
              <TouchableOpacity
                key={pa.assessment._id}
                style={styles.pendingCard}
                activeOpacity={0.7}
                onPress={() => handleStartEvaluation(pa)}
              >
                <View style={styles.pendingCardHeader}>
                  <Text style={styles.pendingTitle} numberOfLines={2}>
                    {pa.assessment.title}
                  </Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>
                      {peerCount} pendiente{peerCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                {course && (
                  <Text style={styles.pendingCourse} numberOfLines={1}>
                    {course.name}
                  </Text>
                )}
                <View style={styles.pendingCta}>
                  <Text style={styles.pendingCtaText}>Evaluar →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Recent results section */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          RESULTADOS RECIENTES
        </Text>

        {recentResults.length === 0 ? (
          <View style={styles.noResultsCard}>
            <LogoBox size={64} style={styles.noResultsLogo} />
            <Text style={styles.noResultsTitle}>No hay resultados recientes</Text>
            <Text style={styles.noResultsSubtitle}>
              Aquí aparecerán tus calificaciones cuando{"\n"}se publiquen los resultados
            </Text>
          </View>
        ) : (
          recentResults.map((result) => (
            <View key={result.assessmentId} style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <View style={styles.resultCardTitleBlock}>
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {result.assessmentTitle}
                  </Text>
                  <Text style={styles.resultPublicLabel}>Resultado público</Text>
                </View>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultScoreValue}>{result.averageScore.toFixed(1)}</Text>
                  <Text style={styles.resultScoreMax}> / 5.0</Text>
                </View>
              </View>
              {result.criteriaAverages.map((ca) => (
                <View key={ca.criteriaId} style={styles.resultCriteriaRow}>
                  <Text style={styles.resultCriteriaName}>{ca.criteriaName}</Text>
                  <View style={styles.resultProgressTrack}>
                    <View
                      style={[
                        styles.resultProgressFill,
                        { width: `${Math.min((ca.average / 5) * 100, 100)}%` as any },
                      ]}
                    />
                  </View>
                  <Text style={styles.resultCriteriaScore}>{ca.average.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <FAB
        icon="account-group-outline"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => navigation.navigate("JoinCourse")}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 88,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: AppColors.textMuted,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: AppColors.textDark,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.olive,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionLabelSpaced: {
    marginTop: 28,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  pendingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.salmon,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pendingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  pendingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.textDark,
  },
  pendingBadge: {
    backgroundColor: AppColors.salmon + "29",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingBadgeText: { fontSize: 11, fontWeight: "600", color: AppColors.salmon },
  pendingCourse: { fontSize: 12, color: AppColors.textMuted, marginBottom: 8 },
  pendingCta: { flexDirection: "row" },
  pendingCtaText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.olive,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  noResultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noResultsLogo: {
    opacity: 0.35,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textMuted,
  },
  noResultsSubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: AppColors.olive,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  resultCardTitleBlock: { flex: 1, marginRight: 12 },
  resultTitle: { fontSize: 14, fontWeight: "700", color: AppColors.textDark, marginBottom: 2 },
  resultPublicLabel: { fontSize: 12, color: AppColors.textMuted },
  resultScoreBlock: { flexDirection: "row", alignItems: "flex-end" },
  resultScoreValue: { fontSize: 22, fontWeight: "700", color: AppColors.olive },
  resultScoreMax: { fontSize: 12, color: AppColors.textMuted, marginBottom: 3 },
  resultCriteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  resultCriteriaName: { fontSize: 12, color: AppColors.textDark, width: 90 },
  resultProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: AppColors.beige,
    borderRadius: 3,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  resultProgressFill: { height: 6, backgroundColor: AppColors.olive, borderRadius: 3 },
  resultCriteriaScore: { fontSize: 12, fontWeight: "700", color: AppColors.olive, width: 28, textAlign: "right" },
});
