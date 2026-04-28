import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
} from "react-native";

import AuthStackNavigator from "./AuthStackNavigator";
import StudentTabsNavigator from "./StudentTabsNavigator";
import { useAuthStore } from "../features/auth/presentation/useAuthStore";

export default function AppNavigator() {
  const {
    user,
    isLoading,
    restoreSession,
  } = useAuthStore();

 useEffect(() => {
  restoreSession();
}, [restoreSession]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return <StudentTabsNavigator />;
  }

  return <AuthStackNavigator />;
}