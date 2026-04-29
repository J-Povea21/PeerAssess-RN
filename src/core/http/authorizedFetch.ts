import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { STORAGE_KEYS } from "@/src/core/constants/storageKeys";
import { ROBLE_BASE_URL } from "@/src/core/constants/robleConfig";
import { useSessionStore } from "@/src/core/session/sessionStore";

const AUTH_BASE = `${ROBLE_BASE_URL}/auth/${process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID}`;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function authorizedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken } = useSessionStore.getState();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status !== 401) return response;

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  // Capture reference before any microtask boundary so concurrent callers
  // all await the same in-flight promise even after finally nulls the module var
  const pendingRefresh = refreshPromise!;
  const newToken = await pendingRefresh;

  if (!newToken) {
    useSessionStore.getState().clearTokens();
    throw new Error("Tu sesión ha expirado");
  }

  const retryHeaders: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${newToken}`,
  };

  const retryResponse = await fetch(url, { ...options, headers: retryHeaders });

  if (retryResponse.status === 401) {
    useSessionStore.getState().clearTokens();
    throw new Error("Tu sesión ha expirado");
  }

  return retryResponse;
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useSessionStore.getState();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${AUTH_BASE}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.status !== 201) return null;

    const data = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    useSessionStore.getState().setTokens(data.accessToken, data.refreshToken);

    const prefs = LocalPreferencesAsyncStorage.getInstance();
    await prefs.storeData(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    await prefs.storeData(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

    return data.accessToken;
  } catch {
    return null;
  }
}
