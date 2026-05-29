import { Criteria, NewCriteria } from "../../domain/entities/Criteria";
import { NewCriteriaScore } from "../../domain/entities/CriteriaScore";
import { NewEvaluation } from "../../domain/entities/Evaluation";
import { Assessment, NewAssessment } from "../../domain/entities/Assessment";
import { StudentResult } from "../../domain/entities/StudentResult";
import {
  CourseAssessment,
  EvaluationRepository,
  PendingAssessment,
} from "../../domain/repositories/EvaluationRepository";
import { EvaluationDataSource } from "../datasources/EvaluationDataSource";

export class EvaluationRepositoryImpl implements EvaluationRepository {
  constructor(private dataSource: EvaluationDataSource) {}

  getPendingAssessments(studentId: string): Promise<PendingAssessment[]> {
    return this.dataSource.getPendingAssessments(studentId);
  }

  getAssessmentsForCourse(studentId: string, categoryIds: string[]): Promise<CourseAssessment[]> {
    return this.dataSource.getAssessmentsForCourse(studentId, categoryIds);
  }

  getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]> {
    return this.dataSource.getCriteriaForAssessment(assessmentId);
  }

  submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void> {
    return this.dataSource.submitEvaluation(evaluation, scores);
  }

  getMyResults(studentId: string): Promise<StudentResult[]> {
    return this.dataSource.getMyResults(studentId);
  }
  getAssessmentsByCourse(categoryIds: string[]): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByCourse(categoryIds);
  }

  createAssessment(
    assessment: NewAssessment,
    criteria: NewCriteria[],
    courseId: string,
  ): Promise<Assessment> {
    return this.dataSource.createAssessment(assessment, criteria, courseId);
  }
}
