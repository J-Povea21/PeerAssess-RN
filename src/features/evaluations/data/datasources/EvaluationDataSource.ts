import { Assessment } from "../../domain/entities/Assessment";
import { Criteria } from "../../domain/entities/Criteria";
import { NewCriteriaScore } from "../../domain/entities/CriteriaScore";
import { NewEvaluation } from "../../domain/entities/Evaluation";
import { StudentResult } from "../../domain/entities/StudentResult";
import { CourseAssessment, PendingAssessment } from "../../domain/repositories/EvaluationRepository";

export interface EvaluationDataSource {
  getPendingAssessments(studentId: string): Promise<PendingAssessment[]>;
  getAssessmentsForCourse(studentId: string, categoryIds: string[]): Promise<CourseAssessment[]>;
  getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]>;
  submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void>;
  getMyResults(studentId: string): Promise<StudentResult[]>;
  getAssessmentsByCourse(categoryIds: string[]): Promise<Assessment[]>;
  closeAssessment(assessmentId: string): Promise<void>;
  openAssessment(assessmentId: string): Promise<void>;
}
