import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import CourseCard from "@/src/features/courses/presentation/components/CourseCard";
import PendingBanner from "@/src/features/courses/presentation/components/PendingBanner";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import LogoBox from "@/src/core/components/LogoBox";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

export default function StudentHomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { courses, isLoading, fetchCoursesByStudent } = useCourseStore();

  useEffect(() => {
    if (user?.id) {
      fetchCoursesByStudent(user.id);
    }
  }, [user?.id, fetchCoursesByStudent]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  const pendingCourses = courses.filter((c) => c.pendingEvaluations > 0);

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
        {pendingCourses.length > 0 && <PendingBanner course={pendingCourses[0]} />}

        {/* Pending evaluations section */}
        <Text style={styles.sectionLabel}>CURSOS CON EVALUACIONES PENDIENTES</Text>

        {pendingCourses.length === 0 ? (
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
          pendingCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onPress={() =>
                navigation.navigate("CourseDetail", { courseId: course._id })
              }
            />
          ))
        )}

        {/* Recent results section */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          RESULTADOS RECIENTES
        </Text>

        <View style={styles.noResultsCard}>
          <LogoBox size={64} style={styles.noResultsLogo} />
          <Text style={styles.noResultsTitle}>No hay resultados recientes</Text>
          <Text style={styles.noResultsSubtitle}>
            Aquí aparecerán tus calificaciones cuando{"\n"}se publiquen los resultados
          </Text>
        </View>
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
});
