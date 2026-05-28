import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, FAB, Snackbar, Surface, Text, TouchableRipple } from "react-native-paper";

import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";
import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";

type Props = {
  courseId: string;
  navigation: any;
};

export default function CategoriasTab({ courseId, navigation }: Props) {
  const { user } = useAuthStore();
  const { categoriesByCourse, isLoadingCategories, error, fetchCategories, clearError } = useGroupStore();
  const categories = categoriesByCourse[courseId] ?? [];

  useFocusEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => {
      fetchCategories(courseId);
    }, [courseId])
  );

  return (
    <>
      {isLoadingCategories && categories.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={AppColors.olive} />
        </View>
      ) : !isLoadingCategories && categories.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="tag-multiple-outline"
            size={48}
            color={AppColors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No hay categorías en este curso</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableRipple
              key={cat._id}
              onPress={() =>
                navigation.navigate("GroupList", {
                  categoryId: cat._id,
                  categoryName: cat.name,
                })
              }
            >
              <Surface style={styles.row} elevation={1}>
                <View style={styles.rowIcon}>
                  <MaterialCommunityIcons name="tag-outline" size={22} color={AppColors.olive} />
                </View>
                <Text style={styles.rowLabel}>{cat.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={AppColors.textMuted} />
              </Surface>
            </TouchableRipple>
          ))}
        </ScrollView>
      )}
<Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        style={styles.snackbarError}
      >
        {error}
      </Snackbar>
      {user?.role === "teacher" && (
        <FAB
          icon="plus"
          label="Importar CSV"
          style={styles.fab}
          color="#FFFFFF"
          onPress={() => navigation.navigate("ImportCsv", { courseId })}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.olive + "1F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textDark,
    fontWeight: "500",
  },
snackbarError: {
    backgroundColor: AppColors.rose,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: AppColors.olive,
  },
});
