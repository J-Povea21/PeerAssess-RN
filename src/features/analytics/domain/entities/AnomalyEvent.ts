// A flagged irregularity in an assessment's evaluations.
// - "outlier_rating": a peer rating that lands far from the evaluated student's mean.
// - "low_participation": a group member who received no (or very few) evaluations.
export type AnomalyType = "outlier_rating" | "low_participation";
export type AnomalySeverity = "high" | "medium" | "low";

export type AnomalyEvent = {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  studentId: string;
  fullName: string;
  groupId: string;
  groupName: string;
  description: string;
};
