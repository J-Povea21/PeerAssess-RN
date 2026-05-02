import { create } from "zustand";

import { Group } from "@/src/features/groups/domain/entities/Group";
import { GroupCategory } from "@/src/features/groups/domain/entities/GroupCategory";
import { GroupRepository } from "@/src/features/groups/domain/repositories/GroupRepository";

type GroupState = {
  categoriesByCourse: Record<string, GroupCategory[]>;
  groupsByCategory: Record<string, Group[]>;
  myGroupIds: string[];
  _membershipStudentId: string | null;
  isLoadingCategories: boolean;
  isLoadingGroups: boolean;
  error: string | null;
  _repo: GroupRepository | null;
  init: (repo: GroupRepository) => void;
  fetchCategories: (courseId: string) => Promise<void>;
  fetchGroups: (categoryId: string) => Promise<void>;
  fetchMyMembership: (studentId: string) => Promise<void>;
  clearError: () => void;
};

export const useGroupStore = create<GroupState>((set, get) => ({
  categoriesByCourse: {},
  groupsByCategory: {},
  myGroupIds: [],
  _membershipStudentId: null,
  isLoadingCategories: false,
  isLoadingGroups: false,
  error: null,
  _repo: null,

  init: (repo) => set({ _repo: repo }),

  fetchCategories: async (courseId) => {
    const { _repo } = get();
    if (!_repo) throw new Error("GroupStore not initialized");

    set({ isLoadingCategories: true, error: null });
    try {
      const categories = await _repo.getCategoriesByCourse(courseId);
      set((s) => ({
        categoriesByCourse: { ...s.categoriesByCourse, [courseId]: categories },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  fetchGroups: async (categoryId) => {
    const { _repo, groupsByCategory } = get();
    if (!_repo) throw new Error("GroupStore not initialized");
    if (groupsByCategory[categoryId]) return;

    set({ isLoadingGroups: true, error: null });
    try {
      const groups = await _repo.getGroupsByCategory(categoryId);
      set((s) => ({
        groupsByCategory: { ...s.groupsByCategory, [categoryId]: groups },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  fetchMyMembership: async (studentId) => {
    const { _repo, _membershipStudentId } = get();
    if (!_repo) throw new Error("GroupStore not initialized");
    if (_membershipStudentId === studentId) return;

    try {
      const members = await _repo.getGroupMembersByStudent(studentId);
      set({ myGroupIds: members.map((m) => m.groupID), _membershipStudentId: studentId });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
