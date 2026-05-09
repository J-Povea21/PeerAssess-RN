import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import TeacherHomeScreen from "@/src/features/home/presentation/screens/TeacherHomeScreen";


export type TeacherHomeStackParamList = {
  TeacherHome: undefined;
  CourseDetail: { courseId: string };
};

const Stack = createNativeStackNavigator<TeacherHomeStackParamList>();

export default function TeacherHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </Stack.Navigator>
  );
}
