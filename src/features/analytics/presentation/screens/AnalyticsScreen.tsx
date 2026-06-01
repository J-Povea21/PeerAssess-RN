// src/features/analytics/presentation/screens/AnalyticsScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { AnomalyEvent } from "@/src/features/analytics/domain/entities/AnomalyEvent";
import { GroupAverage } from "@/src/features/analytics/domain/entities/GroupAverage";
import GroupBarChart from "@/src/features/analytics/presentation/components/GroupBarChart";
import { useAnalyticsStore } from "@/src/features/analytics/presentation/store/useAnalyticsStore";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { AppColors } from "@/src/theme/appColors";

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

type Props = { navigation: any };

export default function AnalyticsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { teacherCourses, fetchCoursesByTeacher } = useCourseStore();
  const { categoriesByCourse, fetchCategories } = useGroupStore();
  const {
    assessments,
    isLoadingAssessments,
    analytics,
    isLoadingAnalytics,
    fetchCourseAssessments,
    fetchActivityAnalytics,
    clearAnalytics,
  } = useAnalyticsStore();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showAssessmentPicker, setShowAssessmentPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchCoursesByTeacher(user.id);
    }, [user?.id])
  );

  const categoryIds = useMemo(
    () => (courseId ? (categoriesByCourse[courseId] ?? []).map((c) => c._id) : []),
    [categoriesByCourse, courseId]
  );

  // When the course changes, reset selection and load its assessments.
  useEffect(() => {
    if (!courseId) return;
    setAssessmentId(null);
    clearAnalytics();
    (async () => {
      await fetchCategories(courseId);
      const cats = useGroupStore.getState().categoriesByCourse[courseId] ?? [];
      await fetchCourseAssessments(cats.map((c) => c._id));
    })();
  }, [courseId]);

  // Auto-select the most recent assessment once the list arrives.
  useEffect(() => {
    if (assessments.length > 0 && assessmentId === null) {
      setAssessmentId(assessments[0].assessmentId);
    }
  }, [assessments]);

  useEffect(() => {
    if (assessmentId) fetchActivityAnalytics(assessmentId);
  }, [assessmentId]);

  const selectedCourse = teacherCourses.find((c) => c._id === courseId) ?? null;
  const selectedAssessment = assessments.find((a) => a.assessmentId === assessmentId) ?? null;
  const equityGroups = (analytics?.groups ?? []).filter((g) => g.isEquityAlert);

  const handleBarPress = (groupId: string) => {
    const group = analytics?.groups.find((g) => g.groupId === groupId);
    if (!group || !assessmentId) return;
    navigation.navigate("GroupResults", {
      assessmentId,
      groupId,
      groupName: group.groupName,
      categoryIds,
    });
  };

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={[styles.appbar, { paddingTop: insets.top }]}>
        <Appbar.Content title="Analíticas" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.picker} onPress={() => setShowCoursePicker(true)}>
          <MaterialCommunityIcons name="book-outline" size={18} color={AppColors.olive} />
          <Text style={styles.pickerLabel} numberOfLines={1}>
            {selectedCourse?.name ?? "Seleccionar curso"}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        {courseId && (
          <TouchableOpacity
            style={styles.picker}
            onPress={() => assessments.length > 0 && setShowAssessmentPicker(true)}
          >
            <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={AppColors.olive} />
            <Text style={styles.pickerLabel} numberOfLines={1}>
              {selectedAssessment?.title ??
                (isLoadingAssessments ? "Cargando evaluaciones…" : "Sin evaluaciones")}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        )}

        {!courseId && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={56}
              color={AppColors.textMuted}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyTitle}>Selecciona un curso</Text>
            <Text style={styles.emptySubtitle}>
              Elige un curso y una evaluación para ver{"\n"}promedios por grupo y alertas.
            </Text>
          </View>
        )}

        {courseId && isLoadingAnalytics && (
          <ActivityIndicator color={AppColors.olive} style={{ marginTop: 40 }} />
        )}

        {courseId && !isLoadingAnalytics && analytics && (
          <>
            <View style={styles.statsRow}>
              <StatBox label="Promedio" value={analytics.overview.average.toFixed(1)} />
              <StatBox label="Desv. estándar" value={analytics.overview.stdDev.toFixed(2)} />
              <StatBox
                label="Anomalías"
                value={String(analytics.overview.anomalyCount)}
                alert={analytics.overview.anomalyCount > 0}
              />
            </View>

            <Text style={styles.sectionLabel}>PROMEDIO POR GRUPO</Text>
            {analytics.groups.length === 0 ? (
              <Text style={styles.muted}>Aún no hay evaluaciones para esta actividad.</Text>
            ) : (
              <>
                <GroupBarChart
                  data={analytics.groups.map((g) => ({
                    key: g.groupId,
                    label: g.groupName,
                    value: g.average,
                    highlight: g.isEquityAlert,
                  }))}
                  onBarPress={handleBarPress}
                />
                <Text style={styles.hint}>Toca un grupo para ver el detalle por estudiante.</Text>
              </>
            )}

            {equityGroups.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>ALERTAS DE EQUIDAD</Text>
                {equityGroups.map((g) => (
                  <EquityCard key={g.groupId} group={g} />
                ))}
              </>
            )}

            {analytics.anomalies.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>ANOMALÍAS DETECTADAS</Text>
                {analytics.anomalies.map((a) => (
                  <AnomalyCard key={a.id} anomaly={a} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <PickerSheet
        visible={showCoursePicker}
        title="Seleccionar curso"
        onClose={() => setShowCoursePicker(false)}
        options={teacherCourses.map((c) => ({ id: c._id, label: c.name }))}
        selectedId={courseId}
        onSelect={(id) => {
          setCourseId(id);
          setShowCoursePicker(false);
        }}
      />
      <PickerSheet
        visible={showAssessmentPicker}
        title="Seleccionar evaluación"
        onClose={() => setShowAssessmentPicker(false)}
        options={assessments.map((a) => ({ id: a.assessmentId, label: a.title }))}
        selectedId={assessmentId}
        onSelect={(id) => {
          setAssessmentId(id);
          setShowAssessmentPicker(false);
        }}
      />
    </LinearGradient>
  );
}

function StatBox({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, alert && { color: AppColors.rose }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EquityCard({ group }: { group: GroupAverage }) {
  const above = group.equityDirection === "above";
  return (
    <View style={styles.alertCard}>
      <MaterialCommunityIcons
        name={above ? "trending-up" : "trending-down"}
        size={20}
        color={AppColors.rose}
      />
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle}>{group.groupName}</Text>
        <Text style={styles.alertText}>
          Promedio {group.average.toFixed(1)} — {above ? "por encima" : "por debajo"} del promedio
          de la actividad.
        </Text>
      </View>
    </View>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AnomalyEvent }) {
  const icon =
    anomaly.type === "low_participation" ? "account-alert-outline" : "alert-octagon-outline";
  return (
    <View style={styles.alertCard}>
      <MaterialCommunityIcons name={icon} size={20} color={AppColors.salmon} />
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle}>
          {anomaly.fullName} · {anomaly.groupName}
        </Text>
        <Text style={styles.alertText}>{anomaly.description}</Text>
      </View>
    </View>
  );
}

type PickerOption = { id: string; label: string };

function PickerSheet({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.length === 0 ? (
            <Text style={styles.muted}>No hay opciones disponibles.</Text>
          ) : (
            options.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[styles.modalItem, o.id === selectedId && styles.modalItemSelected]}
                onPress={() => onSelect(o.id)}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    o.id === selectedId && styles.modalItemTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: AppColors.textDark },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerLabel: { flex: 1, fontSize: 14, color: AppColors.textDark, fontWeight: "500", marginLeft: 10 },
  chevron: { fontSize: 14, color: AppColors.textMuted, marginLeft: 8 },
  emptyState: { alignItems: "center", paddingVertical: 56 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: AppColors.textMuted, marginTop: 12 },
  emptySubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 8 },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: AppColors.textDark },
  statLabel: { fontSize: 11, color: AppColors.textMuted, marginTop: 4, textAlign: "center" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  hint: { fontSize: 12, color: AppColors.textMuted, marginTop: 6, fontStyle: "italic" },
  muted: { fontSize: 13, color: AppColors.textMuted },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  alertBody: { flex: 1, marginLeft: 12 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: AppColors.textDark },
  alertText: { fontSize: 13, color: AppColors.textMuted, marginTop: 3, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: AppColors.textDark, marginBottom: 16 },
  modalItem: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  modalItemSelected: { backgroundColor: AppColors.olive + "1F" },
  modalItemText: { fontSize: 14, color: AppColors.textDark },
  modalItemTextSelected: { color: AppColors.olive, fontWeight: "600" },
});
