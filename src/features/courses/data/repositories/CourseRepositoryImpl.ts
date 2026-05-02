import { Course } from "../../domain/entities/Course";
import { CourseMember } from "../../domain/entities/CourseMember";
import { CourseRepository } from "../../domain/repositories/CourseRepository";
import { CourseDataSource } from "../datasources/CourseDataSource";

export class CourseRepositoryImpl implements CourseRepository {
  constructor(private dataSource: CourseDataSource) {}

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    return this.dataSource.getCoursesByStudent(studentId);
  }

  async joinCourse(accessCode: string, studentId: string): Promise<Course> {
    return this.dataSource.joinCourse(accessCode, studentId);
  }

  async getMembersByCourse(courseId: string): Promise<CourseMember[]> {
    return this.dataSource.getMembersByCourse(courseId);
  }
}
