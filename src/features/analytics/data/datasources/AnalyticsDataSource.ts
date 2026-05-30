import { AssessmentSummary } from "../../domain/entities/AssessmentSummary";
import { GroupDetail } from "../../domain/entities/GroupDetail";
import { StudentEvolution } from "../../domain/entities/StudentEvolution";
import { ActivityAnalytics } from "../../domain/repositories/AnalyticsRepository";

export interface AnalyticsDataSource {
  getCourseAssessments(categoryIds: string[]): Promise<AssessmentSummary[]>;
  getActivityAnalytics(assessmentId: string): Promise<ActivityAnalytics>;
  getGroupDetail(assessmentId: string, groupId: string): Promise<GroupDetail>;
  getStudentEvolution(categoryIds: string[], studentId: string): Promise<StudentEvolution>;
}
