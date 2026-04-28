const BASE_URL =
  "https://roble-api.openlab.uninorte.edu.co";

const ROBLE_TOKEN =
  "peerassess_dbc886f908";

let isRefreshing = false;
let refreshPromise:
  | Promise<string | null>
  | null = null;

type LogoutCallback = () => void;

export async function authorizedFetch(
  url: string,
  options: RequestInit = {},
  accessToken: string | null,
  refreshToken: string | null,
  onLogout: LogoutCallback
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<
        string,
        string
      >),
      Authorization: accessToken
        ? `Bearer ${accessToken}`
        : "",
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 401) {
    return response;
  }

  if (!refreshToken) {
    onLogout();
    throw new Error("session expired");
  }

  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = refreshAccessToken(
      refreshToken
    ).finally(() => {
      isRefreshing = false;
    });
  }

  const newAccessToken =
    await refreshPromise;

  if (!newAccessToken) {
    onLogout();
    throw new Error("refresh failed");
  }

  const retryResponse = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<
        string,
        string
      >),
      Authorization: `Bearer ${newAccessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (retryResponse.status === 401) {
    onLogout();
    throw new Error(
      "session expired again"
    );
  }

  return retryResponse;
}

async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/auth/${ROBLE_TOKEN}/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (
      response.status !== 201 &&
      !response.ok
    ) {
      return null;
    }

    const data = await response.json();

    return data.accessToken ?? null;
  } catch {
    return null;
  }
}