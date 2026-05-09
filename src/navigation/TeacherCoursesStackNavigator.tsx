import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import TeacherCourseListScreen from "@/src/features/courses/presentation/screens/TeacherCourseListScreen";


export type TeacherCoursesStackParamList = {
  TeacherCourseList: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
};

const Stack = createNativeStackNavigator<TeacherCoursesStackParamList>();

export default function TeacherCoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherCourseList" component={TeacherCourseListScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </Stack.Navigator>
  );
}
