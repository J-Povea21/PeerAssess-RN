export type Criteria = {
  _id: string;
  assessmentId: string;
  name: string;
  weight: number;
};
// No NewCriteria — criteria are created alongside assessments by teachers; this client is read-only.
