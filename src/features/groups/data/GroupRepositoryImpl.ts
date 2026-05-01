import { IGroupRepository } from "../domain/IGroupRepository";
import { GroupCategory } from "../domain/GroupCategory";
import { Group } from "../domain/Group";
import { GroupMember } from "../domain/GroupMember";
import RemoteGroupDataSource from "./RemoteGroupDataSource";

export default class GroupRepositoryImpl
  implements IGroupRepository
{
  constructor(
    private remote: RemoteGroupDataSource
  ) {}

  getCategories(
    courseId: string
  ): Promise<GroupCategory[]> {
    return this.remote.getCategories(courseId);
  }

  getGroups(
    categoryId: string
  ): Promise<Group[]> {
    return this.remote.getGroups(categoryId);
  }

  getGroupMembers(
    studentId: string
  ): Promise<GroupMember[]> {
    return this.remote.getGroupMembers(studentId);
  }
}