export type UserRole = "teacher" | "student";

export type AuthUser = {
  email: string;
  name: string;
  role: UserRole;
  id: string;
};
