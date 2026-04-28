import { AuthUser } from "../domain/AuthUser";
import readTable from "../../../core/roble/readTable";
import { LocalPreferencesAsyncStorage } from "../../../core/LocalPreferencesAsyncStorage";
import { STORAGE_KEYS } from "../../../core/storageKeys";

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

    if (response.status !== 201) {
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
    const storage =
      LocalPreferencesAsyncStorage.getInstance();

    const accessToken =
      await storage.retrieveData<string>(
        STORAGE_KEYS.accessToken
      );

    await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/logout`,
      {
        method: "POST",
        headers: {
          Authorization: accessToken
            ? `Bearer ${accessToken}`
            : "",
        },
      }
    );
  }

  async verifyToken(): Promise<boolean> {
    const storage =
      LocalPreferencesAsyncStorage.getInstance();

    const accessToken =
      await storage.retrieveData<string>(
        STORAGE_KEYS.accessToken
      );

    if (!accessToken) {
      return false;
    }

    const response = await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/verify-token`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  }
}