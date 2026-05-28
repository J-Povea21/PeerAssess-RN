import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import * as Clipboard from "expo-clipboard";

import { Course } from "@/src/features/courses/domain/entities/Course";
import { AppColors } from "@/src/theme/appColors";
import StatCard from "../StatCard";

type Props = {
  course: Course;
  pendingEvaluationCount?: number;
};

export default function InfoTab({ course, pendingEvaluationCount }: Props) {
  const { user } = useAuthStore();
  const isActive = course.status === "active";
  const statusColor = isActive ? AppColors.olive : AppColors.salmon;
  const statusLabel = isActive ? "Activo" : "Pendiente";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
       <View style={styles.headerCard}>
        <Text style={styles.name}>{course.name}</Text>
        <Text style={styles.semester}>{course.semester}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + "1F" }]}>
          <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {user?.role === "teacher" && course.enrollmentCode && (
        <View style={styles.enrollmentCard}>
          <Text style={styles.enrollmentLabel}>CÓDIGO DE INSCRIPCIÓN</Text>
          <View style={styles.enrollmentRow}>
            <Text style={styles.enrollmentCode}>{course.enrollmentCode}</Text>
            <TouchableOpacity
              onPress={() => Clipboard.setStringAsync(course.enrollmentCode!)}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      

      <Text style={styles.sectionLabel}>RESUMEN</Text>

      <View style={styles.statsRow}>
        <StatCard
          icon="account-multiple-outline"
          value={course.studentCount}
          label="Estudiantes"
          tint={AppColors.olive}
        />
        <View style={styles.statSpacer} />
        <StatCard
          icon="tag-multiple-outline"
          value={course.categoryCount}
          label="Categorías"
          tint={AppColors.rose}
        />
        <View style={styles.statSpacer} />
        <StatCard
          icon="clipboard-check-outline"
          value={pendingEvaluationCount ?? 0}
          label="Pendientes"
          tint={AppColors.salmon}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textDark,
  },
  semester: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  statSpacer: {
    width: 12,
  },
  enrollmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  enrollmentLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  enrollmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  enrollmentCode: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.textDark,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: AppColors.olive + "1F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.olive,
  },
});
