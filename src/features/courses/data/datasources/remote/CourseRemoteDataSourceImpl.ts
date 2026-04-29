import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Course, CourseStatus } from "../../../domain/entities/Course";
import { CourseDataSource } from "../CourseDataSource";

type CourseEnrollmentRow = { _id: string; courseID: string; studentID: string };
type CourseRow = { _id: string; name: string; semester: string; accessCode?: string; status?: string };
type CountRow = { _id: string };

export class CourseRemoteDataSourceImpl implements CourseDataSource {
  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    const db = new RobleDbClient(authorizedFetch);

    const enrollments = await db.readTable<CourseEnrollmentRow>("CourseEnrollments", {
      studentID: studentId,
    });

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [courseRows, studentRows, categoryRows, evaluationRows] = await Promise.all([
          db.readTable<CourseRow>("Courses", { _id: enrollment.courseID }),
          db.readTable<CountRow>("CourseEnrollments", { courseID: enrollment.courseID }),
          db.readTable<CountRow>("GroupCategories", { courseID: enrollment.courseID }),
          db.readTable<CountRow>("assessments", { course_id: enrollment.courseID }),
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
          evaluationCount: evaluationRows.length,
          pendingEvaluations: 0,
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
      courseID: row._id,
      studentID: studentId,
    });

    const [studentRows, categoryRows, evaluationRows] = await Promise.all([
      db.readTable<CountRow>("CourseEnrollments", { courseID: row._id }),
      db.readTable<CountRow>("GroupCategories", { courseID: row._id }),
      db.readTable<CountRow>("assessments", { course_id: row._id }),
    ]);

    return {
      _id: row._id,
      name: row.name,
      semester: row.semester,
      status: (row.status ?? "active") as CourseStatus,
      studentCount: studentRows.length,
      categoryCount: categoryRows.length,
      evaluationCount: evaluationRows.length,
      pendingEvaluations: 0,
      enrollmentCode: row.accessCode,
    };
  }
}
