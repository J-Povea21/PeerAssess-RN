import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Group } from "../../../domain/entities/Group";
import { GroupCategory } from "../../../domain/entities/GroupCategory";
import { GroupMember } from "../../../domain/entities/GroupMember";
import { GroupDataSource } from "../GroupDataSource";

type GroupCategoryRow = { _id: string; name: string; courseID: string };
type GroupRow = { _id: string; name: string; categoryID: string };
type GroupMemberRow = { _id: string; groupID: string; studentID: string };

export class GroupRemoteDataSourceImpl implements GroupDataSource {
  async getCategoriesByCourse(courseId: string): Promise<GroupCategory[]> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<GroupCategoryRow>("GroupCategories", { courseID: courseId });
    return rows.map((r): GroupCategory => ({ _id: r._id, name: r.name, courseID: r.courseID }));
  }

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<GroupRow>("Groups", { categoryID: categoryId });
    return rows.map((r): Group => ({ _id: r._id, name: r.name, categoryID: r.categoryID }));
  }

  async getGroupMembersByStudent(studentId: string): Promise<GroupMember[]> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<GroupMemberRow>("GroupMembers", { studentID: studentId });
    return rows.map((r): GroupMember => ({ _id: r._id, groupID: r.groupID, studentID: r.studentID }));
  }

  async getGroupMembersByGroup(groupId: string): Promise<GroupMember[]> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId });
    return rows.map((r): GroupMember => ({ _id: r._id, groupID: r.groupID, studentID: r.studentID }));
  }

  async getUserNamesByIds(ids: string[]): Promise<{ id: string; name: string }[]> {
    const db = new RobleDbClient(authorizedFetch);
    return Promise.all(
      ids.map(async (id) => {
        const rows = await db.readTable<{ _id: string; name: string }>("Users", { _id: id });
        return { id, name: rows.length > 0 ? rows[0].name : id };
      })
    );
  }
}
