import readTable from "../../../core/roble/readTable";
import { GroupCategory } from "../domain/GroupCategory";
import { Group } from "../domain/Group";
import { GroupMember } from "../domain/GroupMember";

export default class RemoteGroupDataSource {
  async getCategories(
    courseId: string
  ): Promise<GroupCategory[]> {
    const data = await readTable(
      "GroupCategories",
      {
        courseID: courseId,
      }
    );

    return data.map((item: any) => ({
      _id: item._id,
      name: item.name,
      courseID: item.courseID,
    }));
  }

  async getGroups(
    categoryId: string
  ): Promise<Group[]> {
    const data = await readTable(
      "Groups",
      {
        categoryID: categoryId,
      }
    );

    return data.map((item: any) => ({
      _id: item._id,
      name: item.name,
      categoryID: item.categoryID,
    }));
  }

  async getGroupMembers(
    studentId: string
  ): Promise<GroupMember[]> {
    const data = await readTable(
      "GroupMembers",
      {
        studentID: studentId,
      }
    );

    return data.map((item: any) => ({
      _id: item._id,
      groupID: item.groupID,
      studentID: item.studentID,
    }));
  }
}