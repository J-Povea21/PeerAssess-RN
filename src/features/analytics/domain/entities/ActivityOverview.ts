// Aggregate stats for a single assessment ("activity"), computed across all of
// its evaluations. Pure read model — never persisted, derived in the datasource.
export type ActivityOverview = {
  assessmentId: string;
  assessmentTitle: string;
  average: number;
  stdDev: number;
  evaluationCount: number;
  participantCount: number;
  anomalyCount: number;
};
