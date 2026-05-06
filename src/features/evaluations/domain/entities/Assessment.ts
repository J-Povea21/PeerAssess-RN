export type Assessment = {
  _id: string;
  categoryId: string;
  title: string;
  visibility: "public" | "private";
  timeWindowMinutes: number;
  status: "active" | "cancelled";
  deadline: string;
  createdAt: string;
};
