import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { AppColors } from "@/src/theme/appColors";
import { useCourseStore } from "../store/useCourseStore";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

export default function JoinCourseScreen({ navigation }: { navigation: any }) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuthStore();
  const { joinCourse, error, clearError } = useCourseStore();

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || !user?.id) return;

    setIsJoining(true);
    await joinCourse(trimmed, user.id);
    setIsJoining(false);

    // goBack only if no error — error is shown via Snackbar
    if (!useCourseStore.getState().error) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={40}
            color={AppColors.olive}
          />
        </View>

        <Text style={styles.heading}>Ingresa el código del curso</Text>
        <Text style={styles.subheading}>Pide el código a tu profesor</Text>

        <TextInput
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          style={styles.input}
          contentStyle={styles.inputContent}
          textAlign="center"
          autoCapitalize="characters"
          placeholder="ABC123"
          disabled={isJoining}
          mode="outlined"
          outlineStyle={styles.inputOutline}
        />

        <Button
          mode="contained"
          onPress={handleJoin}
          disabled={isJoining || !code.trim()}
          buttonColor={AppColors.olive}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          style={styles.button}
        >
          {isJoining ? (
            <ActivityIndicator color="#FFFFFF" size={24} />
          ) : (
            "Unirse al curso"
          )}
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: AppColors.olive + "1F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  inputContent: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 6,
    color: AppColors.olive,
  },
  inputOutline: {
    borderWidth: 0,
    borderRadius: 14,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    borderRadius: 14,
    elevation: 0,
  },
  snackbar: {
    backgroundColor: AppColors.rose,
  },
});
