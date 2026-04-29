import { Course } from "../../domain/entities/Course";

export interface CourseDataSource {
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  joinCourse(accessCode: string, studentId: string): Promise<Course>;
}
