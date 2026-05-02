import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";

import { DIProvider } from "./src/core/di/DIProvider";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <PaperProvider>
      <DIProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </DIProvider>
    </PaperProvider>
  );
}