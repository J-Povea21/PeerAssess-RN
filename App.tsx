import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { DIProvider } from "./src/core/di/DIProvider";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <DIProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DIProvider>
  );
}