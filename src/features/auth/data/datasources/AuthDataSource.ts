import { AuthUser } from "../../domain/entities/AuthUser";

export interface AuthDataSource {
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  restoreSession(): Promise<AuthUser | null>;
}
