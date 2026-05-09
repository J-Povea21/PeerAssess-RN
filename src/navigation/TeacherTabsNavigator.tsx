import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ProfileScreen from "@/src/features/auth/presentation/screens/ProfileScreen";
import { AppColors } from "@/src/theme/appColors";
import CoursesStackNavigator from "./CoursesStackNavigator";
import TeacherHomeStackNavigator from "./TeacherHomeStackNavigator";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: "home-outline",
  Courses:   "book-outline",
  Profile:   "account-outline",
};

export default function TeacherTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: AppColors.olive,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: { elevation: 8, backgroundColor: "#FFFFFF" },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name] ?? "circle-outline"}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={TeacherHomeStackNavigator}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{ tabBarLabel: "Cursos" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
