import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Button } from "react-native-paper";

import { useAuthStore } from "../../auth/presentation/useAuthStore";

export default function HomeScreen() {
  const { logout } = useAuthStore();

  async function handleLogout() {
    await logout();
  }

  return (
    <View style={styles.container}>
      <Text>Home screen...</Text>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    marginTop: 24,
  },
});