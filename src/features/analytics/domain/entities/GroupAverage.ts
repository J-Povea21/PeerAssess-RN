// One bar in the "by group" chart: a group's mean received score within a single
// assessment. `isEquityAlert` marks groups whose average deviates notably from the
// activity average; `equityDirection` says which way.
export type EquityDirection = "above" | "below";

export type GroupAverage = {
  groupId: string;
  groupName: string;
  average: number;
  memberCount: number;
  evaluationCount: number;
  isEquityAlert: boolean;
  equityDirection: EquityDirection | null;
};
