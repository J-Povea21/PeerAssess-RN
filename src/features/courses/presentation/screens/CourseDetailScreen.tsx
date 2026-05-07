import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import CourseTabBar, {
  CourseTabKey,
} from "@/src/features/courses/presentation/components/CourseTabBar";
import CategoriasTab from "@/src/features/groups/presentation/components/CategoriasTab";
import EvaluationsTab from "@/src/features/evaluations/presentation/screens/EvaluationsTab";
import InfoTab from "@/src/features/courses/presentation/components/tabs/InfoTab";
import MembersTab from "@/src/features/courses/presentation/components/tabs/MembersTab";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = {
  navigation: any;
  route: { params: { courseId: string } };
};

export default function CourseDetailScreen({ navigation, route }: Props) {
  const { courseId } = route.params;
  const { user } = useAuthStore();
  const course = useCourseStore((s) => s.courses.find((c) => c._id === courseId));
  const { pendingAssessments, fetchPendingAssessments } = useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();
  const [activeTab, setActiveTab] = useState<CourseTabKey>("info");

  useEffect(() => {
    if (user?.id) fetchPendingAssessments(user.id);
    fetchCategories(courseId);
  }, [user?.id, courseId]);

  const pendingEvaluationCount = useMemo(() => {
    const categoryIds = new Set(
      (categoriesByCourse[courseId] ?? []).map((c) => c._id)
    );
    if (categoryIds.size === 0) return 0;
    return pendingAssessments
      .filter((pa) => categoryIds.has(pa.assessment.categoryId))
      .reduce((sum, pa) => sum + pa.peers.length, 0);
  }, [pendingAssessments, categoriesByCourse, courseId]);

  const tabContent = useMemo(() => {
    if (!course) return null;
    switch (activeTab) {
      case "info":
        return <InfoTab course={course} pendingEvaluationCount={pendingEvaluationCount} />;
      case "categorias":
        return <CategoriasTab courseId={courseId} navigation={navigation} />;
      case "evaluaciones":
        return <EvaluationsTab courseId={courseId} navigation={navigation} />;
      case "miembros":
        return <MembersTab courseId={course._id} />;
    }
  }, [activeTab, course, courseId, navigation, pendingEvaluationCount]);

  if (!course) {
    return (
      <LinearGradient colors={BG_COLORS} style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction
            color={AppColors.textDark}
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content title="Curso" titleStyle={styles.appbarTitle} />
        </Appbar.Header>
        <View style={styles.notFound}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={AppColors.textMuted}
            style={styles.notFoundIcon}
          />
          <Text style={styles.notFoundTitle}>Curso no encontrado</Text>
          <Text style={styles.notFoundSubtitle}>
            Vuelve a la lista para seleccionar otro curso
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          color={AppColors.textDark}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title={course.name} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <CourseTabBar activeKey={activeTab} onChange={setActiveTab} />

      <View style={styles.tabContent}>{tabContent}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  tabContent: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  notFoundIcon: {
    opacity: 0.5,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textMuted,
    marginTop: 12,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
