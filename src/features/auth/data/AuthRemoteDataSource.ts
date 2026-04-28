import { AuthUser } from "../domain/AuthUser";
import readTable from "../../../core/roble/readTable";

const BASE_URL =
  "https://roble-api.openlab.uninorte.edu.co";

const ROBLE_TOKEN =
  "peerassess_dbc886f908";

export default class AuthRemoteDataSource {
  async login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const response = await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const data = await response.json();

    const users = await readTable(
      "Users",
      {
        mail: email,
      }
    );

    if (!users.length) {
      throw new Error(
        "No user found in Users table for this email"
      );
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        email,
        canonicalUserId: users[0]._id,
      },
    };
  }

  async logout(): Promise<void> {
    await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/logout`,
      {
        method: "POST",
      }
    );
  }

  async verifyToken(): Promise<boolean> {
    const response = await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/verify-token`
    );

    return response.ok;
  }
}