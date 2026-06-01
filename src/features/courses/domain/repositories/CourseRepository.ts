import { Course } from "../entities/Course";
import { CourseMember } from "../entities/CourseMember";

export interface CourseRepository {
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  joinCourse(accessCode: string, studentId: string): Promise<Course>;
  getMembersByCourse(courseId: string): Promise<CourseMember[]>;
  createCourse(name: string, semester: string, teacherId: string): Promise<Course>;
}
