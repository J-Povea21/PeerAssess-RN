import { Course } from "../../../domain/entities/Course";
import { CourseMember } from "../../../domain/entities/CourseMember";
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

// Some emails appear twice across groups to exercise the dedupe path.
const MOCK_MEMBERS: Record<string, CourseMember[]> = {
  "local-course-1": [
    { email: "ana.lopez@uninorte.edu.co", fullName: "Ana López" },
    { email: "ana.lopez@uninorte.edu.co", fullName: "Ana López" },
    { email: "juan.perez@uninorte.edu.co", fullName: "Juan Pérez" },
    { email: "madonna@uninorte.edu.co", fullName: "Madonna" },
  ],
  "local-course-2": [
    { email: "carlos.diaz@uninorte.edu.co", fullName: "Carlos Díaz" },
    { email: "maria.gomez@uninorte.edu.co", fullName: "María Gómez" },
  ],
  "local-course-3": [],
};

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

  async getCoursesByTeacher(_teacherId: string): Promise<Course[]> {
    return MOCK_COURSES;
  }

  async createCourse(name: string, semester: string, _teacherId: string): Promise<Course> {
    const newCourse: Course = {
      _id: `local-${Date.now()}`,
      name,
      semester,
      status: "active",
      studentCount: 0,
      categoryCount: 0,
      evaluationCount: 0,
      pendingEvaluations: 0,
    };
    MOCK_COURSES.push(newCourse);
    return newCourse;
  }

  async getMembersByCourse(courseId: string): Promise<CourseMember[]> {
    const rows = MOCK_MEMBERS[courseId] ?? [];
    const byEmail = new Map<string, CourseMember>();
    for (const row of rows) {
      const email = row.email.trim().toLowerCase();
      if (!email || byEmail.has(email)) continue;
      byEmail.set(email, { email, fullName: row.fullName.trim() });
    }
    return Array.from(byEmail.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
    );
  }
}
