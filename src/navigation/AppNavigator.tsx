import React from "react";

import AuthStackNavigator from "./AuthStackNavigator";
import StudentTabsNavigator from "./StudentTabsNavigator";

export default function AppNavigator() {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <StudentTabsNavigator />;
  }

  return <AuthStackNavigator />;
}