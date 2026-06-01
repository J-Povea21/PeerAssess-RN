import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, FAB, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { AppColors } from "@/src/theme/appColors";
import CourseCard from "../components/CourseCard";
import { useCourseStore } from "../store/useCourseStore";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

export default function TeacherCourseListScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { teacherCourses, isLoadingTeacher, fetchCoursesByTeacher } = useCourseStore();

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
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{user?.name ?? ""}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>MIS CURSOS</Text>

        {teacherCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-outline"
              size={48}
              color={AppColors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No tienes cursos creados</Text>
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
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingBottom: 88 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: AppColors.textMuted },
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
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyIcon: { opacity: 0.5 },
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
