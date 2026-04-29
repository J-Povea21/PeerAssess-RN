import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StudentHomeScreen from "@/src/features/home/presentation/screens/StudentHomeScreen";
import JoinCourseScreen from "@/src/features/courses/presentation/screens/JoinCourseScreen";
import { AppColors } from "@/src/theme/appColors";

export type HomeStackParamList = {
  Home: undefined;
  JoinCourse: undefined;
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
    </Stack.Navigator>
  );
}
