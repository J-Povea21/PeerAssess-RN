import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Group } from "../../../domain/entities/Group";
import { GroupCategory } from "../../../domain/entities/GroupCategory";
import { GroupMember } from "../../../domain/entities/GroupMember";
import { parseBrightspaceCsv } from "../../../domain/parseBrightspaceCsv";
import { GroupDataSource } from "../GroupDataSource";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateId(length = 12): string {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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

  async importCsv(courseId: string, csvContent: string): Promise<GroupCategory> {
    const parsed = parseBrightspaceCsv(csvContent);
    if (!parsed.categoryName || parsed.groups.length === 0) {
      throw new Error("El archivo CSV no contiene categorías ni grupos válidos");
    }

    const db = new RobleDbClient(authorizedFetch);

    const categoryId = generateId();
    await db.insertRecord("GroupCategories", {
      _id: categoryId,
      name: parsed.categoryName,
      courseID: courseId,
    });

    for (const group of parsed.groups) {
      const groupId = generateId();
      await db.insertRecord("Groups", {
        _id: groupId,
        name: group.name,
        categoryID: categoryId,
      });

      for (const memberName of group.members) {
        await db.insertRecord("GroupMembers", {
          _id: generateId(),
          groupID: groupId,
          studentName: memberName,
        });
      }
    }

    return { _id: categoryId, name: parsed.categoryName, courseID: courseId };
  }
}
