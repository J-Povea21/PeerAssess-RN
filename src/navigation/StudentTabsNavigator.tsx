import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoriesWrapper from "../features/groups/presentation/screens/CategoriesWrapper";
import HomeScreen from "../features/home/presentation/HomeScreen";
import GroupListScreen from "../features/groups/presentation/screens/GroupListScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="GroupList"
        component={GroupListScreen}
      />
    </Stack.Navigator>
  );
}

export default function StudentTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
      />
      <Tab.Screen
  name="Courses"
  component={CategoriesWrapper}
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