import AuthRemoteDataSource from "./AuthRemoteDataSource";
import { IAuthRepository } from "../domain/IAuthRepository";

export default class AuthRepositoryImpl
  implements IAuthRepository
{
  constructor(
    private remoteDataSource: AuthRemoteDataSource
  ) {}

  async login(email: string, password: string) {
    return this.remoteDataSource.login(
      email,
      password
    );
  }

  async logout(): Promise<void> {
    return this.remoteDataSource.logout();
  }

  async verifyToken(): Promise<boolean> {
    return this.remoteDataSource.verifyToken();
  }
}