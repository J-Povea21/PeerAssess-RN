import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import MemberRow from "@/src/features/courses/presentation/components/MemberRow";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { AppColors } from "@/src/theme/appColors";

type Props = {
  courseId: string;
};

export default function MembersTab({ courseId }: Props) {
  const members = useCourseStore((s) => s.membersByCourse[courseId]);
  const isLoading = useCourseStore((s) => s.isLoadingMembers);
  const fetchCourseMembers = useCourseStore((s) => s.fetchCourseMembers);

  useEffect(() => {
    fetchCourseMembers(courseId);
  }, [courseId, fetchCourseMembers]);

  const data = useMemo(() => members ?? [], [members]);

  if (isLoading && !members) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.olive} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="account-multiple-outline"
          size={48}
          color={AppColors.textMuted}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>Sin miembros</Text>
        <Text style={styles.emptySubtitle}>
          Aún no hay estudiantes asignados a grupos en este curso
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(m) => m.email}
      renderItem={({ item }) => <MemberRow member={item} />}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  separator: {
    height: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textMuted,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
