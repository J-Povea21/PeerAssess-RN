import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthDataSource } from "../datasources/AuthDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: AuthDataSource) {}

  async login(email: string, password: string): Promise<AuthUser> {
    return this.dataSource.login(email, password);
  }

  async logout(): Promise<void> {
    return this.dataSource.logout();
  }

  async restoreSession(): Promise<AuthUser | null> {
    return this.dataSource.restoreSession();
  }
}
