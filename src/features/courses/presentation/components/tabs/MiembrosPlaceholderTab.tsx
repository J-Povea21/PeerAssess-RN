import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppColors } from "@/src/theme/appColors";

// Placeholder mounted by the tab shell. Card 6 will replace this component
// with the real members listing.
export default function MiembrosPlaceholderTab() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="account-multiple-outline"
        size={48}
        color={AppColors.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>Miembros</Text>
      <Text style={styles.subtitle}>Disponible en una próxima entrega</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    opacity: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textMuted,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
