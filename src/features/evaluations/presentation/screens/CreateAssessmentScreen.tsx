import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Menu,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewCriteria } from "@/src/features/evaluations/domain/entities/Criteria";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

const FIXED_CRITERIA_NAMES = ["Puntualidad", "Contribuciones", "Compromiso", "Actitud"] as const;
const FIXED_CRITERIA: NewCriteria[] = FIXED_CRITERIA_NAMES.map((name) => ({
  name,
  weight: 1 / FIXED_CRITERIA_NAMES.length,
}));

type Props = { route: { params: { courseId: string } }; navigation: any };

export default function CreateAssessmentScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const { createAssessment, isCreating } = useEvaluationStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();

  const categories = useMemo(
    () => categoriesByCourse[courseId] ?? [],
    [categoriesByCourse, courseId],
  );

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [menuVisible, setMenuVisible] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [timeWindowError, setTimeWindowError] = useState("");

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackType, setSnackType] = useState<"success" | "error">("error");

  useEffect(() => {
    fetchCategories(courseId);
  }, [courseId]);

  const selectedCategoryName = categories.find((c) => c._id === categoryId)?.name;

  const validate = (): boolean => {
    let ok = true;

    if (!title.trim()) {
      setTitleError("El título es requerido");
      ok = false;
    } else {
      setTitleError("");
    }

    if (!categoryId) {
      setCategoryError("Selecciona una categoría");
      ok = false;
    } else {
      setCategoryError("");
    }

    const minutes = Number(timeWindow);
    if (!timeWindow.trim() || !Number.isInteger(minutes) || minutes <= 0) {
      setTimeWindowError("Ingresa un número entero de minutos mayor a 0");
      ok = false;
    } else {
      setTimeWindowError("");
    }

    return ok;
  };

  const handleSubmit = async () => {
    if (!validate() || !categoryId) return;

    try {
      await createAssessment(
        {
          categoryId,
          title: title.trim(),
          visibility,
          timeWindowMinutes: Number(timeWindow),
        },
        FIXED_CRITERIA,
        courseId,
      );
      setSnackType("success");
      setSnackMessage("¡Evaluación creada exitosamente!");
      setSnackVisible(true);
    } catch (e) {
      setSnackType("error");
      setSnackMessage((e as Error).message ?? "No se pudo crear la evaluación. Intenta de nuevo.");
      setSnackVisible(true);
    }
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Nueva evaluación" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (titleError) setTitleError("");
          }}
          placeholder="Ej: Evaluación final del proyecto"
          mode="outlined"
          outlineColor={titleError ? AppColors.salmon : "transparent"}
          activeOutlineColor={titleError ? AppColors.salmon : AppColors.olive}
          textColor={AppColors.textDark}
          placeholderTextColor={AppColors.textMuted}
          style={styles.input}
          error={!!titleError}
          returnKeyType="done"
          theme={{ roundness: 12 }}
        />
        {!!titleError && <Text style={styles.errorText}>{titleError}</Text>}

        {/* Category dropdown */}
        <Text style={[styles.label, { marginTop: 24 }]}>Categoría</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity
              style={styles.dropdownAnchor}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
              disabled={categories.length === 0}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedCategoryName && { color: AppColors.textMuted },
                ]}
              >
                {selectedCategoryName ??
                  (categories.length === 0
                    ? "No hay categorías en este curso"
                    : "Selecciona una categoría")}
              </Text>
              <MaterialCommunityIcons
                name={menuVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color={AppColors.textMuted}
              />
            </TouchableOpacity>
          }
        >
          {categories.map((c, index) => (
            <React.Fragment key={c._id}>
              <Menu.Item
                title={c.name}
                titleStyle={[
                  styles.menuItemTitle,
                  categoryId === c._id && styles.menuItemSelected,
                ]}
                trailingIcon={categoryId === c._id ? "check" : undefined}
                onPress={() => {
                  setCategoryId(c._id);
                  setCategoryError("");
                  setMenuVisible(false);
                }}
              />
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>
        {!!categoryError && <Text style={styles.errorText}>{categoryError}</Text>}

        {/* Time window */}
        <Text style={[styles.label, { marginTop: 24 }]}>Ventana de tiempo (minutos)</Text>
        <TextInput
          value={timeWindow}
          onChangeText={(t) => {
            setTimeWindow(t.replace(/[^0-9]/g, ""));
            if (timeWindowError) setTimeWindowError("");
          }}
          placeholder="Ej: 60"
          mode="outlined"
          keyboardType="number-pad"
          outlineColor={timeWindowError ? AppColors.salmon : "transparent"}
          activeOutlineColor={timeWindowError ? AppColors.salmon : AppColors.olive}
          textColor={AppColors.textDark}
          placeholderTextColor={AppColors.textMuted}
          style={styles.input}
          error={!!timeWindowError}
          returnKeyType="done"
          theme={{ roundness: 12 }}
        />
        {!!timeWindowError && <Text style={styles.errorText}>{timeWindowError}</Text>}

        {/* Visibility */}
        <Text style={[styles.label, { marginTop: 24 }]}>Visibilidad</Text>
        <SegmentedButtons
          value={visibility}
          onValueChange={(v) => setVisibility(v as "public" | "private")}
          theme={{ colors: { secondaryContainer: AppColors.olive + "33" } }}
          buttons={[
            {
              value: "public",
              label: "Pública",
              icon: "eye-outline",
              checkedColor: AppColors.textDark,
            },
            {
              value: "private",
              label: "Privada",
              icon: "lock-outline",
              checkedColor: AppColors.textDark,
            },
          ]}
        />
        <Text style={styles.hintText}>
          {visibility === "public"
            ? "Los estudiantes podrán ver sus resultados."
            : "Solo el profesor podrá ver los resultados."}
        </Text>

        {/* Criteria checklist (fixed, read-only) */}
        <Text style={[styles.label, { marginTop: 24 }]}>Criterios de evaluación</Text>
        <View style={styles.criteriaCard}>
          {FIXED_CRITERIA_NAMES.map((name, index) => (
            <View
              key={name}
              style={[styles.criteriaRow, index > 0 && styles.criteriaRowBorder]}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={AppColors.olive}
              />
              <Text style={styles.criteriaText}>{name}</Text>
            </View>
          ))}
        </View>

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
          {isCreating ? <ActivityIndicator color="#FFFFFF" size={20} /> : "Crear evaluación"}
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
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "600", color: AppColors.textDark },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: "500", color: AppColors.textDark, marginBottom: 8 },
  input: { backgroundColor: "rgba(255,255,255,0.7)" },
  errorText: { fontSize: 12, color: AppColors.salmon, marginTop: 4 },
  hintText: { fontSize: 12, color: AppColors.textMuted, marginTop: 8 },
  dropdownAnchor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: { fontSize: 16, color: AppColors.textDark, flex: 1 },
  menuContent: { backgroundColor: "#FFFFFF", borderRadius: 8 },
  menuItemTitle: { fontSize: 15, color: AppColors.textDark },
  menuItemSelected: { color: AppColors.olive, fontWeight: "600" },
  criteriaCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  criteriaRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  criteriaRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#00000014" },
  criteriaText: { fontSize: 15, color: AppColors.textDark },
  submitButton: { marginTop: 40, borderRadius: 14 },
  submitContent: { height: 52 },
  submitLabel: { fontSize: 16, fontWeight: "600" },
  snackbar: { backgroundColor: AppColors.textDark },
  snackbarSuccess: { backgroundColor: AppColors.olive },
});
