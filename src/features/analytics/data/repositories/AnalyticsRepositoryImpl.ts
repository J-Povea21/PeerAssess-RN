import { AssessmentSummary } from "../../domain/entities/AssessmentSummary";
import { GroupDetail } from "../../domain/entities/GroupDetail";
import { StudentEvolution } from "../../domain/entities/StudentEvolution";
import { ActivityAnalytics, AnalyticsRepository } from "../../domain/repositories/AnalyticsRepository";
import { AnalyticsDataSource } from "../datasources/AnalyticsDataSource";

export class AnalyticsRepositoryImpl implements AnalyticsRepository {
  constructor(private dataSource: AnalyticsDataSource) {}

  getCourseAssessments(categoryIds: string[]): Promise<AssessmentSummary[]> {
    return this.dataSource.getCourseAssessments(categoryIds);
  }

  getActivityAnalytics(assessmentId: string): Promise<ActivityAnalytics> {
    return this.dataSource.getActivityAnalytics(assessmentId);
  }

  getGroupDetail(assessmentId: string, groupId: string): Promise<GroupDetail> {
    return this.dataSource.getGroupDetail(assessmentId, groupId);
  }

  getStudentEvolution(categoryIds: string[], studentId: string): Promise<StudentEvolution> {
    return this.dataSource.getStudentEvolution(categoryIds, studentId);
  }
}
