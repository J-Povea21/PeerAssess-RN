import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseListScreen from "@/src/features/courses/presentation/screens/CourseListScreen";
import JoinCourseScreen from "@/src/features/courses/presentation/screens/JoinCourseScreen";
import { AppColors } from "@/src/theme/appColors";

export type CoursesStackParamList = {
  CourseList: undefined;
  JoinCourse: undefined;
  CourseDetail: { courseId: string };
};

const Stack = createNativeStackNavigator<CoursesStackParamList>();

// Temporary placeholder replaced by the Course detail card
function CourseDetailPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>Detalle del curso</Text>
      <Text style={styles.subtitle}>Próximamente</Text>
    </View>
  );
}

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
      <Stack.Screen name="CourseDetail" component={CourseDetailPlaceholder} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.beige,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 8,
  },
});
