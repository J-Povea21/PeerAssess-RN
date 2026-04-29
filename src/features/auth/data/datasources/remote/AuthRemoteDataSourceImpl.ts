import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { STORAGE_KEYS } from "@/src/core/constants/storageKeys";
import { ROBLE_BASE_URL } from "@/src/core/constants/robleConfig";
import { authorizedFetch } from "@/src/core/http/authorizedFetch";
import { RobleDbClient } from "@/src/core/http/RobleDbClient";
import { useSessionStore } from "@/src/core/session/sessionStore";
import { AuthUser, UserRole } from "../../../domain/entities/AuthUser";
import { AuthDataSource } from "../AuthDataSource";

const AUTH_BASE = `${ROBLE_BASE_URL}/auth/${process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID}`;

type LoginApiResponse = {
  accessToken: string;
  refreshToken: string;
  user: { name: string; email: string; role: UserRole };
};

type RobleUserRow = { _id: string; mail: string };

export class AuthRemoteDataSourceImpl implements AuthDataSource {
  private prefs: ILocalPreferences;

  constructor() {
    if (!process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.status !== 201) {
      const body = await response.json().catch(() => ({}));
      // eslint-disable-next-line no-console
      if (__DEV__) console.warn("AuthRemoteDataSource.login failed:", body);
      throw new Error("Credenciales inválidas");
    }

    const { accessToken, refreshToken, user } =
      (await response.json()) as LoginApiResponse;

    // Load tokens into memory so authorizedFetch can use them for the canonical ID query.
    // AsyncStorage is only written after the full login sequence succeeds to avoid
    // leaving persisted tokens without a cached user on failure.
    useSessionStore.getState().setTokens(accessToken, refreshToken);

    const id = await this._resolveCanonicalId(email);

    const authUser: AuthUser = { email, name: user.name, role: user.role, id };

    await this.prefs.storeData(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await this.prefs.storeData(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await this.prefs.storeData(STORAGE_KEYS.CACHED_USER, authUser);

    return authUser;
  }

  async logout(): Promise<void> {
    const { accessToken } = useSessionStore.getState();

    await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    }).catch(() => {});

    useSessionStore.getState().clearTokens();
    await this._clearStorage();
  }

  async restoreSession(): Promise<AuthUser | null> {
    const { accessToken } = useSessionStore.getState();
    if (!accessToken) return null;

    try {
      const response = await authorizedFetch(`${AUTH_BASE}/verify-token`, {
        method: "GET",
      });
      if (!response.ok) {
        await this._clearStorage();
        return null;
      }
      return this.prefs.retrieveData<AuthUser>(STORAGE_KEYS.CACHED_USER);
    } catch {
      await this._clearStorage();
      return null;
    }
  }

  private async _resolveCanonicalId(email: string): Promise<string> {
    const db = new RobleDbClient(authorizedFetch);
    const rows = await db.readTable<RobleUserRow>("Users", { mail: email });

    if (rows.length === 0) {
      throw new Error(
        `No se encontró una cuenta para ${email}. Contacta a tu administrador.`
      );
    }

    return rows[0]._id;
  }

  private async _clearStorage(): Promise<void> {
    await this.prefs.removeData(STORAGE_KEYS.ACCESS_TOKEN);
    await this.prefs.removeData(STORAGE_KEYS.REFRESH_TOKEN);
    await this.prefs.removeData(STORAGE_KEYS.CACHED_USER);
  }
}
