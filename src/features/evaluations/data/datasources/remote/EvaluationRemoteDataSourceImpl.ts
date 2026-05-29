// src/features/evaluations/data/datasources/remote/EvaluationRemoteDataSourceImpl.ts
import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Assessment, NewAssessment } from "../../../domain/entities/Assessment";
import { Criteria, NewCriteria } from "../../../domain/entities/Criteria";
import { NewCriteriaScore } from "../../../domain/entities/CriteriaScore";
import { NewEvaluation } from "../../../domain/entities/Evaluation";
import { CriteriaAverage, StudentResult } from "../../../domain/entities/StudentResult";
import { EvaluationDataSource } from "../EvaluationDataSource";
import { CourseAssessment, PendingAssessment } from "../../../domain/repositories/EvaluationRepository";

const idChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateId(length = 12): string {
  return Array.from({ length }, () => idChars[Math.floor(Math.random() * idChars.length)]).join("");
}

// Raw Roble column names — all FK suffixes are uppercase "ID"
type AssessmentRow = {
  _id: string;
  categoryID: string;
  title: string;
  visibility: "public" | "private";
  timeWindow: number;
  status: string;
  deadline: string;
  createdAt: string;
};
type CriteriaRow = { _id: string; assessmentID: string; name: string; weight: number };
type GroupMemberRow = { _id: string; groupID: string; studentID: string };
type GroupRow = { _id: string; name: string; categoryID: string };
type EvaluationRow = {
  _id: string;
  assessmentID: string;
  evaluatorID: string;
  evaluatedID: string;
  totalScore: number;
  submittedAt: string;
};
type CriteriaScoreRow = { _id: string; evaluationID: string; criteriaID: string; score: number };
type UserRow = { _id: string; name: string; fullName?: string };

