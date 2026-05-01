import { create } from "zustand";

import GroupRepositoryImpl from "../data/GroupRepositoryImpl";
import RemoteGroupDataSource from "../data/RemoteGroupDataSource";

import { GroupCategory } from "../domain/GroupCategory";
import { Group } from "../domain/Group";
import { GroupMember } from "../domain/GroupMember";

type GroupState = {
  categoriesByCourse: Record<string, GroupCategory[]>;
  groupsByCategory: Record<string, Group[]>;
  memberships: GroupMember[];

  loadCategories: (courseId: string) => Promise<void>;
  loadGroups: (categoryId: string) => Promise<void>;
  loadMemberships: (studentId: string) => Promise<void>;

  getUserGroupForCategory: (
    categoryId: string
  ) => string | null;
};

const repository = new GroupRepositoryImpl(
  new RemoteGroupDataSource()
);

export const useGroupStore = create<GroupState>(
  (set, get) => ({
    categoriesByCourse: {},
    groupsByCategory: {},
    memberships: [],

    loadCategories: async (courseId) => {
      const existing =
        get().categoriesByCourse[courseId];

      // cache → no refetch
      if (existing) return;

      const data =
        await repository.getCategories(
          courseId
        );

      set((state) => ({
        categoriesByCourse: {
          ...state.categoriesByCourse,
          [courseId]: data,
        },
      }));
    },

    loadGroups: async (categoryId) => {
      const existing =
        get().groupsByCategory[categoryId];

      if (existing) return;

      const data =
        await repository.getGroups(
          categoryId
        );

      set((state) => ({
        groupsByCategory: {
          ...state.groupsByCategory,
          [categoryId]: data,
        },
      }));
    },

    loadMemberships: async (studentId) => {
      const data =
        await repository.getGroupMembers(
          studentId
        );

      set({
        memberships: data,
      });
    },

    getUserGroupForCategory: (categoryId) => {
      const { memberships, groupsByCategory } =
        get();

      const groups =
        groupsByCategory[categoryId];

      if (!groups) return null;

      for (const membership of memberships) {
        const match = groups.find(
          (g) => g._id === membership.groupID
        );

        if (match) {
          return match._id;
        }
      }

      return null;
    },
  })
);