// Minimal assessment reference used by the analytics assessment picker. Kept local
// to the analytics domain so the module does not depend on the evaluations feature.
export type AssessmentSummary = {
  assessmentId: string;
  title: string;
  status: "active" | "cancelled";
  deadline: string;
};
