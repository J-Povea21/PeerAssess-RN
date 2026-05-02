export type CourseStatus = "active" | "pending";

export type Course = {
  _id: string;
  name: string;
  semester: string;
  status: CourseStatus;
  studentCount: number;
  categoryCount: number;
  evaluationCount: number;
  pendingEvaluations: number;
  enrollmentCode?: string;
};
