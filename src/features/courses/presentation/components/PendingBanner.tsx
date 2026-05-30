import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { AppColors } from "@/src/theme/appColors";

type Props = {
  courseCount: number;
};

export default function PendingBanner({ courseCount }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="alert-outline" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Evaluaciones pendientes</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {`Tienes ${courseCount} curso${courseCount !== 1 ? "s" : ""} con evaluaciones pendientes`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: AppColors.salmon,
  },
  iconBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
});
