import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { STORAGE_KEYS } from "@/src/core/constants/storageKeys";
import { useSessionStore } from "@/src/core/session/sessionStore";
import { AuthUser, UserRole } from "../../../domain/entities/AuthUser";
import { AuthDataSource } from "../AuthDataSource";

type MockUser = AuthUser & { password: string };

const MOCK_USERS: MockUser[] = [
  {
    id: "local-teacher-001",
    email: "teacher@uninorte.edu.co",
    name: "Profesor Demo",
    role: "teacher" as UserRole,
    password: "password",
  },
  {
    id: "local-student-001",
    email: "student@uninorte.edu.co",
    name: "Estudiante Demo",
    role: "student" as UserRole,
    password: "password",
  },
];

const FAKE_ACCESS_TOKEN = "local-access-token";
const FAKE_REFRESH_TOKEN = "local-refresh-token";

export class AuthLocalDataSourceImpl implements AuthDataSource {
  private prefs = LocalPreferencesAsyncStorage.getInstance();

  async login(email: string, password: string): Promise<AuthUser> {
    const match = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!match) throw new Error("Credenciales inválidas");

    const { password: _, ...user } = match;

    useSessionStore.getState().setTokens(FAKE_ACCESS_TOKEN, FAKE_REFRESH_TOKEN);

    await this.prefs.storeData(STORAGE_KEYS.ACCESS_TOKEN, FAKE_ACCESS_TOKEN);
    await this.prefs.storeData(STORAGE_KEYS.REFRESH_TOKEN, FAKE_REFRESH_TOKEN);
    await this.prefs.storeData(STORAGE_KEYS.CACHED_USER, user);

    return user;
  }

  async logout(): Promise<void> {
    useSessionStore.getState().clearTokens();
    await this.prefs.removeData(STORAGE_KEYS.ACCESS_TOKEN);
    await this.prefs.removeData(STORAGE_KEYS.REFRESH_TOKEN);
    await this.prefs.removeData(STORAGE_KEYS.CACHED_USER);
  }

  async restoreSession(): Promise<AuthUser | null> {
    const { accessToken } = useSessionStore.getState();
    if (!accessToken) return null;
    return this.prefs.retrieveData<AuthUser>(STORAGE_KEYS.CACHED_USER);
  }
}
