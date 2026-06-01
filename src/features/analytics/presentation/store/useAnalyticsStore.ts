import { create } from "zustand";

import { AssessmentSummary } from "@/src/features/analytics/domain/entities/AssessmentSummary";
import { GroupDetail } from "@/src/features/analytics/domain/entities/GroupDetail";
import { StudentEvolution } from "@/src/features/analytics/domain/entities/StudentEvolution";
import {
  ActivityAnalytics,
  AnalyticsRepository,
} from "@/src/features/analytics/domain/repositories/AnalyticsRepository";

type AnalyticsState = {
  assessments: AssessmentSummary[];
  isLoadingAssessments: boolean;
  analytics: ActivityAnalytics | null;
  isLoadingAnalytics: boolean;
  groupDetail: GroupDetail | null;
  isLoadingGroupDetail: boolean;
  evolution: StudentEvolution | null;
  isLoadingEvolution: boolean;
  error: string | null;
  _repo: AnalyticsRepository | null;
  init: (repo: AnalyticsRepository) => void;
  fetchCourseAssessments: (categoryIds: string[]) => Promise<void>;
  fetchActivityAnalytics: (assessmentId: string) => Promise<void>;
  fetchGroupDetail: (assessmentId: string, groupId: string) => Promise<void>;
  fetchStudentEvolution: (categoryIds: string[], studentId: string) => Promise<void>;
  clearAnalytics: () => void;
  clearError: () => void;
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  assessments: [],
  isLoadingAssessments: false,
  analytics: null,
  isLoadingAnalytics: false,
  groupDetail: null,
  isLoadingGroupDetail: false,
  evolution: null,
  isLoadingEvolution: false,
  error: null,
  _repo: null,

  init: (repo) => set({ _repo: repo }),

  fetchCourseAssessments: async (categoryIds) => {
    const { _repo } = get();
    if (!_repo) throw new Error("AnalyticsStore not initialized");
    set({ isLoadingAssessments: true, error: null });
    try {
      set({ assessments: await _repo.getCourseAssessments(categoryIds) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingAssessments: false });
    }
  },

  fetchActivityAnalytics: async (assessmentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("AnalyticsStore not initialized");
    set({ isLoadingAnalytics: true, error: null, analytics: null });
    try {
      set({ analytics: await _repo.getActivityAnalytics(assessmentId) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },

  fetchGroupDetail: async (assessmentId, groupId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("AnalyticsStore not initialized");
    set({ isLoadingGroupDetail: true, error: null, groupDetail: null });
    try {
      set({ groupDetail: await _repo.getGroupDetail(assessmentId, groupId) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingGroupDetail: false });
    }
  },

  fetchStudentEvolution: async (categoryIds, studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("AnalyticsStore not initialized");
    set({ isLoadingEvolution: true, error: null, evolution: null });
    try {
      set({ evolution: await _repo.getStudentEvolution(categoryIds, studentId) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingEvolution: false });
    }
  },

  clearAnalytics: () => set({ analytics: null, assessments: [] }),

  clearError: () => set({ error: null }),
}));
