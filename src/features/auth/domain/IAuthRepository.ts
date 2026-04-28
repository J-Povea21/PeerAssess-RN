import { AuthUser } from "./AuthUser";

export interface IAuthRepository {
  login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }>;

  logout(): Promise<void>;

  verifyToken(): Promise<boolean>;
}