import { create } from "zustand";

import { Course } from "@/src/features/courses/domain/entities/Course";
import { CourseMember } from "@/src/features/courses/domain/entities/CourseMember";
import { CourseRepository } from "@/src/features/courses/domain/repositories/CourseRepository";

type CourseState = {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  membersByCourse: Record<string, CourseMember[]>;
  isLoadingMembers: boolean;
  _repo: CourseRepository | null;
  _cachedStudentId: string | null;
  _isFetched: boolean;
  _membersFetched: Set<string>;
  init: (repo: CourseRepository) => void;
  fetchCoursesByStudent: (studentId: string) => Promise<void>;
  joinCourse: (accessCode: string, studentId: string) => Promise<void>;
  fetchCourseMembers: (courseId: string) => Promise<void>;
  clearError: () => void;
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: false,
  error: null,
  membersByCourse: {},
  isLoadingMembers: false,
  _repo: null,
  _cachedStudentId: null,
  _isFetched: false,
  _membersFetched: new Set<string>(),

  init: (repo) => set({ _repo: repo }),

  fetchCoursesByStudent: async (studentId) => {
    const { _repo, _cachedStudentId, _isFetched } = get();
    if (!_repo) throw new Error("CourseStore not initialized");
    if (_cachedStudentId === studentId && _isFetched) return;

    set({ isLoading: true, error: null });
    try {
      const fetched = await _repo.getCoursesByStudent(studentId);
      set({ courses: fetched, _cachedStudentId: studentId, _isFetched: true });
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
      set({ _cachedStudentId: null, _isFetched: false });
      const fetched = await _repo.getCoursesByStudent(studentId);
      set({ courses: fetched, _cachedStudentId: studentId, _isFetched: true });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourseMembers: async (courseId) => {
    const { _repo, _membersFetched } = get();
    if (!_repo) throw new Error("CourseStore not initialized");
    if (_membersFetched.has(courseId)) return;

    set({ isLoadingMembers: true, error: null });
    try {
      const members = await _repo.getMembersByCourse(courseId);
      const nextFetched = new Set(_membersFetched);
      nextFetched.add(courseId);
      set((state) => ({
        membersByCourse: { ...state.membersByCourse, [courseId]: members },
        _membersFetched: nextFetched,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingMembers: false });
    }
  },

  clearError: () => set({ error: null }),
}));
