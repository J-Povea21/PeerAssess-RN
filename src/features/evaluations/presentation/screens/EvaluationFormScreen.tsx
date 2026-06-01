// src/features/evaluations/presentation/screens/EvaluationFormScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Criteria } from "@/src/features/evaluations/domain/entities/Criteria";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { AppColors } from "@/src/theme/appColors";

type Peer = { userId: string; fullName: string };

type RouteParams = {
  assessmentId: string;
  assessmentTitle: string;
  deadline: string;
  peers: Peer[];
  criteria: Criteria[];
  evaluatorId: string;
};

type Props = { navigation: any; route: { params: RouteParams } };

const SCORE_VALUES = [2, 3, 4, 5] as const;

const SCORE_LABELS: Record<number, string> = {
  2: "Necesita Mejorar",
  3: "Adecuado",
  4: "Bueno",
  5: "Excelente",
};

const CRITERIA_DESCRIPTIONS: Record<string, string> = {
  Puntualidad:
    "¿Con qué frecuencia tu compañero fue puntual y asistió a las sesiones del equipo?",
  Contribuciones:
    "¿Con qué frecuencia tu compañero realizó contribuciones relevantes y constructivas al trabajo del equipo?",
  Compromiso:
    "¿Cuánto compromiso mostró tu compañero con las tareas y responsabilidades asignadas?",
  Actitud:
    "¿Con qué frecuencia tu compañero mostró una actitud positiva y de colaboración hacia el equipo?",
};

const BG_COLORS = [AppColors.beige, "#FFFFFF", AppColors.rose + "0D"] as const;

function formatCountdown(deadline: string): { text: string; urgent: boolean } {
  const remaining = new Date(deadline).getTime() - Date.now();
  if (remaining <= 0) return { text: "00:00", urgent: true };
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const text =
    hours > 0 ? `${hours}h ${pad(minutes)}m` : `${pad(minutes)}:${pad(seconds)}`;
  return { text, urgent: remaining < 5 * 60 * 1000 };
}

