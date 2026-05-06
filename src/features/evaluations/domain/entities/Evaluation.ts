export type Evaluation = {
  _id: string;
  assessmentId: string;
  evaluatorId: string;
  evaluatedId: string;
  totalScore: number;
  submittedAt: string;
};

export type NewEvaluation = Omit<Evaluation, "_id">;
