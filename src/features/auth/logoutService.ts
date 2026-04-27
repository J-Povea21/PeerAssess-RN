import LocalStorage from '@/src/core/storage/localStorage';
import { STORAGE_KEYS } from '@/src/core/storage/storageKeys';

const API_BASE_URL =
  'https://roble-api.openlab.uninorte.edu.co';

const ROBLE_TOKEN =
  'peerassess_dbc886f908';

export async function logoutService() {
  const accessToken = await LocalStorage.get(
    STORAGE_KEYS.accessToken
  );

  try {
    await fetch(
      `${API_BASE_URL}/auth/${ROBLE_TOKEN}/logout`,
      {
        method: 'POST',
        headers: {
          Authorization: accessToken
            ? `Bearer ${accessToken}`
            : '',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch {
    // incluso si falla, igual limpiamos sesión local
  }

  await LocalStorage.remove(STORAGE_KEYS.accessToken);
  await LocalStorage.remove(STORAGE_KEYS.refreshToken);
  await LocalStorage.remove(STORAGE_KEYS.userEmail);
  await LocalStorage.remove(STORAGE_KEYS.canonicalUserId);
}