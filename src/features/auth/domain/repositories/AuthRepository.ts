import { AuthUser } from "../entities/AuthUser";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  restoreSession(): Promise<AuthUser | null>;
}
