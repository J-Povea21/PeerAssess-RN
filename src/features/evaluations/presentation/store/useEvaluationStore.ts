// src/features/evaluations/presentation/store/useEvaluationStore.ts
import { create } from "zustand";

import { Criteria } from "@/src/features/evaluations/domain/entities/Criteria";
import { NewCriteriaScore } from "@/src/features/evaluations/domain/entities/CriteriaScore";
import { NewEvaluation } from "@/src/features/evaluations/domain/entities/Evaluation";
import { StudentResult } from "@/src/features/evaluations/domain/entities/StudentResult";
import {
  EvaluationRepository,
  PendingAssessment,
} from "@/src/features/evaluations/domain/repositories/EvaluationRepository";

type EvaluationState = {
  pendingAssessments: PendingAssessment[];
  criteriaByAssessment: Record<string, Criteria[]>;
  myResults: StudentResult[];
  isLoadingPending: boolean;
  isLoadingResults: boolean;
  isSubmitting: boolean;
  error: string | null;
  _repo: EvaluationRepository | null;

  init: (repo: EvaluationRepository) => void;
  fetchPendingAssessments: (studentId: string) => Promise<void>;
  fetchCriteria: (assessmentId: string) => Promise<void>;
  submitEvaluation: (
    evaluation: NewEvaluation,
    scores: NewCriteriaScore[],
    studentId: string
  ) => Promise<void>;
  fetchMyResults: (studentId: string) => Promise<void>;
  clearError: () => void;
};

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  pendingAssessments: [],
  criteriaByAssessment: {},
  myResults: [],
  isLoadingPending: false,
  isLoadingResults: false,
  isSubmitting: false,
  error: null,
  _repo: null,

  init: (repo) => set({ _repo: repo }),

  fetchPendingAssessments: async (studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isLoadingPending: true, error: null });
    try {
      const pending = await _repo.getPendingAssessments(studentId);
      set({ pendingAssessments: pending });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingPending: false });
    }
  },

  fetchCriteria: async (assessmentId) => {
    const { _repo, criteriaByAssessment } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    if (assessmentId in criteriaByAssessment) return;
    try {
      const criteria = await _repo.getCriteriaForAssessment(assessmentId);
      set((s) => ({
        criteriaByAssessment: { ...s.criteriaByAssessment, [assessmentId]: criteria },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  submitEvaluation: async (evaluation, scores, studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isSubmitting: true, error: null });
    try {
      await _repo.submitEvaluation(evaluation, scores);
      const pending = await _repo.getPendingAssessments(studentId);
      set({ pendingAssessments: pending });
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchMyResults: async (studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isLoadingResults: true, error: null });
    try {
      const results = await _repo.getMyResults(studentId);
      set({ myResults: results });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingResults: false });
    }
  },

  clearError: () => set({ error: null }),
}));
