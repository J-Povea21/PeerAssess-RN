import { Course } from "../entities/Course";

export interface CourseRepository {
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  joinCourse(accessCode: string, studentId: string): Promise<Course>;
}
