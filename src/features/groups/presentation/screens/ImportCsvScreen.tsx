import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Chip,
  Snackbar,
  Surface,
  Text,
} from "react-native-paper";

import {
  parseBrightspaceCsv,
  ParsedCsvImport,
} from "@/src/features/groups/domain/parseBrightspaceCsv";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { CoursesStackParamList } from "@/src/navigation/CoursesStackNavigator";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = NativeStackScreenProps<CoursesStackParamList, "ImportCsv">;

export default function ImportCsvScreen({ navigation, route }: Props) {
  const { courseId } = route.params;
  const { importCsv, isImporting } = useGroupStore();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCsvImport | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  // Keep the raw CSV so importCsv re-parses from the source of truth.
  const rawContentRef = React.useRef<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.name.toLowerCase().endsWith(".csv")) {
        setSnackbar("Solo se permiten archivos .csv");
        return;
      }

      const content = await new File(asset.uri).text();
      const data = parseBrightspaceCsv(content);
      if (!data.categoryName || data.groups.length === 0) {
        setSnackbar("El archivo no tiene un formato Brightspace válido");
        return;
      }

      rawContentRef.current = content;
      setFileName(asset.name);
      setParsed(data);
    } catch (e) {
      setSnackbar(`No se pudo leer el archivo: ${(e as Error).message}`);
    }
  };

  const handleImport = async () => {
    if (!parsed || !rawContentRef.current) return;
    try {
      await importCsv(courseId, rawContentRef.current);
      navigation.goBack();
    } catch (e) {
      setSnackbar((e as Error).message);
    }
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Importar CSV" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Button
          mode="outlined"
          icon="file-upload-outline"
          onPress={pickFile}
          textColor={AppColors.olive}
          style={styles.pickButton}
        >
          {fileName ?? "Seleccionar archivo .csv"}
        </Button>

        {parsed && (
          <>
            <Surface style={styles.summaryCard} elevation={1}>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="tag-outline" size={20} color={AppColors.olive} />
                <Text style={styles.summaryLabel}>Categoría</Text>
                <Text style={styles.summaryValue}>{parsed.categoryName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="account-group-outline" size={20} color={AppColors.olive} />
                <Text style={styles.summaryLabel}>Grupos</Text>
                <Text style={styles.summaryValue}>{parsed.groups.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="account-multiple-outline" size={20} color={AppColors.olive} />
                <Text style={styles.summaryLabel}>Miembros</Text>
                <Text style={styles.summaryValue}>{parsed.memberCount}</Text>
              </View>
            </Surface>

            <Text style={styles.previewTitle}>Vista previa</Text>
            {parsed.groups.map((group, i) => (
              <Surface key={`${group.name}-${i}`} style={styles.groupCard} elevation={1}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.chipRow}>
                  {group.members.length === 0 ? (
                    <Text style={styles.emptyMembers}>Sin miembros</Text>
                  ) : (
                    group.members.map((member, j) => (
                      <Chip key={`${member}-${j}`} style={styles.memberChip} textStyle={styles.memberChipText} compact>
                        {member}
                      </Chip>
                    ))
                  )}
                </View>
              </Surface>
            ))}

            <Button
              mode="contained"
              onPress={handleImport}
              loading={isImporting}
              disabled={isImporting}
              buttonColor={AppColors.olive}
              textColor="#FFFFFF"
              style={styles.importButton}
            >
              {isImporting ? "Importando..." : "Importar categoría"}
            </Button>
          </>
        )}
      </ScrollView>

      {isImporting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={AppColors.olive} size="large" />
        </View>
      )}

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={3000}
        style={styles.snackbarError}
      >
        {snackbar}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "600", color: AppColors.textDark },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  pickButton: { borderColor: AppColors.olive, borderRadius: 12 },
  summaryCard: { padding: 16, borderRadius: 14, backgroundColor: "#FFFFFF", gap: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryLabel: { flex: 1, fontSize: 14, color: AppColors.textMuted },
  summaryValue: { fontSize: 15, fontWeight: "600", color: AppColors.textDark },
  previewTitle: { fontSize: 16, fontWeight: "600", color: AppColors.textDark, marginTop: 4 },
  groupCard: { padding: 14, borderRadius: 14, backgroundColor: "#FFFFFF", gap: 10 },
  groupName: { fontSize: 15, fontWeight: "600", color: AppColors.textDark },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  memberChip: { backgroundColor: AppColors.beige },
  memberChipText: { fontSize: 12, color: AppColors.textDark },
  emptyMembers: { fontSize: 13, color: AppColors.textMuted, fontStyle: "italic" },
  importButton: { borderRadius: 12, marginTop: 8 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  snackbarError: { backgroundColor: AppColors.rose },
});
