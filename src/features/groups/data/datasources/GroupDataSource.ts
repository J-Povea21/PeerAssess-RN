import { Group } from "../../domain/entities/Group";
import { GroupCategory } from "../../domain/entities/GroupCategory";
import { GroupMember } from "../../domain/entities/GroupMember";

export interface GroupDataSource {
  getCategoriesByCourse(courseId: string): Promise<GroupCategory[]>;
  getGroupsByCategory(categoryId: string): Promise<Group[]>;
  getGroupMembersByStudent(studentId: string): Promise<GroupMember[]>;
  getGroupMembersByGroup(groupId: string): Promise<GroupMember[]>;
  getUserNamesByIds(ids: string[]): Promise<{ id: string; name: string }[]>;
}
