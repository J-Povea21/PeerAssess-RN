import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ProfileScreen from "@/src/features/auth/presentation/screens/ProfileScreen";
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

function ResultsPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <MaterialCommunityIcons
        name="chart-bar"
        size={48}
        color={AppColors.textMuted}
        style={styles.placeholderIcon}
      />
      <Text style={styles.placeholderTitle}>Sin resultados aún</Text>
      <Text style={styles.placeholderSub}>
        Los resultados aparecerán aquí cuando estén publicados
      </Text>
    </View>
  );
}

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
        component={ResultsPlaceholder}
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

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.beige,
    padding: 32,
  },
  placeholderIcon: {
    opacity: 0.5,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textMuted,
    marginTop: 12,
  },
  placeholderSub: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
});