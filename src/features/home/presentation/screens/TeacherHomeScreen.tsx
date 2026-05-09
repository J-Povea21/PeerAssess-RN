import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { AppColors } from "@/src/theme/appColors";

export default function TeacherHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard del profesor</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.beige,
  },
  text: {
    fontSize: 16,
    color: AppColors.textMuted,
  },
});
