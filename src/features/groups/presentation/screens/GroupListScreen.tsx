import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Chip, Snackbar, Surface, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { CoursesStackParamList } from "@/src/navigation/CoursesStackNavigator";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = NativeStackScreenProps<CoursesStackParamList, "GroupList">;

export default function GroupListScreen({ navigation, route }: Props) {
  const { categoryId, categoryName } = route.params;
  const { user } = useAuthStore();
  const {
    groupsByCategory,
    myGroupIds,
    isLoadingGroups,
    isLoadingMembership,
    error,
    fetchGroups,
    fetchMyMembership,
    clearError,
  } = useGroupStore();

  const groups = groupsByCategory[categoryId] ?? [];

  useEffect(() => {
    fetchGroups(categoryId);
    if (user?.id) fetchMyMembership(user.id);
  }, [categoryId, user?.id, fetchGroups, fetchMyMembership]);

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title={categoryName} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {isLoadingGroups || isLoadingMembership ? (
        <View style={styles.centered}>
          <ActivityIndicator color={AppColors.olive} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={48}
            color={AppColors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No hay grupos en esta categoría</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {groups.map((group) => {
            const isMine = myGroupIds.includes(group._id);
            return (
              <Surface
                key={group._id}
                style={[styles.row, isMine && styles.rowHighlighted]}
                elevation={1}
              >
                <View style={[styles.rowIcon, isMine && styles.rowIconHighlighted]}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={22}
                    color={isMine ? "#FFFFFF" : AppColors.olive}
                  />
                </View>
                <Text style={[styles.rowLabel, isMine && styles.rowLabelHighlighted]}>
                  {group.name}
                </Text>
                {isMine && (
                  <Chip style={styles.myChip} textStyle={styles.myChipText} compact>
                    Tu grupo
                  </Chip>
                )}
              </Surface>
            );
          })}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: { opacity: 0.5 },
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
  rowHighlighted: {
    backgroundColor: AppColors.olive + "1F",
    borderWidth: 1.5,
    borderColor: AppColors.olive,
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
  rowIconHighlighted: {
    backgroundColor: AppColors.olive,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textDark,
    fontWeight: "500",
  },
  rowLabelHighlighted: {
    fontWeight: "600",
  },
  myChip: {
    backgroundColor: AppColors.olive,
    height: 28,
  },
  myChipText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  snackbarError: {
    backgroundColor: AppColors.rose,
  },
});
