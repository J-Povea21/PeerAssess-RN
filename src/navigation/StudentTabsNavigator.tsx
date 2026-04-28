import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../features/home/presentation/HomeScreen";

const Tab = createBottomTabNavigator();

export default function StudentTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Courses"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Results"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Profile"
        component={HomeScreen}
      />
    </Tab.Navigator>
  );
}