import { Group } from "../../../domain/entities/Group";
import { GroupCategory } from "../../../domain/entities/GroupCategory";
import { GroupMember } from "../../../domain/entities/GroupMember";
import { parseBrightspaceCsv } from "../../../domain/parseBrightspaceCsv";
import { GroupDataSource } from "../GroupDataSource";

export class GroupLocalDataSourceImpl implements GroupDataSource {
  async getCategoriesByCourse(courseId: string): Promise<GroupCategory[]> {
    return [
      { _id: "cat-1", name: "Grupo de Laboratorio", courseID: courseId },
      { _id: "cat-2", name: "Grupo de Proyecto", courseID: courseId },
    ];
  }

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    return [
      { _id: "grp-1", name: "Equipo Alfa", categoryID: categoryId },
      { _id: "grp-2", name: "Equipo Beta", categoryID: categoryId },
      { _id: "grp-3", name: "Equipo Gamma", categoryID: categoryId },
    ];
  }

  async getGroupMembersByStudent(studentId: string): Promise<GroupMember[]> {
    return [{ _id: "mem-1", groupID: "grp-1", studentID: studentId }];
  }

  async getGroupMembersByGroup(groupId: string): Promise<GroupMember[]> {
    return [
      { _id: "mem-1", groupID: groupId, studentID: "student-001" },
      { _id: "mem-2", groupID: groupId, studentID: "student-002" },
      { _id: "mem-3", groupID: groupId, studentID: "student-003" },
    ];
  }

  async getUserNamesByIds(ids: string[]): Promise<{ id: string; name: string }[]> {
    const names: Record<string, string> = {
      "student-001": "Ana García",
      "student-002": "Carlos López",
      "student-003": "María Rodríguez",
    };
    return ids.map((id) => ({ id, name: names[id] ?? id }));
  }

  async importCsv(courseId: string, csvContent: string): Promise<GroupCategory> {
    const parsed = parseBrightspaceCsv(csvContent);
    return { _id: "cat-imported", name: parsed.categoryName, courseID: courseId };
  }
}
