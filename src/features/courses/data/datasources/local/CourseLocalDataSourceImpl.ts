import { Course } from "../../../domain/entities/Course";
import { CourseDataSource } from "../CourseDataSource";

const MOCK_COURSES: Course[] = [
  {
    _id: "local-course-1",
    name: "Desarrollo Móvil",
    semester: "2026-1",
    status: "active",
    studentCount: 12,
    categoryCount: 2,
    evaluationCount: 3,
    pendingEvaluations: 1,
    enrollmentCode: "LOCAL1",
  },
  {
    _id: "local-course-2",
    name: "Ingeniería de Software",
    semester: "2026-1",
    status: "active",
    studentCount: 25,
    categoryCount: 3,
    evaluationCount: 5,
    pendingEvaluations: 0,
    enrollmentCode: "LOCAL2",
  },
  {
    _id: "local-course-3",
    name: "Bases de Datos",
    semester: "2026-1",
    status: "pending",
    studentCount: 18,
    categoryCount: 1,
    evaluationCount: 2,
    pendingEvaluations: 0,
    enrollmentCode: "LOCAL3",
  },
];

const VALID_CODES = new Set(["LOCAL1", "LOCAL2", "LOCAL3"]);

export class CourseLocalDataSourceImpl implements CourseDataSource {
  private enrolled: Set<string> = new Set(["local-course-1", "local-course-2"]);

  async getCoursesByStudent(_studentId: string): Promise<Course[]> {
    return MOCK_COURSES.filter((c) => this.enrolled.has(c._id));
  }

  async joinCourse(accessCode: string, _studentId: string): Promise<Course> {
    const upper = accessCode.toUpperCase();
    if (!VALID_CODES.has(upper)) {
      throw new Error("No se encontró un curso con ese código");
    }

    const course = MOCK_COURSES.find((c) => c.enrollmentCode === upper)!;
    if (this.enrolled.has(course._id)) {
      throw new Error("Ya estás inscrito en este curso");
    }

    this.enrolled.add(course._id);
    return course;
  }
}
