// src/features/evaluations/presentation/store/useEvaluationStore.ts
import { create } from "zustand";

import { Assessment, NewAssessment } from "@/src/features/evaluations/domain/entities/Assessment";
import { Criteria, NewCriteria } from "@/src/features/evaluations/domain/entities/Criteria";
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
  allCourseAssessments: Assessment[];
  isLoadingAllCourseAssessments: boolean;
  criteriaByAssessment: Record<string, Criteria[]>;
  myResults: StudentResult[];
  isLoadingPending: boolean;
  isLoadingCourseAssessments: boolean;
  isLoadingResults: boolean;
  isSubmitting: boolean;
  isCreating: boolean;
  error: string | null;
  _repo: EvaluationRepository | null;

  init: (repo: EvaluationRepository) => void;
  fetchPendingAssessments: (studentId: string) => Promise<void>;
  fetchAssessmentsForCourse: (studentId: string, categoryIds: string[]) => Promise<void>;
  fetchAllAssessmentsForCourse: (categoryIds: string[]) => Promise<void>;
  fetchCriteria: (assessmentId: string) => Promise<void>;
  submitEvaluation: (
    evaluation: NewEvaluation,
    scores: NewCriteriaScore[],
  ) => Promise<void>;
  fetchMyResults: (studentId: string) => Promise<void>;
  refreshAfterSubmit: (studentId: string) => Promise<void>;
  createAssessment: (
    assessment: NewAssessment,
    criteria: NewCriteria[],
    courseId: string,
  ) => Promise<Assessment>;
  closeAssessment: (assessmentId: string) => Promise<void>;
  openAssessment: (assessmentId: string) => Promise<void>;
  clearError: () => void;
};

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  pendingAssessments: [],
  courseAssessments: [],
  allCourseAssessments: [],
  isLoadingAllCourseAssessments: false,
  criteriaByAssessment: {},
  myResults: [],
  isLoadingPending: false,
  isLoadingCourseAssessments: false,
  isLoadingResults: false,
  isSubmitting: false,
  isCreating: false,
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
  
  fetchAllAssessmentsForCourse: async (categoryIds) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isLoadingAllCourseAssessments: true, error: null });
    try {
      const assessments = await _repo.getAssessmentsByCourse(categoryIds);
      set({ allCourseAssessments: assessments });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingAllCourseAssessments: false });
    }
  },

 fetchCriteria: async (assessmentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set((s) => {
      const next = { ...s.criteriaByAssessment };
      delete next[assessmentId];
      return { criteriaByAssessment: next };
    });
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

  createAssessment: async (assessment, criteria, courseId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    set({ isCreating: true, error: null });
    try {
      const created = await _repo.createAssessment(assessment, criteria, courseId);
      set((s) => ({ allCourseAssessments: [...s.allCourseAssessments, created] }));
      return created;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    } finally {
      set({ isCreating: false });
    }
  },

  closeAssessment: async (assessmentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    try {
      await _repo.closeAssessment(assessmentId);
      const categoryIds = [...new Set(get().allCourseAssessments.map((a) => a.categoryId))];
      await get().fetchAllAssessmentsForCourse(categoryIds);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  openAssessment: async (assessmentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("EvaluationStore not initialized");
    try {
      await _repo.openAssessment(assessmentId);
      const categoryIds = [...new Set(get().allCourseAssessments.map((a) => a.categoryId))];
      await get().fetchAllAssessmentsForCourse(categoryIds);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
