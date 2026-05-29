import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import CreateCourseScreen from "@/src/features/courses/presentation/screens/CreateCourseScreen";
import TeacherHomeScreen from "@/src/features/home/presentation/screens/TeacherHomeScreen";
import ImportCsvScreen from "@/src/features/groups/presentation/screens/ImportCsvScreen";

export type TeacherHomeStackParamList = {
  TeacherHome: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
  ImportCsv: { courseId: string };
};

const Stack = createNativeStackNavigator<TeacherHomeStackParamList>();

export default function TeacherHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      <Stack.Screen name="ImportCsv" component={ImportCsvScreen} />
    </Stack.Navigator>
  );
}
