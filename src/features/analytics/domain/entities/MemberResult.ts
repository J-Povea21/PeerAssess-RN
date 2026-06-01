// A single student's aggregated result within a group + assessment, including the
// per-criterion breakdown. Analytics keeps its own CriteriaAverage so the module
// stays independent of the evaluations feature's domain.
export type CriteriaAverage = {
  criteriaId: string;
  criteriaName: string;
  average: number;
};

export type MemberResult = {
  studentId: string;
  fullName: string;
  average: number;
  evaluationCount: number;
  criteriaAverages: CriteriaAverage[];
};
