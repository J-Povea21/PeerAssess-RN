import React, { useEffect } from "react";

import SplashScreen from "@/src/features/auth/presentation/screens/SplashScreen";
import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import AuthStackNavigator from "./AuthStackNavigator";
import StudentTabsNavigator from "./StudentTabsNavigator";

export default function AppNavigator() {
  const { user, isRestoringSession, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isRestoringSession) {
    return <SplashScreen />;
  }

  return user ? <StudentTabsNavigator /> : <AuthStackNavigator />;
}
