import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import CreateCourseScreen from "@/src/features/courses/presentation/screens/CreateCourseScreen";
import TeacherCourseListScreen from "@/src/features/courses/presentation/screens/TeacherCourseListScreen";
import ImportCsvScreen from "@/src/features/groups/presentation/screens/ImportCsvScreen";
import CreateAssessmentScreen from "@/src/features/evaluations/presentation/screens/CreateAssessmentScreen";


export type TeacherCoursesStackParamList = {
  TeacherCourseList: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
  ImportCsv: { courseId: string };
  CreateAssessment: { courseId: string };
};

const Stack = createNativeStackNavigator<TeacherCoursesStackParamList>();

export default function TeacherCoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherCourseList" component={TeacherCourseListScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      <Stack.Screen name="ImportCsv" component={ImportCsvScreen} />
      <Stack.Screen name="CreateAssessment" component={CreateAssessmentScreen} />
    </Stack.Navigator>
  );
}
