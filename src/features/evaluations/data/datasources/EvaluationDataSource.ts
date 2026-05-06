import { Criteria } from "../../domain/entities/Criteria";
import { NewCriteriaScore } from "../../domain/entities/CriteriaScore";
import { NewEvaluation } from "../../domain/entities/Evaluation";
import { StudentResult } from "../../domain/entities/StudentResult";
import { PendingAssessment } from "../../domain/repositories/EvaluationRepository";

export interface EvaluationDataSource {
  getPendingAssessments(studentId: string): Promise<PendingAssessment[]>;
  getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]>;
  submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void>;
  getMyResults(studentId: string): Promise<StudentResult[]>;
}
