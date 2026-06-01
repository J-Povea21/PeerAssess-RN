import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Menu,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

const SEMESTERS = ["2026-10", "2026-30", "2025-30", "2025-10"] as const;

type Props = { navigation: any };

export default function CreateCourseScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { createCourse, isCreating } = useCourseStore();

  const [name, setName] = useState("");
  const [semester, setSemester] = useState<string>(SEMESTERS[0]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [nameError, setNameError] = useState("");
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState<"success" | "error">("error");

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("El nombre del curso es requerido");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !user?.id) return;

    try {
      await createCourse(name.trim(), semester, user.id);
      setSnackType("success");
      setSnackMessage("¡Curso creado exitosamente!");
      setSnackVisible(true);
    } catch (e) {
      setSnackType("error");
      setSnackMessage((e as Error).message ?? "No se pudo crear el curso. Intenta de nuevo.");
      setSnackVisible(true);
    }
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header
        style={styles.appbar}
        statusBarHeight={insets.top}
      >
        <Appbar.BackAction
          color={AppColors.textDark}
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content title="Crear curso" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Course name */}
        <Text style={styles.label}>Nombre del curso</Text>
        <TextInput
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (nameError) setNameError("");
          }}
          placeholder="Ej: Desarrollo Móvil"
          mode="outlined"
          outlineColor={nameError ? AppColors.salmon : "transparent"}
          activeOutlineColor={nameError ? AppColors.salmon : AppColors.olive}
          style={styles.input}
          error={!!nameError}
          autoCapitalize="words"
          returnKeyType="done"
          theme={{ roundness: 12 }}
        />
        {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

        {/* Semester dropdown */}
        <Text style={[styles.label, { marginTop: 24 }]}>Semestre</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity
              style={styles.dropdownAnchor}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>{semester}</Text>
              <MaterialCommunityIcons
                name={menuVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color={AppColors.textMuted}
              />
            </TouchableOpacity>
          }
        >
          {SEMESTERS.map((s, index) => (
            <React.Fragment key={s}>
              <Menu.Item
                title={s}
                titleStyle={[
                  styles.menuItemTitle,
                  semester === s && styles.menuItemSelected,
                ]}
                trailingIcon={semester === s ? "check" : undefined}
                onPress={() => {
                  setSemester(s);
                  setMenuVisible(false);
                }}
              />
              {index < SEMESTERS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>

        {/* Submit */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isCreating}
          buttonColor={AppColors.olive}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
          labelStyle={styles.submitLabel}
        >
          {isCreating ? (
            <ActivityIndicator color="#FFFFFF" size={20} />
          ) : (
            "Crear curso"
          )}
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => {
          setSnackVisible(false);
          if (snackType === "success") navigation.goBack();
        }}
        duration={2000}
        style={[styles.snackbar, snackType === "success" && styles.snackbarSuccess]}
      >
        {snackMessage}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  errorText: {
    fontSize: 12,
    color: AppColors.salmon,
    marginTop: 4,
  },
  dropdownAnchor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: AppColors.textDark,
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  menuItemTitle: {
    fontSize: 15,
    color: AppColors.textDark,
  },
  menuItemSelected: {
    color: AppColors.olive,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 40,
    borderRadius: 14,
  },
  submitContent: {
    height: 52,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  snackbar: {
    backgroundColor: AppColors.textDark,
  },
  snackbarSuccess: {
    backgroundColor: AppColors.olive,
  },
});
