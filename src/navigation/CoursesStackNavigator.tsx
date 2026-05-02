import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import CourseListScreen from "@/src/features/courses/presentation/screens/CourseListScreen";
import JoinCourseScreen from "@/src/features/courses/presentation/screens/JoinCourseScreen";
import GroupListScreen from "@/src/features/groups/presentation/screens/GroupListScreen";
import { AppColors } from "@/src/theme/appColors";

export type CoursesStackParamList = {
  CourseList: undefined;
  JoinCourse: undefined;
  CourseDetail: { courseId: string };
  GroupList: { categoryId: string; categoryName: string };
};

const Stack = createNativeStackNavigator<CoursesStackParamList>();

export default function CoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseList" component={CourseListScreen} />
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
      <Stack.Screen name="GroupList" component={GroupListScreen} />
    </Stack.Navigator>
  );
}
