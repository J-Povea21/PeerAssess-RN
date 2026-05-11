// src/features/evaluations/presentation/store/useEvaluationStore.ts
import { create } from "zustand";

import { Criteria } from "@/src/features/evaluations/domain/entities/Criteria";
import { NewCriteriaScore } from "@/src/features/evaluations/domain/entities/CriteriaScore";
import { NewEvaluation } from "@/src/features/evaluations/domain/entities/Evaluation";
import { StudentResult } from "@/src/features/evaluations/domain/entities/StudentResult";
import {
  CourseAssessment,
  EvaluationRepository,
  PendingAssessment,
} from "@/src/features/evaluations/domain/repositories/EvaluationRepository";

type EvaluationState = {
  pendingAssessments: PendingAssessment[];
  courseAssessments: CourseAssessment[];
  criteriaByAssessment: Record<string, Criteria[]>;
  myResults: StudentResult[];
  isLoadingPending: boolean;
  isLoadingCourseAssessments: boolean;
  isLoadingResults: boolean;
  isSubmitting: boolean;
  error: string | null;
  _repo: EvaluationRepository | null;

  init: (repo: EvaluationRepository) => void;
  fetchPendingAssessments: (studentId: string) => Promise<void>;
  fetchAssessmentsForCourse: (studentId: string, categoryIds: string[]) => Promise<void>;
  fetchCriteria: (assessmentId: string) => Promise<void>;
  submitEvaluation: (
    evaluation: NewEvaluation,
    scores: NewCriteriaScore[],
  ) => Promise<void>;
  fetchMyResults: (studentId: string) => Promise<void>;
  refreshAfterSubmit: (studentId: string) => Promise<void>;
  clearError: () => void;
};

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  pendingAssessments: [],
  courseAssessments: [],
  criteriaByAssessment: {},
  myResults: [],
  isLoadingPending: false,
  isLoadingCourseAssessments: false,
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

  fetchAssessmentsForCourse: async (studentId, categoryIds) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isLoadingCourseAssessments: true, error: null });
    try {
      const assessments = await _repo.getAssessmentsForCourse(studentId, categoryIds);
      set({ courseAssessments: assessments });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingCourseAssessments: false });
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

 submitEvaluation: async (evaluation, scores) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    try {
      await _repo.submitEvaluation(evaluation, scores);
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  refreshAfterSubmit: async (studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    try {
      const [pending, courseAssessments] = await Promise.all([
        _repo.getPendingAssessments(studentId),
        _repo.getAssessmentsForCourse(
          studentId,
          [...new Set(get().courseAssessments.map((a) => a.assessment.categoryId))]
        ),
      ]);
      set({ pendingAssessments: pending, courseAssessments });
    } catch (e) {
      set({ error: (e as Error).message });
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
