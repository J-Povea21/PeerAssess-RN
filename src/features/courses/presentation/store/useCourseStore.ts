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
  teacherCourses: Course[];
  isLoadingTeacher: boolean;
  isCreating: boolean;
  _repo: CourseRepository | null;
  _cachedStudentId: string | null;
  _isFetched: boolean;
  _membersFetched: Record<string, true>;
  _cachedTeacherId: string | null;
  _isTeacherFetched: boolean;
  init: (repo: CourseRepository) => void;
  fetchCoursesByStudent: (studentId: string) => Promise<void>;
  fetchCoursesByTeacher: (teacherId: string) => Promise<void>;
  joinCourse: (accessCode: string, studentId: string) => Promise<void>;
  fetchCourseMembers: (courseId: string) => Promise<void>;
  createCourse: (name: string, semester: string, teacherId: string) => Promise<void>;
  clearError: () => void;
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  isLoading: false,
  error: null,
  membersByCourse: {},
  isLoadingMembers: false,
  teacherCourses: [],
  isLoadingTeacher: false,
  isCreating: false,
  _repo: null,
  _cachedStudentId: null,
  _isFetched: false,
  _membersFetched: {} as Record<string, true>,
  _cachedTeacherId: null,
  _isTeacherFetched: false,

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

  fetchCoursesByTeacher: async (teacherId) => {
    const { _repo, _cachedTeacherId, _isTeacherFetched } = get();
    if (!_repo) throw new Error("CourseStore not initialized");
    if (_cachedTeacherId === teacherId && _isTeacherFetched) return;

    set({ isLoadingTeacher: true, error: null });
    try {
      const fetched = await _repo.getCoursesByTeacher(teacherId);
      set({ teacherCourses: fetched, _cachedTeacherId: teacherId, _isTeacherFetched: true });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingTeacher: false });
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
    if (_membersFetched[courseId]) return;

    set({ isLoadingMembers: true, error: null });
    try {
      const members = await _repo.getMembersByCourse(courseId);
      set((state) => ({
        membersByCourse: { ...state.membersByCourse, [courseId]: members },
        _membersFetched: { ...state._membersFetched, [courseId]: true },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingMembers: false });
    }
  },

  createCourse: async (name, semester, teacherId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("CourseStore not initialized");

    set({ isCreating: true });
    try {
      const created = await _repo.createCourse(name, semester, teacherId);
      // Optimistically prepend the new course and bust the cache so the next
      // focus-effect re-fetch picks up any server-side changes too.
      set((state) => ({
        teacherCourses: [created, ...state.teacherCourses],
        _isTeacherFetched: false,
        _cachedTeacherId: null,
      }));
    } catch (e) {
      throw e; // screen handles error display via try/catch
    } finally {
      set({ isCreating: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export const selectTeacherStats = (state: CourseState) => ({
  activeCourses: state.teacherCourses.filter((c) => c.status === "active").length,
  totalEvaluations: state.teacherCourses.reduce((sum, c) => sum + c.evaluationCount, 0),
  totalStudents: state.teacherCourses.reduce((sum, c) => sum + c.studentCount, 0),
});
