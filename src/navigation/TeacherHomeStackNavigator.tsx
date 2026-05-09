import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TeacherHomeScreen from "@/src/features/home/presentation/screens/TeacherHomeScreen";

export type TeacherHomeStackParamList = {
  TeacherHome: undefined;
};

const Stack = createNativeStackNavigator<TeacherHomeStackParamList>();

export default function TeacherHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
    </Stack.Navigator>
  );
}