export class EvaluationRemoteDataSourceImpl implements EvaluationDataSource {
  async getPendingAssessments(studentId: string): Promise<PendingAssessment[]> {
    const db = new RobleDbClient(authorizedFetch);

    const memberRows = await db.readTable<GroupMemberRow>("GroupMembers", {
      studentID: studentId,
    });
    if (memberRows.length === 0) return [];

    const groupRows = await Promise.all(
      memberRows.map((m) =>
        db.readTable<GroupRow>("Groups", { _id: m.groupID }).then((r) => r[0])
      )
    );
    const categoryToGroup = new Map<string, string>();
    groupRows.forEach((g) => {
      if (g) categoryToGroup.set(g.categoryID, g._id);
    });
    if (categoryToGroup.size === 0) return [];

    const serverNow = await db.getServerTime();
    const assessmentsByCategory = await Promise.all(
      [...categoryToGroup.keys()].map((catId) =>
        db.readTable<AssessmentRow>("Assessments", { categoryID: catId, status: "active" })
      )
    );
    const activeAssessments = assessmentsByCategory
      .flat()
      .filter((a) => new Date(a.deadline) > serverNow);
    if (activeAssessments.length === 0) return [];

    const results = await Promise.all(
      activeAssessments.map(async (a): Promise<PendingAssessment | null> => {
        const groupId = categoryToGroup.get(a.categoryID);
        if (!groupId) return null;

        const [peerMemberRows, existingEvalRows] = await Promise.all([
          db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId }),
          db.readTable<EvaluationRow>("Evaluations", {
            assessmentID: a._id,
            evaluatorID: studentId,
          }),
        ]);

        const evaluatedIds = new Set(existingEvalRows.map((e) => e.evaluatedID));
        const peerIds = peerMemberRows
          .map((m) => m.studentID)
          .filter((id) => id !== studentId && !evaluatedIds.has(id));

        if (peerIds.length === 0) return null;

        const userRows = await Promise.all(
          peerIds.map((id) =>
            db.readTable<UserRow>("Users", { _id: id }).then((r) => r[0])
          )
        );
        const peers = peerIds.map((userId, i) => ({
          userId,
          fullName: userRows[i]?.fullName ?? userRows[i]?.name ?? userId,
        }));

        return {
          assessment: {
            _id: a._id,
            categoryId: a.categoryID,
            title: a.title,
            visibility: a.visibility,
            timeWindowMinutes: a.timeWindow,
            status: "active",
            deadline: a.deadline,
            createdAt: a.createdAt,
          } as Assessment,
          groupId,
          peers,
        };
      })
    );

    return results.filter((r): r is PendingAssessment => r !== null);
  }

  async getAssessmentsForCourse(studentId: string, categoryIds: string[]): Promise<CourseAssessment[]> {
    if (categoryIds.length === 0) return [];
    const db = new RobleDbClient(authorizedFetch);

    const memberRows = await db.readTable<GroupMemberRow>("GroupMembers", { studentID: studentId });
    if (memberRows.length === 0) return [];

    const groupRows = await Promise.all(
      memberRows.map((m) =>
        db.readTable<GroupRow>("Groups", { _id: m.groupID }).then((r) => r[0])
      )
    );
    const categoryToGroup = new Map<string, string>();
    groupRows.forEach((g) => {
      if (g && categoryIds.includes(g.categoryID)) {
        categoryToGroup.set(g.categoryID, g._id);
      }
    });
    if (categoryToGroup.size === 0) return [];

    const serverNow = await db.getServerTime();

    const assessmentsByCategory = await Promise.all(
      [...categoryToGroup.keys()].map((catId) =>
        db.readTable<AssessmentRow>("Assessments", { categoryID: catId, status: "active" })
      )
    );
    const allAssessments = assessmentsByCategory.flat();
    if (allAssessments.length === 0) return [];

    const results = await Promise.all(
      allAssessments.map(async (a): Promise<CourseAssessment | null> => {
        const groupId = categoryToGroup.get(a.categoryID);
        if (!groupId) return null;

        const isExpired = new Date(a.deadline) <= serverNow;

        const [peerMemberRows, existingEvalRows] = await Promise.all([
          db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId }),
          db.readTable<EvaluationRow>("Evaluations", {
            assessmentID: a._id,
            evaluatorID: studentId,
          }),
        ]);

        const evaluatedIds = new Set(existingEvalRows.map((e) => e.evaluatedID));
        const allPeerIds = peerMemberRows
          .map((m) => m.studentID)
          .filter((id) => id !== studentId);
        const pendingPeerIds = isExpired
          ? []
          : allPeerIds.filter((id) => !evaluatedIds.has(id));

        const userRows = await Promise.all(
          pendingPeerIds.map((id) =>
            db.readTable<UserRow>("Users", { _id: id }).then((r) => r[0])
          )
        );
        const pendingPeers = pendingPeerIds.map((userId, i) => ({
          userId,
          fullName: userRows[i]?.fullName ?? userRows[i]?.name ?? userId,
        }));

        return {
          assessment: {
            _id: a._id,
            categoryId: a.categoryID,
            title: a.title,
            visibility: a.visibility,
            timeWindowMinutes: a.timeWindow,
            status: "active",
            deadline: a.deadline,
            createdAt: a.createdAt,
          } as Assessment,
          groupId,
          pendingPeers,
          evaluatedPeerCount: evaluatedIds.size,
          totalPeerCount: allPeerIds.length,
        };
      })
    );

    return results.filter((r): r is CourseAssessment => r !== null);
  }

  async getCriteriaForAssessment(assessmentId: string): Promise<Criteria[]> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<CriteriaRow>("Criteria", { assessmentID: assessmentId });
    return rows.map((r): Criteria => ({
      _id: r._id,
      assessmentId: r.assessmentID,
      name: r.name,
      weight: r.weight,
    }));
  }

  async submitEvaluation(evaluation: NewEvaluation, scores: NewCriteriaScore[]): Promise<void> {
    const db = new RobleDbClient(authorizedFetch);

    const validScores = new Set([2, 3, 4, 5]);
    if (!scores.every((s) => validScores.has(s.score))) {
      throw new Error("Puntuación inválida. Debe ser 2, 3, 4 o 5.");
    }

    const serverNow = await db.getServerTime();
    const assessmentRows = await db.readTable<AssessmentRow>("Assessments", {
      _id: evaluation.assessmentId,
    });
    if (assessmentRows.length === 0) throw new Error("Evaluación no encontrada.");
    if (new Date(assessmentRows[0].deadline) < serverNow) {
      throw new Error("El plazo de esta evaluación ha vencido.");
    }

    const duplicates = await db.readTable<EvaluationRow>("Evaluations", {
      assessmentID: evaluation.assessmentId,
      evaluatorID: evaluation.evaluatorId,
      evaluatedID: evaluation.evaluatedId,
    });
    if (duplicates.length > 0) {
      throw new Error("Ya enviaste una evaluación para este compañero.");
    }

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

    await db.insertRecord("Evaluations", {
      assessmentID: evaluation.assessmentId,
      evaluatorID: evaluation.evaluatorId,
      evaluatedID: evaluation.evaluatedId,
      totalScore,
      submittedAt: new Date().toISOString(),
    });

    const inserted = await db.readTable<EvaluationRow>("Evaluations", {
      assessmentID: evaluation.assessmentId,
      evaluatorID: evaluation.evaluatorId,
      evaluatedID: evaluation.evaluatedId,
    });
    if (inserted.length === 0) throw new Error("Error al verificar la evaluación enviada.");
    const evaluationId = inserted[inserted.length - 1]._id;

    await Promise.all(
      scores.map((s) =>
        db.insertRecord("CriteriaScores", {
          evaluationID: evaluationId,
          criteriaID: s.criteriaId,
          score: s.score,
        })
      )
    );
  }

  async getMyResults(studentId: string): Promise<StudentResult[]> {
    const db = new RobleDbClient(authorizedFetch);

    const evalRows = await db.readTable<EvaluationRow>("Evaluations", {
      evaluatedID: studentId,
    });
    if (evalRows.length === 0) return [];

    const evalsByAssessment = new Map<string, EvaluationRow[]>();
    for (const e of evalRows) {
      if (!evalsByAssessment.has(e.assessmentID)) {
        evalsByAssessment.set(e.assessmentID, []);
      }
      evalsByAssessment.get(e.assessmentID)!.push(e);
    }

    const results = await Promise.all(
      [...evalsByAssessment.entries()].map(async ([assessmentId, evals]) => {
        const [assessmentRows, criteriaRows] = await Promise.all([
          db.readTable<AssessmentRow>("Assessments", { _id: assessmentId }),
          db.readTable<CriteriaRow>("Criteria", { assessmentID: assessmentId }),
        ]);

        if (assessmentRows.length === 0) return null;
        const assessment = assessmentRows[0];
        if (assessment.visibility !== "public") return null;

        const allScoreRows = await Promise.all(
          evals.map((e) =>
            db.readTable<CriteriaScoreRow>("CriteriaScores", { evaluationID: e._id })
          )
        ).then((r) => r.flat());

        const averageScore =
          evals.reduce((sum, e) => sum + e.totalScore, 0) / evals.length;

        const criteriaAverages: CriteriaAverage[] = criteriaRows.map((c) => {
          const cScores = allScoreRows.filter((s) => s.criteriaID === c._id);
          const avg =
            cScores.length > 0
              ? cScores.reduce((sum, s) => sum + s.score, 0) / cScores.length
              : 0;
          return { criteriaId: c._id, criteriaName: c.name, average: avg };
        });

        const mostRecentEvalAt = evals.reduce(
          (latest, e) => (e.submittedAt > latest ? e.submittedAt : latest),
          evals[0].submittedAt
        );

        const result: StudentResult = {
          assessmentId,
          assessmentTitle: assessment.title,
          visibility: "public",
          averageScore,
          evaluationCount: evals.length,
          criteriaAverages,
          mostRecentEvalAt,
        };
        return result;
      })
    );

    const filtered = results.filter((r): r is StudentResult => r !== null);
    return filtered.sort((a, b) => b.mostRecentEvalAt.localeCompare(a.mostRecentEvalAt));
  }
  async getAssessmentsByCourse(categoryIds: string[]): Promise<Assessment[]> {
    if (categoryIds.length === 0) return [];
    const db = new RobleDbClient(authorizedFetch);

    const assessmentsByCategory = await Promise.all(
      categoryIds.map((catId) =>
        db.readTable<AssessmentRow>("Assessments", { categoryID: catId })
      )
    );

    return assessmentsByCategory.flat().map((a): Assessment => ({
      _id: a._id,
      categoryId: a.categoryID,
      title: a.title,
      visibility: a.visibility,
      timeWindowMinutes: a.timeWindow,
      status: a.status as Assessment["status"],
      deadline: a.deadline,
      createdAt: a.createdAt,
    }));
  }

  async createAssessment(
    assessment: NewAssessment,
    criteria: NewCriteria[],
    _courseId: string,
  ): Promise<Assessment> {
    const db = new RobleDbClient(authorizedFetch);

    const assessmentId = generateId();
    const createdAt = new Date().toISOString();
    const deadline = new Date(
      Date.now() + assessment.timeWindowMinutes * 60_000,
    ).toISOString();

    await db.insertRecord("Assessments", {
      _id: assessmentId,
      categoryID: assessment.categoryId,
      title: assessment.title,
      visibility: assessment.visibility,
      timeWindow: assessment.timeWindowMinutes,
      status: "active",
      deadline,
      createdAt,
    });

    await Promise.all(
      criteria.map((c) =>
        db.insertRecord("Criteria", {
          _id: generateId(),
          assessmentID: assessmentId,
          name: c.name,
          weight: c.weight,
        }),
      ),
    );

    return {
      _id: assessmentId,
      categoryId: assessment.categoryId,
      title: assessment.title,
      visibility: assessment.visibility,
      timeWindowMinutes: assessment.timeWindowMinutes,
      status: "active",
      deadline,
      createdAt,
    };
  }
}
