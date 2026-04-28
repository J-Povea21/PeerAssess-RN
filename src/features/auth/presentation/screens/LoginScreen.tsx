import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoBox from "@/src/core/components/LogoBox";
import { AppColors } from "@/src/theme/appColors";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;
    await login(email.trim(), password);
  };

  return (
    <LinearGradient
      colors={[AppColors.beige, "#FFFFFF", `${AppColors.rose}1A`]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <LogoBox style={styles.logo} />

              <Text style={styles.title}>PeerAssess</Text>

              <Text style={styles.subtitle}>
                Evaluación Colaborativa en Grupos
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Correo institucional"
                value={email}
                onChangeText={(v) => { clearError(); setEmail(v); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                disabled={isLoading}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor={AppColors.olive}
                style={styles.input}
                textColor={AppColors.textDark}
                placeholderTextColor={AppColors.textMuted}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={(v) => { clearError(); setPassword(v); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                disabled={isLoading}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor={AppColors.olive}
                style={styles.input}
                textColor={AppColors.textDark}
                placeholderTextColor={AppColors.textMuted}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword((v) => !v)}
                    color={AppColors.textMuted}
                  />
                }
              />

              {error ? (
                <HelperText type="error" visible style={styles.errorText}>
                  {error}
                </HelperText>
              ) : null}

              {isLoading ? (
                <ActivityIndicator style={styles.loader} color={AppColors.olive} />
              ) : (
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={!canSubmit}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  buttonColor={AppColors.olive}
                  textColor="#FFFFFF"
                >
                  Iniciar sesión
                </Button>
              )}
            </View>

            {/* Footer */}
            <Text style={styles.footer}>Autenticación segura via Roble</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textMuted,
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.70)",
    borderRadius: 12,
  },
  errorText: {
    marginTop: -8,
  },
  loader: {
    marginTop: 8,
  },
  button: {
    borderRadius: 14,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    fontSize: 13,
    color: AppColors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
