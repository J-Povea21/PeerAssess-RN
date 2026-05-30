import { ActivityOverview } from "../entities/ActivityOverview";
import { AnomalyEvent } from "../entities/AnomalyEvent";
import { AssessmentSummary } from "../entities/AssessmentSummary";
import { GroupAverage } from "../entities/GroupAverage";
import { GroupDetail } from "../entities/GroupDetail";
import { StudentEvolution } from "../entities/StudentEvolution";

// Everything the AnalyticsScreen needs for one assessment, computed in a single
// pass so the underlying tables are read once.
export type ActivityAnalytics = {
  overview: ActivityOverview;
  groups: GroupAverage[];
  anomalies: AnomalyEvent[];
};

export interface AnalyticsRepository {
  // Assessments belonging to the given group categories (for the picker).
  getCourseAssessments(categoryIds: string[]): Promise<AssessmentSummary[]>;
  // Overview + per-group averages + anomalies for a single assessment.
  getActivityAnalytics(assessmentId: string): Promise<ActivityAnalytics>;
  // Per-student drill-down for one group within an assessment.
  getGroupDetail(assessmentId: string, groupId: string): Promise<GroupDetail>;
  // One student's score trend across all assessments in the course.
  getStudentEvolution(categoryIds: string[], studentId: string): Promise<StudentEvolution>;
}
