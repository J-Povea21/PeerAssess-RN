import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Surface, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { CoursesStackParamList } from "@/src/navigation/CoursesStackNavigator";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = NativeStackScreenProps<CoursesStackParamList, "GroupMembers">;

export default function GroupMembersScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { membersByGroup, studentNames, isLoadingMembers, fetchMembersByGroup, fetchStudentNames } = useGroupStore();

  const members = membersByGroup[groupId] ?? [];

  useEffect(() => {
    fetchMembersByGroup(groupId);
  }, [groupId, fetchMembersByGroup]);

  useEffect(() => {
    const ids = members.map((m) => m.studentID);
    if (ids.length > 0) fetchStudentNames(ids);
  }, [members, fetchStudentNames]);

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title={groupName} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {isLoadingMembers ? (
        <View style={styles.centered}>
          <ActivityIndicator color={AppColors.olive} />
        </View>
      ) : members.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={48}
            color={AppColors.textMuted}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No hay miembros en este grupo</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {members.map((member) => (
            <Surface key={member._id} style={styles.row} elevation={1}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={22}
                  color={AppColors.olive}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>
                  {studentNames[member.studentID] ?? member.studentID}
                </Text>
              </View>
            </Surface>
          ))}
        </ScrollView>
      )}
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
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.olive + "1F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    color: AppColors.textDark,
    fontWeight: "500",
  },
});
