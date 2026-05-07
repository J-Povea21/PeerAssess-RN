import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ProfileScreen from "@/src/features/auth/presentation/screens/ProfileScreen";
import StudentResultsScreen from "@/src/features/evaluations/presentation/screens/StudentResultsScreen";
import { AppColors } from "@/src/theme/appColors";
import HomeStackNavigator from "./HomeStackNavigator";
import CoursesStackNavigator from "./CoursesStackNavigator";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: "home-outline",
  Courses: "book-outline",
  Results: "chart-bar",
  Profile: "account-outline",
};

export default function StudentTabsNavigator() {
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
        component={HomeStackNavigator}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{ tabBarLabel: "Cursos" }}
      />
      <Tab.Screen
        name="Results"
        component={StudentResultsScreen}
        options={{ tabBarLabel: "Resultados" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

