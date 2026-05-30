import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";
import CourseCard from "../components/CourseCard";
import PendingBanner from "../components/PendingBanner";
import { useCourseStore } from "../store/useCourseStore";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

export default function CourseListScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { courses, isLoading, fetchCoursesByStudent } = useCourseStore();
  const { pendingAssessments, fetchPendingAssessments } = useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();

 useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchCoursesByStudent(user.id);
        fetchPendingAssessments(user.id);
      }
    }, [user?.id])
  );

  useEffect(() => {
    courses.forEach((c) => {
      if (!(c._id in categoriesByCourse)) fetchCategories(c._id);
    });
  }, [courses]);

  const pendingCourseIds = useMemo(() => {
    const courseIdByCategory = new Map<string, string>();
    for (const course of courses) {
      const cats = categoriesByCourse[course._id] ?? [];
      for (const cat of cats) courseIdByCategory.set(cat._id, course._id);
    }
    const ids = new Set<string>();
    for (const pa of pendingAssessments) {
      const cid = courseIdByCategory.get(pa.assessment.categoryId);
      if (cid) ids.add(cid);
    }
    return ids;
  }, [courses, categoriesByCourse, pendingAssessments]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  const pendingCourseCount = pendingCourseIds.size;

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

        {/* Pending evaluation banner — shows only when a course has pending evaluations */}
        {pendingCourseCount > 0 && <PendingBanner courseCount={pendingCourseCount} />}

        {/* Section label */}
        <Text style={styles.sectionLabel}>MIS CURSOS</Text>

        {/* Course list / empty state */}
        {courses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={48}
              color={AppColors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              No estás inscrito en ningún curso
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              hasPending={pendingCourseIds.has(course._id)}
              onPress={() =>
                navigation.navigate("CourseDetail", { courseId: course._id })
              }
            />
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 12,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: AppColors.olive,
  },
});
