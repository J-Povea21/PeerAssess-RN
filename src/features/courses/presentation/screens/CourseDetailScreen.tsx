import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";

import CourseTabBar, {
  CourseTabKey,
} from "@/src/features/courses/presentation/components/CourseTabBar";
import CategoriasTab from "@/src/features/groups/presentation/components/CategoriasTab";
import EvaluationsTab from "@/src/features/evaluations/presentation/screens/EvaluationsTab";
import InfoTab from "@/src/features/courses/presentation/components/tabs/InfoTab";
import MembersTab from "@/src/features/courses/presentation/components/tabs/MembersTab";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = {
  navigation: any;
  route: { params: { courseId: string } };
};

export default function CourseDetailScreen({ navigation, route }: Props) {
  const { courseId } = route.params;
  const course = useCourseStore((s) => s.courses.find((c) => c._id === courseId));
  const [activeTab, setActiveTab] = useState<CourseTabKey>("info");

  const tabContent = useMemo(() => {
    if (!course) return null;
    switch (activeTab) {
      case "info":
        return <InfoTab course={course} />;
      case "categorias":
        return <CategoriasTab courseId={courseId} navigation={navigation} />;
      case "evaluaciones":
        return <EvaluationsTab courseId={courseId} navigation={navigation} />;
      case "miembros":
        return <MembersTab courseId={course._id} />;
    }
  }, [activeTab, course, courseId, navigation]);

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
