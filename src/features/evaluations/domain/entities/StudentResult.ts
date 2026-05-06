export type CriteriaAverage = {
  criteriaId: string;
  criteriaName: string;
  average: number;
};

export type StudentResult = {
  assessmentId: string;
  assessmentTitle: string;
  visibility: "public" | "private";
  averageScore: number;
  evaluationCount: number;
  criteriaAverages: CriteriaAverage[];
  mostRecentEvalAt: string;
};
