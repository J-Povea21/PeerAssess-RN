import { Course } from "../../domain/entities/Course";
import { CourseMember } from "../../domain/entities/CourseMember";

export interface CourseDataSource {
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  joinCourse(accessCode: string, studentId: string): Promise<Course>;
  getMembersByCourse(courseId: string): Promise<CourseMember[]>;
  createCourse(name: string, semester: string, teacherId: string): Promise<Course>;
}
