// src/features/analytics/presentation/screens/GroupResultsScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MemberResult } from "@/src/features/analytics/domain/entities/MemberResult";
import { useAnalyticsStore } from "@/src/features/analytics/presentation/store/useAnalyticsStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = {
  navigation: any;
  route: {
    params: { assessmentId: string; groupId: string; groupName: string; categoryIds: string[] };
  };
};

export default function GroupResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { assessmentId, groupId, groupName, categoryIds } = route.params;
  const { groupDetail, isLoadingGroupDetail, fetchGroupDetail } = useAnalyticsStore();

  useEffect(() => {
    fetchGroupDetail(assessmentId, groupId);
  }, [assessmentId, groupId]);

  const openEvolution = (member: MemberResult) => {
    navigation.navigate("StudentEvolution", {
      studentId: member.studentId,
      fullName: member.fullName,
      categoryIds,
    });
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={[styles.appbar, { paddingTop: insets.top }]}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content title={groupName} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {isLoadingGroupDetail && !groupDetail ? (
        <ActivityIndicator color={AppColors.olive} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {groupDetail && (
            <Text style={styles.subtitle}>{groupDetail.assessmentTitle}</Text>
          )}

          {(groupDetail?.members ?? []).length === 0 ? (
            <Text style={styles.muted}>Este grupo aún no tiene evaluaciones.</Text>
          ) : (
            groupDetail?.members.map((m) => (
              <TouchableOpacity
                key={m.studentId}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => openEvolution(m)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.nameWrap}>
                    <Text style={styles.name}>{m.fullName}</Text>
                    <Text style={styles.evalCount}>
                      {m.evaluationCount}{" "}
                      {m.evaluationCount === 1 ? "evaluación" : "evaluaciones"}
                    </Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreValue}>{m.average.toFixed(1)}</Text>
                  </View>
                </View>

                {m.criteriaAverages.map((c) => (
                  <View key={c.criteriaId} style={styles.criteriaRow}>
                    <View style={styles.criteriaHeader}>
                      <Text style={styles.criteriaName}>{c.criteriaName}</Text>
                      <Text style={styles.criteriaScore}>{c.average.toFixed(1)}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min((c.average / 5) * 100, 100)}%` as any },
                        ]}
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.evolutionHint}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={14}
                    color={AppColors.olive}
                  />
                  <Text style={styles.evolutionHintText}>Ver evolución</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: AppColors.textDark },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  subtitle: { fontSize: 13, color: AppColors.textMuted, marginBottom: 16 },
  muted: { fontSize: 13, color: AppColors.textMuted, marginTop: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  nameWrap: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: AppColors.textDark },
  evalCount: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  scorePill: {
    backgroundColor: AppColors.wheat,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scoreValue: { fontSize: 16, fontWeight: "700", color: AppColors.textDark },
  criteriaRow: { marginBottom: 10 },
  criteriaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  criteriaName: { fontSize: 13, color: AppColors.textDark },
  criteriaScore: { fontSize: 13, color: AppColors.olive, fontWeight: "700" },
  progressTrack: {
    height: 7,
    backgroundColor: AppColors.beige,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 7, backgroundColor: AppColors.olive, borderRadius: 4 },
  evolutionHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  evolutionHintText: { fontSize: 12, color: AppColors.olive, fontWeight: "600" },
});
