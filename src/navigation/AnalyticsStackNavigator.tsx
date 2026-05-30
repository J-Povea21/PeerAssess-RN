import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AnalyticsScreen from "@/src/features/analytics/presentation/screens/AnalyticsScreen";
import GroupResultsScreen from "@/src/features/analytics/presentation/screens/GroupResultsScreen";
import StudentEvolutionScreen from "@/src/features/analytics/presentation/screens/StudentEvolutionScreen";

export type AnalyticsStackParamList = {
  Analytics: undefined;
  GroupResults: {
    assessmentId: string;
    groupId: string;
    groupName: string;
    categoryIds: string[];
  };
  StudentEvolution: { studentId: string; fullName: string; categoryIds: string[] };
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="GroupResults" component={GroupResultsScreen} />
      <Stack.Screen name="StudentEvolution" component={StudentEvolutionScreen} />
    </Stack.Navigator>
  );
}
