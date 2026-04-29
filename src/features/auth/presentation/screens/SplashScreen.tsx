import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import LogoBox from "@/src/core/components/LogoBox";
import { AppColors } from "@/src/theme/appColors";

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={[AppColors.beige, "#FFFFFF"]}
      style={styles.container}
    >
      <LogoBox style={styles.logo} />
      <Text style={styles.title}>PeerAssess</Text>
      <ActivityIndicator size={24} color={AppColors.olive} style={styles.spinner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: AppColors.textDark,
  },
  spinner: {
    marginTop: 32,
  },
});
