import { MemberResult } from "./MemberResult";

// Drill-down for a single group within an assessment: every member's result.
// Backs GroupResultsScreen.
export type GroupDetail = {
  groupId: string;
  groupName: string;
  assessmentId: string;
  assessmentTitle: string;
  members: MemberResult[];
};
