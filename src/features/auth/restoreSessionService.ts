import LocalStorage from '@/src/core/storage/localStorage';
import { STORAGE_KEYS } from '@/src/core/storage/storageKeys';

const API_BASE_URL =
  'https://roble-api.openlab.uninorte.edu.co';

const ROBLE_TOKEN =
  'peerassess_dbc886f908';

export async function restoreSessionService() {
  const accessToken = await LocalStorage.get(
    STORAGE_KEYS.accessToken
  );

  const email = await LocalStorage.get(
    STORAGE_KEYS.userEmail
  );

  const canonicalUserId = await LocalStorage.get(
    STORAGE_KEYS.canonicalUserId
  );

  if (!accessToken || !email || !canonicalUserId) {
    return null;
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/${ROBLE_TOKEN}/verify-token`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    await LocalStorage.remove(STORAGE_KEYS.accessToken);
    await LocalStorage.remove(STORAGE_KEYS.refreshToken);
    await LocalStorage.remove(STORAGE_KEYS.userEmail);
    await LocalStorage.remove(STORAGE_KEYS.canonicalUserId);

    return null;
  }

  return {
    email,
    canonicalUserId,
  };
}