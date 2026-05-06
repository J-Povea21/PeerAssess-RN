export type CriteriaScore = {
  _id: string;
  evaluationId: string;
  criteriaId: string;
  score: number;
};

export type NewCriteriaScore = Omit<CriteriaScore, "_id">;
