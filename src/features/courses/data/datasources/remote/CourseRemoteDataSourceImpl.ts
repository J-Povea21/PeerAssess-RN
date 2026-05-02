import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Course, CourseStatus } from "../../../domain/entities/Course";
import { CourseMember } from "../../../domain/entities/CourseMember";
import { CourseDataSource } from "../CourseDataSource";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateId(length = 12): string {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type CourseEnrollmentRow = { _id: string; courseID: string; studentID: string };
type CourseRow = { _id: string; name: string; semester: string; accessCode?: string; status?: string };
type CountRow = { _id: string };
type CategoryRow = { _id: string; courseID: string };
type GroupRow = { _id: string; categoryID: string };
type GroupMemberRow = { _id: string; groupID: string; fullName?: string; name?: string; email?: string };

export class CourseRemoteDataSourceImpl implements CourseDataSource {
  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    const db = new RobleDbClient(authorizedFetch);

    const enrollments = await db.readTable<CourseEnrollmentRow>("CourseEnrollments", {
      studentID: studentId,
    });

    // TODO: 3 parallel requests per enrollment — batch when Roble supports multi-ID reads
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [courseRows, studentRows, categoryRows] = await Promise.all([
          db.readTable<CourseRow>("Courses", { _id: enrollment.courseID }),
          db.readTable<CountRow>("CourseEnrollments", { courseID: enrollment.courseID }),
          db.readTable<CountRow>("GroupCategories", { courseID: enrollment.courseID }),
          // Assessments are linked via categoryID, not courseID — evaluationCount deferred
        ]);

        if (courseRows.length === 0) return null;
        const row = courseRows[0];

        const course: Course = {
          _id: row._id,
          name: row.name,
          semester: row.semester,
          status: (row.status ?? "active") as CourseStatus,
          studentCount: studentRows.length,
          categoryCount: categoryRows.length,
          evaluationCount: 0, // TODO: query via GroupCategories → Assessments when evaluations feature ships
          pendingEvaluations: 0, // TODO: compute from assessments table when evaluations feature ships
          enrollmentCode: row.accessCode,
        };
        return course;
      })
    );

    return courses.filter((c): c is Course => c !== null);
  }

  async joinCourse(accessCode: string, studentId: string): Promise<Course> {
    const db = new RobleDbClient(authorizedFetch);

    const courseRows = await db.readTable<CourseRow>("Courses", { accessCode });
    if (courseRows.length === 0) {
      throw new Error("No se encontró un curso con ese código");
    }

    const row = courseRows[0];

    const existing = await db.readTable<CountRow>("CourseEnrollments", {
      courseID: row._id,
      studentID: studentId,
    });
    if (existing.length > 0) {
      throw new Error("Ya estás inscrito en este curso");
    }

    await db.insertRecord("CourseEnrollments", {
      _id: generateId(),
      courseID: row._id,
      studentID: studentId,
      joinedAt: new Date().toISOString(),
    });

    const [studentRows, categoryRows] = await Promise.all([
      db.readTable<CountRow>("CourseEnrollments", { courseID: row._id }),
      db.readTable<CountRow>("GroupCategories", { courseID: row._id }),
      // Assessments are linked via categoryID, not courseID — evaluationCount deferred
    ]);

    return {
      _id: row._id,
      name: row.name,
      semester: row.semester,
      status: (row.status ?? "active") as CourseStatus,
      studentCount: studentRows.length,
      categoryCount: categoryRows.length,
      evaluationCount: 0, // TODO: query via GroupCategories → Assessments when evaluations feature ships
      pendingEvaluations: 0, // TODO: compute from assessments table when evaluations feature ships
      enrollmentCode: row.accessCode,
    };
  }

  async getMembersByCourse(courseId: string): Promise<CourseMember[]> {
    const db = new RobleDbClient(authorizedFetch);

    const categories = await db.readTable<CategoryRow>("GroupCategories", { courseID: courseId });
    if (categories.length === 0) return [];

    const groupLists = await Promise.all(
      categories.map((c) => db.readTable<GroupRow>("Groups", { categoryID: c._id }))
    );
    const groups = groupLists.flat();
    if (groups.length === 0) return [];

    const memberLists = await Promise.all(
      groups.map((g) => db.readTable<GroupMemberRow>("GroupMembers", { groupID: g._id }))
    );

    const byEmail = new Map<string, CourseMember>();
    for (const row of memberLists.flat()) {
      const email = row.email?.trim().toLowerCase();
      if (!email) continue;
      if (byEmail.has(email)) continue;
      byEmail.set(email, {
        email,
        fullName: (row.fullName ?? row.name ?? "").trim(),
      });
    }

    return Array.from(byEmail.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
    );
  }
}
