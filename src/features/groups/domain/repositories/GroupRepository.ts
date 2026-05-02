import { Group } from "../entities/Group";
import { GroupCategory } from "../entities/GroupCategory";
import { GroupMember } from "../entities/GroupMember";

export interface GroupRepository {
  getCategoriesByCourse(courseId: string): Promise<GroupCategory[]>;
  getGroupsByCategory(categoryId: string): Promise<Group[]>;
  getGroupMembersByStudent(studentId: string): Promise<GroupMember[]>;
}
