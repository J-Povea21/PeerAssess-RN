import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors } from "@/src/theme/appColors";
import { useAuthStore } from "../store/useAuthStore";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

const ROLE_LABEL: Record<string, string> = {
  student: "Estudiante",
  teacher: "Profesor",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((w) => w[0]?.toUpperCase() ?? "").join("");
  return initials || "?";
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading, logout } = useAuthStore();

  if (!user) {
    return (
      <LinearGradient colors={BG_COLORS} style={styles.centered}>
        <ActivityIndicator color={AppColors.olive} />
      </LinearGradient>
    );
  }

  const initials = getInitials(user.name);
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Mi cuenta</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{user.name}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={AppColors.textMuted}
            />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Button
            mode="contained"
            onPress={logout}
            loading={isLoading}
            disabled={isLoading}
            icon="logout"
            style={styles.logoutButton}
            contentStyle={styles.logoutContent}
            labelStyle={styles.logoutLabel}
            buttonColor={AppColors.rose}
            textColor="#FFFFFF"
          >
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: AppColors.textDark,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.olive,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textDark,
    textAlign: "center",
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: AppColors.beige,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textDark,
    letterSpacing: 0.4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.textMuted + "33",
  },
  infoTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    color: AppColors.textDark,
    marginTop: 2,
  },
  actionsCard: {
    marginTop: 24,
  },
  logoutButton: {
    borderRadius: 14,
  },
  logoutContent: {
    height: 52,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
