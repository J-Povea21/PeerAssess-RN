import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import StudentHomeScreen from "@/src/features/home/presentation/screens/StudentHomeScreen";
import JoinCourseScreen from "@/src/features/courses/presentation/screens/JoinCourseScreen";
import EvaluationFormScreen from "@/src/features/evaluations/presentation/screens/EvaluationFormScreen";
import { AppColors } from "@/src/theme/appColors";

export type HomeStackParamList = {
  Home: undefined;
  JoinCourse: undefined;
  CourseDetail: { courseId: string };
  EvaluationForm: {
    assessmentId: string;
    assessmentTitle: string;
    deadline: string;
    peers: { userId: string; fullName: string }[];
    criteria: { _id: string; assessmentId: string; name: string; weight: number }[];
    evaluatorId: string;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={StudentHomeScreen} />
      <Stack.Screen
        name="JoinCourse"
        component={JoinCourseScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Unirse a un curso",
          headerStyle: { backgroundColor: AppColors.beige },
          headerTintColor: AppColors.textDark,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="EvaluationForm" component={EvaluationFormScreen} />
    </Stack.Navigator>
  );
}
