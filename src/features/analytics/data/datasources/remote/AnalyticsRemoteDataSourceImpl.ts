// src/features/analytics/data/datasources/remote/AnalyticsRemoteDataSourceImpl.ts
import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";

import { ActivityOverview } from "../../../domain/entities/ActivityOverview";
import { AnomalyEvent } from "../../../domain/entities/AnomalyEvent";
import { AssessmentSummary } from "../../../domain/entities/AssessmentSummary";
import { GroupAverage } from "../../../domain/entities/GroupAverage";
import { GroupDetail } from "../../../domain/entities/GroupDetail";
import { CriteriaAverage, MemberResult } from "../../../domain/entities/MemberResult";
import { EvolutionPoint, StudentEvolution } from "../../../domain/entities/StudentEvolution";
import { ActivityAnalytics } from "../../../domain/repositories/AnalyticsRepository";
import { AnalyticsDataSource } from "../AnalyticsDataSource";

// Raw Roble column names — FK suffixes are uppercase "ID" (mirrors the evaluations module).
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
type GroupRow = { _id: string; name: string; categoryID: string };
type GroupMemberRow = { _id: string; groupID: string; studentID: string };
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

// --- Aggregation heuristics (explainable defaults; tune here) ---------------
// A group whose average deviates from the activity average by at least this many
// points (on the 2–5 scale) is flagged as an equity concern.
const EQUITY_THRESHOLD = 0.75;
// A peer rating further than this many std-devs from the evaluated student's own
// mean is flagged as an outlier.
const OUTLIER_STD_DEVS = 1.5;
// Outlier detection needs enough ratings to be meaningful.
const MIN_EVALS_FOR_OUTLIER = 3;

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export class AnalyticsRemoteDataSourceImpl implements AnalyticsDataSource {
  async getCourseAssessments(categoryIds: string[]): Promise<AssessmentSummary[]> {
    if (categoryIds.length === 0) return [];
    const db = new RobleDbClient(authorizedFetch);

    const byCategory = await Promise.all(
      categoryIds.map((catId) =>
        db.readTable<AssessmentRow>("Assessments", { categoryID: catId })
      )
    );

    return byCategory
      .flat()
      .map((a): AssessmentSummary => ({
        assessmentId: a._id,
        title: a.title,
        status: a.status === "cancelled" ? "cancelled" : "active",
        deadline: a.deadline,
      }))
      .sort((a, b) => b.deadline.localeCompare(a.deadline));
  }

  async getActivityAnalytics(assessmentId: string): Promise<ActivityAnalytics> {
    const db = new RobleDbClient(authorizedFetch);

    const assessmentRows = await db.readTable<AssessmentRow>("Assessments", { _id: assessmentId });
    if (assessmentRows.length === 0) throw new Error("Evaluación no encontrada.");
    const assessment = assessmentRows[0];

    const [evalRows, groupRows] = await Promise.all([
      db.readTable<EvaluationRow>("Evaluations", { assessmentID: assessmentId }),
      db.readTable<GroupRow>("Groups", { categoryID: assessment.categoryID }),
    ]);
    const memberRowsByGroup = await Promise.all(
      groupRows.map((g) => db.readTable<GroupMemberRow>("GroupMembers", { groupID: g._id }))
    );

    // student -> their group (for labelling anomalies)
    const studentToGroup = new Map<string, GroupRow>();
    groupRows.forEach((g, i) => {
      memberRowsByGroup[i].forEach((m) => studentToGroup.set(m.studentID, g));
    });

    const allScores = evalRows.map((e) => e.totalScore);
    const activityAvg = mean(allScores);
    const activityStd = stdDev(allScores, activityAvg);

    const groups = this.buildGroupAverages(groupRows, memberRowsByGroup, evalRows, activityAvg);
    const anomalies = await this.detectAnomalies(
      db,
      assessmentId,
      groupRows,
      memberRowsByGroup,
      evalRows,
      studentToGroup
    );

    const overview: ActivityOverview = {
      assessmentId,
      assessmentTitle: assessment.title,
      average: activityAvg,
      stdDev: activityStd,
      evaluationCount: evalRows.length,
      participantCount: new Set(evalRows.map((e) => e.evaluatorID)).size,
      anomalyCount: anomalies.length,
    };

    return { overview, groups, anomalies };
  }

  private buildGroupAverages(
    groupRows: GroupRow[],
    memberRowsByGroup: GroupMemberRow[][],
    evalRows: EvaluationRow[],
    activityAvg: number
  ): GroupAverage[] {
    return groupRows
      .map((g, i): GroupAverage => {
        const memberIds = new Set(memberRowsByGroup[i].map((m) => m.studentID));
        const groupEvals = evalRows.filter((e) => memberIds.has(e.evaluatedID));
        const groupAvg = mean(groupEvals.map((e) => e.totalScore));
        const deviation = groupAvg - activityAvg;
        const isEquityAlert = groupEvals.length > 0 && Math.abs(deviation) >= EQUITY_THRESHOLD;
        return {
          groupId: g._id,
          groupName: g.name,
          average: groupAvg,
          memberCount: memberIds.size,
          evaluationCount: groupEvals.length,
          isEquityAlert,
          equityDirection: isEquityAlert ? (deviation > 0 ? "above" : "below") : null,
        };
      })
      .sort((a, b) => b.average - a.average);
  }

  private async detectAnomalies(
    db: RobleDbClient,
    assessmentId: string,
    groupRows: GroupRow[],
    memberRowsByGroup: GroupMemberRow[][],
    evalRows: EvaluationRow[],
    studentToGroup: Map<string, GroupRow>
  ): Promise<AnomalyEvent[]> {
    const byEvaluated = new Map<string, EvaluationRow[]>();
    evalRows.forEach((e) => {
      const arr = byEvaluated.get(e.evaluatedID) ?? [];
      arr.push(e);
      byEvaluated.set(e.evaluatedID, arr);
    });

    const anomalies: AnomalyEvent[] = [];

    // Outlier ratings: a single peer score far from the student's own mean.
    for (const [studentId, evals] of [...byEvaluated.entries()]) {
      if (evals.length < MIN_EVALS_FOR_OUTLIER) continue;
      const m = mean(evals.map((e) => e.totalScore));
      const sd = stdDev(evals.map((e) => e.totalScore), m);
      if (sd === 0) continue;
      for (const e of evals) {
        const delta = Math.abs(e.totalScore - m);
        if (delta <= OUTLIER_STD_DEVS * sd) continue;
        const g = studentToGroup.get(studentId);
        anomalies.push({
          id: `outlier-${e._id}`,
          type: "outlier_rating",
          severity: delta > 2 * sd ? "high" : "medium",
          studentId,
          fullName: studentId,
          groupId: g?._id ?? "",
          groupName: g?.name ?? "Sin grupo",
          description:
            `Recibió una calificación atípica de ${e.totalScore.toFixed(1)} ` +
            `(su promedio es ${m.toFixed(1)}).`,
        });
      }
    }

    // Low participation: a group member who received no evaluations while the rest
    // of the group did — a signal they may be absent or excluded.
    groupRows.forEach((g, i) => {
      const memberIds = memberRowsByGroup[i].map((m) => m.studentID);
      const groupHasEvals = memberIds.some((id) => (byEvaluated.get(id)?.length ?? 0) > 0);
      if (!groupHasEvals) return;
      memberIds.forEach((id) => {
        if ((byEvaluated.get(id)?.length ?? 0) > 0) return;
        anomalies.push({
          id: `lowpart-${assessmentId}-${id}`,
          type: "low_participation",
          severity: "low",
          studentId: id,
          fullName: id,
          groupId: g._id,
          groupName: g.name,
          description: "No recibió ninguna evaluación de sus compañeros.",
        });
      });
    });

    await this.fillStudentNames(db, anomalies);
    return anomalies;
  }

  private async fillStudentNames(db: RobleDbClient, anomalies: AnomalyEvent[]): Promise<void> {
    const studentIds = [...new Set(anomalies.map((a) => a.studentId))];
    if (studentIds.length === 0) return;
    const userRows = await Promise.all(
      studentIds.map((id) => db.readTable<UserRow>("Users", { _id: id }).then((r) => r[0]))
    );
    const nameById = new Map<string, string>();
    studentIds.forEach((id, i) => {
      nameById.set(id, userRows[i]?.fullName ?? userRows[i]?.name ?? id);
    });
    anomalies.forEach((a) => {
      a.fullName = nameById.get(a.studentId) ?? a.studentId;
    });
  }

  async getGroupDetail(assessmentId: string, groupId: string): Promise<GroupDetail> {
    const db = new RobleDbClient(authorizedFetch);

    const [assessmentRows, criteriaRows, memberRows, groupRows] = await Promise.all([
      db.readTable<AssessmentRow>("Assessments", { _id: assessmentId }),
      db.readTable<CriteriaRow>("Criteria", { assessmentID: assessmentId }),
      db.readTable<GroupMemberRow>("GroupMembers", { groupID: groupId }),
      db.readTable<GroupRow>("Groups", { _id: groupId }),
    ]);

    const memberIds = memberRows.map((m) => m.studentID);
    const evalRows = await db.readTable<EvaluationRow>("Evaluations", { assessmentID: assessmentId });
    const groupEvals = evalRows.filter((e) => memberIds.includes(e.evaluatedID));

    const scoreRows = (
      await Promise.all(
        groupEvals.map((e) =>
          db.readTable<CriteriaScoreRow>("CriteriaScores", { evaluationID: e._id })
        )
      )
    ).flat();

    const userRows = await Promise.all(
      memberIds.map((id) => db.readTable<UserRow>("Users", { _id: id }).then((r) => r[0]))
    );
    const nameById = new Map<string, string>();
    memberIds.forEach((id, i) => {
      nameById.set(id, userRows[i]?.fullName ?? userRows[i]?.name ?? id);
    });

    const members: MemberResult[] = memberIds
      .map((id): MemberResult => {
        const memberEvals = groupEvals.filter((e) => e.evaluatedID === id);
        const evalIds = new Set(memberEvals.map((e) => e._id));
        const criteriaAverages: CriteriaAverage[] = criteriaRows.map((c) => {
          const cScores = scoreRows.filter(
            (s) => s.criteriaID === c._id && evalIds.has(s.evaluationID)
          );
          return {
            criteriaId: c._id,
            criteriaName: c.name,
            average: mean(cScores.map((s) => s.score)),
          };
        });
        return {
          studentId: id,
          fullName: nameById.get(id) ?? id,
          average: mean(memberEvals.map((e) => e.totalScore)),
          evaluationCount: memberEvals.length,
          criteriaAverages,
        };
      })
      .sort((a, b) => b.average - a.average);

    return {
      groupId,
      groupName: groupRows[0]?.name ?? "",
      assessmentId,
      assessmentTitle: assessmentRows[0]?.title ?? "",
      members,
    };
  }

  async getStudentEvolution(
    categoryIds: string[],
    studentId: string
  ): Promise<StudentEvolution> {
    const db = new RobleDbClient(authorizedFetch);

    const [assessmentsByCategory, evalRows, userRows] = await Promise.all([
      Promise.all(
        categoryIds.map((catId) =>
          db.readTable<AssessmentRow>("Assessments", { categoryID: catId })
        )
      ),
      db.readTable<EvaluationRow>("Evaluations", { evaluatedID: studentId }),
      db.readTable<UserRow>("Users", { _id: studentId }),
    ]);

    const byAssessment = new Map<string, EvaluationRow[]>();
    evalRows.forEach((e) => {
      const arr = byAssessment.get(e.assessmentID) ?? [];
      arr.push(e);
      byAssessment.set(e.assessmentID, arr);
    });

    const points: EvolutionPoint[] = assessmentsByCategory
      .flat()
      .map((a): EvolutionPoint | null => {
        const evals = byAssessment.get(a._id);
        if (!evals || evals.length === 0) return null;
        return {
          assessmentId: a._id,
          assessmentTitle: a.title,
          average: mean(evals.map((e) => e.totalScore)),
          date: a.deadline,
        };
      })
      .filter((p): p is EvolutionPoint => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      studentId,
      fullName: userRows[0]?.fullName ?? userRows[0]?.name ?? studentId,
      points,
    };
  }
}
