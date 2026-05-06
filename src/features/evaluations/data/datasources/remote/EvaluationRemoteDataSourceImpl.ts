// src/features/evaluations/data/datasources/remote/EvaluationRemoteDataSourceImpl.ts
import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { Assessment } from "../../../domain/entities/Assessment";
import { Criteria } from "../../../domain/entities/Criteria";
import { NewCriteriaScore } from "../../../domain/entities/CriteriaScore";
import { NewEvaluation } from "../../../domain/entities/Evaluation";
import { CriteriaAverage, StudentResult } from "../../../domain/entities/StudentResult";
import { EvaluationDataSource } from "../EvaluationDataSource";
import { CourseAssessment, PendingAssessment } from "../../../domain/repositories/EvaluationRepository";

type AssessmentRow = {
  _id: string;
  categoryId: string;
  title: string;
  visibility: "public" | "private";
  timeWindowMinutes: number;
  status: string;
  deadline: string;
  createdAt: string;
};
type CriteriaRow = { _id: string; assessmentId: string; name: string; weight: number };
type GroupMemberRow = { _id: string; groupID: string; studentID: string };
type GroupRow = { _id: string; name: string; categoryID: string };
type EvaluationRow = {
  _id: string;
  assessmentId: string;
  evaluatorId: string;
  evaluatedId: string;
  totalScore: number;
  submittedAt: string;
};
type CriteriaScoreRow = { _id: string; evaluationId: string; criteriaId: string; score: number };
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
        db.readTable<AssessmentRow>("Assessments", { categoryId: catId, status: "active" })
      )
    );
    const activeAssessments = assessmentsByCategory
      .flat()
      .filter((a) => new Date(a.deadline) > serverNow);
    if (activeAssessments.length === 0) return [];

    const results = await Promise.all(
      activeAssessments.map(async (a): Promise<PendingAssessment | null> => {
        const groupId = categoryToGroup.get(a.categoryId);
        if (!groupId) return null;

        const [peerMemberRows, existingEvalRows] = await Promise.all([
          db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId }),
          db.readTable<EvaluationRow>("Evaluations", {
            assessmentId: a._id,
            evaluatorId: studentId,
          }),
        ]);

        const evaluatedIds = new Set(existingEvalRows.map((e) => e.evaluatedId));
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
            categoryId: a.categoryId,
            title: a.title,
            visibility: a.visibility,
            timeWindowMinutes: a.timeWindowMinutes,
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

    // Find which group this student belongs to for each category
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

    // Fetch all active assessments for the given categories in parallel
    const assessmentsByCategory = await Promise.all(
      [...categoryToGroup.keys()].map((catId) =>
        db.readTable<AssessmentRow>("Assessments", { categoryId: catId, status: "active" })
      )
    );
    const allAssessments = assessmentsByCategory.flat();
    if (allAssessments.length === 0) return [];

    const results = await Promise.all(
      allAssessments.map(async (a): Promise<CourseAssessment | null> => {
        const groupId = categoryToGroup.get(a.categoryId);
        if (!groupId) return null;

        const isExpired = new Date(a.deadline) <= serverNow;

        const [peerMemberRows, existingEvalRows] = await Promise.all([
          db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId }),
          db.readTable<EvaluationRow>("Evaluations", {
            assessmentId: a._id,
            evaluatorId: studentId,
          }),
        ]);

        const evaluatedIds = new Set(existingEvalRows.map((e) => e.evaluatedId));
        const allPeerIds = peerMemberRows
          .map((m) => m.studentID)
          .filter((id) => id !== studentId);
        const pendingPeerIds = isExpired
          ? []
          : allPeerIds.filter((id) => !evaluatedIds.has(id));

        // Resolve names only for pending peers (display only)
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
            categoryId: a.categoryId,
            title: a.title,
            visibility: a.visibility,
            timeWindowMinutes: a.timeWindowMinutes,
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
    const rows = await db.readTable<CriteriaRow>("Criteria", { assessmentId });
    return rows.map((r): Criteria => ({
      _id: r._id,
      assessmentId: r.assessmentId,
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
      assessmentId: evaluation.assessmentId,
      evaluatorId: evaluation.evaluatorId,
      evaluatedId: evaluation.evaluatedId,
    });
    if (duplicates.length > 0) {
      throw new Error("Ya enviaste una evaluación para este compañero.");
    }

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

    await db.insertRecord("Evaluations", {
      assessmentId: evaluation.assessmentId,
      evaluatorId: evaluation.evaluatorId,
      evaluatedId: evaluation.evaluatedId,
      totalScore,
      submittedAt: new Date().toISOString(),
    });

    const inserted = await db.readTable<EvaluationRow>("Evaluations", {
      assessmentId: evaluation.assessmentId,
      evaluatorId: evaluation.evaluatorId,
      evaluatedId: evaluation.evaluatedId,
    });
    if (inserted.length === 0) throw new Error("Error al verificar la evaluación enviada.");
    const evaluationId = inserted[inserted.length - 1]._id;

    await Promise.all(
      scores.map((s) =>
        db.insertRecord("CriteriaScores", {
          evaluationId,
          criteriaId: s.criteriaId,
          score: s.score,
        })
      )
    );
  }

  async getMyResults(studentId: string): Promise<StudentResult[]> {
    const db = new RobleDbClient(authorizedFetch);

    const evalRows = await db.readTable<EvaluationRow>("Evaluations", {
      evaluatedId: studentId,
    });
    if (evalRows.length === 0) return [];

    const evalsByAssessment = new Map<string, EvaluationRow[]>();
    for (const e of evalRows) {
      if (!evalsByAssessment.has(e.assessmentId)) {
        evalsByAssessment.set(e.assessmentId, []);
      }
      evalsByAssessment.get(e.assessmentId)!.push(e);
    }

    const results = await Promise.all(
      [...evalsByAssessment.entries()].map(async ([assessmentId, evals]) => {
        const [assessmentRows, criteriaRows] = await Promise.all([
          db.readTable<AssessmentRow>("Assessments", { _id: assessmentId }),
          db.readTable<CriteriaRow>("Criteria", { assessmentId }),
        ]);

        if (assessmentRows.length === 0) return null;
        const assessment = assessmentRows[0];
        if (assessment.visibility !== "public") return null;

        const allScoreRows = await Promise.all(
          evals.map((e) =>
            db.readTable<CriteriaScoreRow>("CriteriaScores", { evaluationId: e._id })
          )
        ).then((r) => r.flat());

        const averageScore =
          evals.reduce((sum, e) => sum + e.totalScore, 0) / evals.length;

        const criteriaAverages: CriteriaAverage[] = criteriaRows.map((c) => {
          const cScores = allScoreRows.filter((s) => s.criteriaId === c._id);
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
}
