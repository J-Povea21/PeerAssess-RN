import React from "react";

import AuthStackNavigator from "./AuthStackNavigator";
import StudentTabsNavigator from "./StudentTabsNavigator";
import { useAuthStore } from "../features/auth/presentation/useAuthStore";

export default function AppNavigator() {
  const { user } = useAuthStore();

  if (user) {
    return <StudentTabsNavigator />;
  }

  return <AuthStackNavigator />;
}