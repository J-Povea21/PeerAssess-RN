// A student's received-score trend across every assessment in a course.
// Backs StudentEvolutionScreen's line chart.
export type EvolutionPoint = {
  assessmentId: string;
  assessmentTitle: string;
  average: number;
  date: string;
};

export type StudentEvolution = {
  studentId: string;
  fullName: string;
  points: EvolutionPoint[];
};
