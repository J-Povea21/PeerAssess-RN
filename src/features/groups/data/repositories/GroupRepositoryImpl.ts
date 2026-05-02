import { Group } from "../../domain/entities/Group";
import { GroupCategory } from "../../domain/entities/GroupCategory";
import { GroupMember } from "../../domain/entities/GroupMember";
import { GroupRepository } from "../../domain/repositories/GroupRepository";
import { GroupDataSource } from "../datasources/GroupDataSource";

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private dataSource: GroupDataSource) {}

  getCategoriesByCourse(courseId: string): Promise<GroupCategory[]> {
    return this.dataSource.getCategoriesByCourse(courseId);
  }

  getGroupsByCategory(categoryId: string): Promise<Group[]> {
    return this.dataSource.getGroupsByCategory(categoryId);
  }

  getGroupMembersByStudent(studentId: string): Promise<GroupMember[]> {
    return this.dataSource.getGroupMembersByStudent(studentId);
  }
}
