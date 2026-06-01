import { create } from "zustand";

import { Group } from "@/src/features/groups/domain/entities/Group";
import { GroupCategory } from "@/src/features/groups/domain/entities/GroupCategory";
import { GroupMember } from "@/src/features/groups/domain/entities/GroupMember";
import { GroupRepository } from "@/src/features/groups/domain/repositories/GroupRepository";

type GroupState = {
  categoriesByCourse: Record<string, GroupCategory[]>;
  groupsByCategory: Record<string, Group[]>;
  membersByGroup: Record<string, GroupMember[]>;
  studentNames: Record<string, string>;
  myGroupIds: string[];
  _membershipStudentId: string | null;
  isLoadingCategories: boolean;
  isLoadingGroups: boolean;
  isLoadingMembership: boolean;
  isLoadingMembers: boolean;
  isImporting: boolean;
  error: string | null;
  _repo: GroupRepository | null;
  init: (repo: GroupRepository) => void;
  fetchCategories: (courseId: string) => Promise<void>;
  fetchGroups: (categoryId: string) => Promise<void>;
  fetchMyMembership: (studentId: string) => Promise<void>;
  fetchMembersByGroup: (groupId: string) => Promise<void>;
  fetchStudentNames: (ids: string[]) => Promise<void>;
  importCsv: (courseId: string, csvContent: string) => Promise<GroupCategory>;
  clearError: () => void;
};

export const useGroupStore = create<GroupState>((set, get) => ({
  categoriesByCourse: {},
  groupsByCategory: {},
  membersByGroup: {},
  studentNames: {},
  myGroupIds: [],
  _membershipStudentId: null,
  isLoadingCategories: false,
  isLoadingGroups: false,
  isLoadingMembership: false,
  isLoadingMembers: false,
  isImporting: false,
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
    if (categoryId in groupsByCategory) return;

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

    set({ isLoadingMembership: true, error: null });
    try {
      const members = await _repo.getGroupMembersByStudent(studentId);
      set({ myGroupIds: members.map((m) => m.groupID), _membershipStudentId: studentId });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingMembership: false });
    }
  },

  fetchStudentNames: async (ids) => {
    const { _repo, studentNames } = get();
    if (!_repo) throw new Error("GroupStore not initialized");

    const uncached = ids.filter((id) => !(id in studentNames));
    if (uncached.length === 0) return;

    try {
      const results = await _repo.getUserNamesByIds(uncached);
      const newNames = Object.fromEntries(results.map(({ id, name }) => [id, name]));
      set((s) => ({ studentNames: { ...s.studentNames, ...newNames } }));
    } catch {
      // names are display-only, silently skip on failure
    }
  },

  fetchMembersByGroup: async (groupId) => {
    const { _repo, membersByGroup } = get();
    if (!_repo) throw new Error("GroupStore not initialized");
    if (groupId in membersByGroup) return;

    set({ isLoadingMembers: true, error: null });
    try {
      const members = await _repo.getGroupMembersByGroup(groupId);
      set((s) => ({
        membersByGroup: { ...s.membersByGroup, [groupId]: members },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoadingMembers: false });
    }
  },

  importCsv: async (courseId, csvContent) => {
    const { _repo } = get();
    if (!_repo) throw new Error("GroupStore not initialized");

    set({ isImporting: true, error: null });
    try {
      const category = await _repo.importCsv(courseId, csvContent);
      // Invalidate so the Categorías focus effect refetches with the new category.
      set((s) => {
        const next = { ...s.categoriesByCourse };
        delete next[courseId];
        return { categoriesByCourse: next };
      });
      return category;
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
