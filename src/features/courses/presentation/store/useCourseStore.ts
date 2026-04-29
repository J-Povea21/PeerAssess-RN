import { create } from "zustand";

import { Course } from "@/src/features/courses/domain/entities/Course";
import { CourseRepository } from "@/src/features/courses/domain/repositories/CourseRepository";

type CourseState = {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  _repo: CourseRepository | null;
  _cachedStudentId: string | null;
  init: (repo: CourseRepository) => void;
  fetchCoursesByStudent: (studentId: string) => Promise<void>;
  joinCourse: (accessCode: string, studentId: string) => Promise<void>;
  clearError: () => void;
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: false,
  error: null,
  _repo: null,
  _cachedStudentId: null,

  init: (repo) => set({ _repo: repo }),

  fetchCoursesByStudent: async (studentId) => {
    const { _repo, _cachedStudentId, courses } = get();
    if (!_repo) throw new Error("CourseStore not initialized");
    if (_cachedStudentId === studentId && courses.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const fetched = await _repo.getCoursesByStudent(studentId);
      set({ courses: fetched, _cachedStudentId: studentId });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  joinCourse: async (accessCode, studentId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("CourseStore not initialized");

    set({ isLoading: true, error: null });
    try {
      await _repo.joinCourse(accessCode, studentId);
      set({ _cachedStudentId: null });
      const fetched = await _repo.getCoursesByStudent(studentId);
      set({ courses: fetched, _cachedStudentId: studentId });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