export default function EvaluationFormScreen({ navigation, route }: Props) {
  const { assessmentId, deadline, peers, criteria, evaluatorId } = route.params;
  const insets = useSafeAreaInsets();
  const { submitEvaluation, isSubmitting } = useEvaluationStore();

  const [currentPeerIndex, setCurrentPeerIndex] = useState(0);
  const [scores, setScores] = useState<Map<number, Map<string, number>>>(
    () => new Map(peers.map((_, i) => [i, new Map()]))
  );
  const [countdown, setCountdown] = useState(() => formatCountdown(deadline));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const result = formatCountdown(deadline);
      setCountdown(result);
      if (result.text === "00:00") {
        clearInterval(timerRef.current!);
        Alert.alert("Tiempo agotado", "El plazo de esta evaluación ha vencido.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [deadline]);

  const currentPeer = peers[currentPeerIndex];
  const currentScores = scores.get(currentPeerIndex) ?? new Map<string, number>();
  const isLastPeer = currentPeerIndex === peers.length - 1;
  const allCurrentScored = criteria.every((c) => currentScores.has(c._id));

  const setScore = useCallback(
    (criteriaId: string, score: number) => {
      setScores((prev) => {
        const next = new Map(prev);
        const peerScores = new Map(next.get(currentPeerIndex) ?? []);
        peerScores.set(criteriaId, score);
        next.set(currentPeerIndex, peerScores);
        return next;
      });
    },
    [currentPeerIndex]
  );

  const findIncompletePeer = (): Peer | null => {
    for (let i = 0; i < peers.length; i++) {
      const peerScores = scores.get(i) ?? new Map<string, number>();
      const complete = criteria.every((c) => {
        const score = peerScores.get(c._id);
        return score !== undefined && (SCORE_VALUES as readonly number[]).includes(score);
      });
      if (!complete) return peers[i];
    }
    return null;
  };

  const handleNext = () => {
    if (!allCurrentScored) {
      Alert.alert("Evaluación incompleta", "Selecciona una puntuación para cada criterio.");
      return;
    }
    setCurrentPeerIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (!allCurrentScored) {
      Alert.alert(
        "Evaluación incompleta",
        "Completa la puntuación de este compañero antes de regresar."
      );
      return;
    }
    setCurrentPeerIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    const incomplete = findIncompletePeer();
    if (incomplete) {
      Alert.alert(
        "Evaluación incompleta",
        `Faltan puntuaciones para ${incomplete.fullName}.`
      );
      return;
    }

    useEvaluationStore.setState({ isSubmitting: true, error: null });
    try {
      for (const [peerIdx, peer] of peers.entries()) {
        const peerScores = scores.get(peerIdx) ?? new Map<string, number>();
        const criteriaScores = criteria.map((c) => ({
          criteriaId: c._id,
          score: peerScores.get(c._id) ?? 0,
          evaluationId: "",
        }));
        try {
          await submitEvaluation(
            {
              assessmentId,
              evaluatorId,
              evaluatedId: peer.userId,
              totalScore: 0,
              submittedAt: new Date().toISOString(),
            },
            criteriaScores,
          
          );
        } catch (e) {
          Alert.alert("Error", `Falló la evaluación de ${peer.fullName}: ${(e as Error).message}`);
          return;
        }
      }
      await useEvaluationStore.getState().refreshAfterSubmit(evaluatorId);
      Alert.alert("¡Listo!", "Tu evaluación fue enviada exitosamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      useEvaluationStore.setState({ isSubmitting: false });
    }
  };

  const peerInitials = currentPeer.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const progress = (currentPeerIndex + 1) / peers.length;

  return (
    <LinearGradient colors={BG_COLORS} style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color={AppColors.textDark} onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={`Evaluar a ${currentPeer.fullName}`}
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <View style={styles.progressHeader}>
        <Text style={styles.peerProgress}>
          Compañero {currentPeerIndex + 1} de {peers.length}
        </Text>
        <View
          style={[
            styles.countdownBadge,
            countdown.urgent && { backgroundColor: AppColors.salmon + "1F" },
          ]}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={12}
            color={countdown.urgent ? AppColors.salmon : AppColors.textMuted}
          />
          <Text
            style={[styles.countdownText, countdown.urgent && { color: AppColors.salmon }]}
          >
            {" "}{countdown.text}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{peerInitials}</Text>
          </View>
          <Text style={styles.peerName}>{currentPeer.fullName}</Text>
        </View>

        {criteria.map((c) => {
          const selectedScore = currentScores.get(c._id);
          return (
            <View key={c._id} style={styles.criteriaCard}>
              <Text style={styles.criteriaName}>{c.name}</Text>
              {CRITERIA_DESCRIPTIONS[c.name] && (
                <Text style={styles.criteriaDesc}>{CRITERIA_DESCRIPTIONS[c.name]}</Text>
              )}
              <View style={styles.scoreRow}>
                {SCORE_VALUES.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.scoreButton,
                      selectedScore === val && styles.scoreButtonSelected,
                    ]}
                    onPress={() => setScore(c._id, val)}
                  >
                    <Text
                      style={[
                        styles.scoreButtonText,
                        selectedScore === val && styles.scoreButtonTextSelected,
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedScore != null && (
                <Text style={styles.scoreLabel}>{SCORE_LABELS[selectedScore]}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {currentPeerIndex > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
            <Text style={styles.prevButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}
        {isLastPeer ? (
          <TouchableOpacity
            style={[styles.nextButton, styles.nextButtonFull, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, styles.nextButtonFull]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: "transparent", elevation: 0 },
  appbarTitle: { fontSize: 16, fontWeight: "600", color: AppColors.textDark },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  peerProgress: { fontSize: 13, color: AppColors.textMuted, fontWeight: "600" },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.textMuted + "1F",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countdownText: { fontSize: 12, color: AppColors.textMuted, fontWeight: "600" },
  progressBarTrack: {
    height: 4,
    backgroundColor: AppColors.beige,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: { height: 4, backgroundColor: AppColors.olive, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  avatarContainer: { alignItems: "center", marginVertical: 20 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.olive,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: { color: "#FFFFFF", fontSize: 24, fontWeight: "600" },
  peerName: { fontSize: 17, fontWeight: "600", color: AppColors.textDark },
  criteriaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  criteriaName: { fontSize: 15, fontWeight: "700", color: AppColors.textDark, marginBottom: 4 },
  criteriaDesc: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },
  scoreRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  scoreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.textMuted + "1F",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreButtonSelected: { backgroundColor: AppColors.olive },
  scoreButtonText: { fontSize: 16, fontWeight: "700", color: AppColors.textDark },
  scoreButtonTextSelected: { color: "#FFFFFF" },
  scoreLabel: {
    textAlign: "center",
    fontSize: 12,
    color: AppColors.olive,
    fontWeight: "600",
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  prevButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AppColors.olive,
  },
  prevButtonText: { fontSize: 15, fontWeight: "600", color: AppColors.olive, textAlign: "center" },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: AppColors.olive,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF", textAlign: "center" },
  buttonDisabled: { opacity: 0.6 },
});
