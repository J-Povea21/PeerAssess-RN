import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { CourseMember } from "@/src/features/courses/domain/entities/CourseMember";
import { AppColors } from "@/src/theme/appColors";

type Props = {
  member: CourseMember;
};

function getInitials(fullName: string, fallbackEmail: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0][0].toUpperCase();
  }
  const emailFirst = fallbackEmail.trim()[0];
  return (emailFirst ?? "?").toUpperCase();
}

export default function MemberRow({ member }: Props) {
  const displayName = member.fullName.trim().length > 0 ? member.fullName : member.email;
  const initials = getInitials(member.fullName, member.email);

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {member.email}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.olive + "26",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.olive,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textDark,
  },
  email: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
});
