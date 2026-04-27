import LocalStorage from '../storage/localStorage';

const API_BASE_URL = 'https://roble-api.openlab.uninorte.edu.co';
const ROBLE_TOKEN = 'peerassess_dbc886f908';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await LocalStorage.get('refreshToken');

  if (!refreshToken) {
    return null;
  }

  try {
   const response = await fetch(
  `${API_BASE_URL}/auth/${ROBLE_TOKEN}/refresh-token`,
  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

const data = await response.json();

await LocalStorage.set('accessToken', data.accessToken);
await LocalStorage.set('refreshToken', data.refreshToken);

return data.accessToken;
  } catch {
    return null;
  }
}

export async function authorizedFetch(
  endpoint: string,
  options: RequestInit = {},
  onLogout?: () => void
) {
  let accessToken = await LocalStorage.get('accessToken');

  const makeRequest = async (token: string | null) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status !== 401) {
    return response;
  }

  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
    });
  }

  const newToken = await refreshPromise;

  if (!newToken) {
    await LocalStorage.remove('accessToken');
    await LocalStorage.remove('refreshToken');

    if (onLogout) {
      onLogout();
    }

    throw new Error('session expired');
  }

  response = await makeRequest(newToken);

  if (response.status === 401) {
    await LocalStorage.remove('accessToken');
    await LocalStorage.remove('refreshToken');

    if (onLogout) {
      onLogout();
    }

    throw new Error('session expired');
  }

  return response;
}