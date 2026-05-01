import { GroupCategory } from "./GroupCategory";
import { Group } from "./Group";
import { GroupMember } from "./GroupMember";

export interface IGroupRepository {
  getCategories(
    courseId: string
  ): Promise<GroupCategory[]>;

  getGroups(
    categoryId: string
  ): Promise<Group[]>;

  getGroupMembers(
    studentId: string
  ): Promise<GroupMember[]>;
}