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

export interface EvaluationRepository {
  getPendingAssessments(studentId: string): Promise<PendingAssessment[]>;
  getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]>;
  submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void>;
  getMyResults(studentId: string): Promise<StudentResult[]>;
}
