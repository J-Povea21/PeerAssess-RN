import { Assessment } from "../entities/Assessment";
import { Criteria } from "../entities/Criteria";
import { NewCriteriaScore } from "../entities/CriteriaScore";
import { NewEvaluation } from "../entities/Evaluation";
import { StudentResult } from "../entities/StudentResult";

export type PendingAssessment = {
  assessment: Assessment;
  groupId: string;
  peers: { userId: string; fullName: string }[];
};

export type CourseAssessment = {
  assessment: Assessment;
  groupId: string;
  pendingPeers: { userId: string; fullName: string }[];
  evaluatedPeerCount: number;
  totalPeerCount: number;
};

export interface EvaluationRepository {
  getPendingAssessments(studentId: string): Promise<PendingAssessment[]>;
  getAssessmentsForCourse(studentId: string, categoryIds: string[]): Promise<CourseAssessment[]>;
  getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]>;
  submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void>;
  getMyResults(studentId: string): Promise<StudentResult[]>;
  getAssessmentsByCourse(categoryIds: string[]): Promise<Assessment[]>;
  closeAssessment(assessmentId: string): Promise<void>;
  openAssessment(assessmentId: string): Promise<void>;
}
