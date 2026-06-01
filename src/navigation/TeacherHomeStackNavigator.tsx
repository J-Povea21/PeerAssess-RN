import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailScreen from "@/src/features/courses/presentation/screens/CourseDetailScreen";
import CreateCourseScreen from "@/src/features/courses/presentation/screens/CreateCourseScreen";
import TeacherHomeScreen from "@/src/features/home/presentation/screens/TeacherHomeScreen";
import GroupListScreen from "@/src/features/groups/presentation/screens/GroupListScreen";
import GroupMembersScreen from "@/src/features/groups/presentation/screens/GroupMembersScreen";
import ImportCsvScreen from "@/src/features/groups/presentation/screens/ImportCsvScreen";
import CreateAssessmentScreen from "@/src/features/evaluations/presentation/screens/CreateAssessmentScreen";

export type TeacherHomeStackParamList = {
  TeacherHome: undefined;
  CourseDetail: { courseId: string };
  CreateCourse: undefined;
  GroupList: { categoryId: string; categoryName: string };
  GroupMembers: { groupId: string; groupName: string };
  ImportCsv: { courseId: string };
  CreateAssessment: { courseId: string };
};

const Stack = createNativeStackNavigator<TeacherHomeStackParamList>();

export default function TeacherHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      <Stack.Screen name="GroupList" component={GroupListScreen} />
      <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <Stack.Screen name="ImportCsv" component={ImportCsvScreen} />
      <Stack.Screen name="CreateAssessment" component={CreateAssessmentScreen} />
    </Stack.Navigator>
  );
}
