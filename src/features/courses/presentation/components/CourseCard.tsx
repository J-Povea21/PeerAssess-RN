import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

import { Course } from "@/src/features/courses/domain/entities/Course";
import { AppColors } from "@/src/theme/appColors";

type Props = {
  course: Course;
  onPress: () => void;
  hasPending?: boolean;
};

export default function CourseCard({ course, onPress, hasPending }: Props) {
  const isPending = hasPending ?? course.pendingEvaluations > 0;
  const badgeColor = isPending ? AppColors.salmon : AppColors.olive;
  const badgeLabel = isPending ? "Pendiente" : "Al día";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="book-outline" size={22} color={AppColors.olive} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {course.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {course.semester}
        </Text>
        <View style={styles.stats}>
          <MaterialCommunityIcons
            name="account-multiple-outline"
            size={12}
            color={AppColors.textMuted}
          />
          <Text style={styles.statText}>{course.studentCount}</Text>
          <Text style={styles.statSep}>·</Text>
          <MaterialCommunityIcons
            name="tag-multiple-outline"
            size={12}
            color={AppColors.textMuted}
          />
          <Text style={styles.statText}>{course.categoryCount}</Text>
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: badgeColor + "1F" }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: AppColors.beige,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  statSep: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
