import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, FAB, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import CourseCard from "@/src/features/courses/presentation/components/CourseCard";
import { selectTeacherStats, useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { useShallow } from "zustand/react/shallow";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

export default function TeacherHomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { teacherCourses, isLoadingTeacher, fetchCoursesByTeacher } = useCourseStore();
  const { activeCourses, totalEvaluations, totalStudents } = useCourseStore(useShallow(selectTeacherStats));

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchCoursesByTeacher(user.id);
    }, [user?.id])
  );

  const initials = useMemo(
    () =>
      user?.name
        ? user.name
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join("")
        : "?",
    [user?.name]
  );

  if (isLoadingTeacher && teacherCourses.length === 0) {
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Buenos días,</Text>
            <Text style={styles.userName}>{user?.name ?? ""}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: AppColors.olive }]}>
            <Text style={styles.statValue}>{activeCourses}</Text>
            <Text style={styles.statLabel}>Cursos activos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: AppColors.salmon }]}>
            <Text style={styles.statValue}>{totalEvaluations}</Text>
            <Text style={styles.statLabel}>Evaluaciones</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: AppColors.rose }]}>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Estudiantes</Text>
          </View>
        </View>

        {/* Course list */}
        <Text style={styles.sectionLabel}>MIS CURSOS</Text>

        {teacherCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-outline"
              size={48}
              color={AppColors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Crea tu primer curso con el botón +
            </Text>
          </View>
        ) : (
          teacherCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              hasPending={false}
              onPress={() => navigation.navigate("CourseDetail", { courseId: course._id })}
            />
          ))
        )}
      </ScrollView>

      {/* FAB — wired to CreateCourseScreen in F3 */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => navigation.navigate("CreateCourse")}
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 16,
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
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: AppColors.olive,
  },
});
