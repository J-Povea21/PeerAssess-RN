import { readTable } from '@/src/core/db/robleDb';
import LocalStorage from '@/src/core/storage/localStorage';
import { STORAGE_KEYS } from '@/src/core/storage/storageKeys';

const API_BASE_URL =
  'https://roble-api.openlab.uninorte.edu.co';

const ROBLE_TOKEN =
  'peerassess_dbc886f908';

type LoginPayload = {
  email: string;
  password: string;
};

export async function loginService({
  email,
  password,
}: LoginPayload) {
  const response = await fetch(
    `${API_BASE_URL}/auth/${ROBLE_TOKEN}/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('invalid credentials');
  }

  const data = await response.json();

  await LocalStorage.set(
    STORAGE_KEYS.accessToken,
    data.accessToken
  );

  await LocalStorage.set(
    STORAGE_KEYS.refreshToken,
    data.refreshToken
  );

  const users = await readTable('Users', {
    mail: email,
  });

  if (!users.length) {
    throw new Error(
      'No matching user found in Users table'
    );
  }

  const canonicalUserId = users[0]._id;

  await LocalStorage.set(
    STORAGE_KEYS.canonicalUserId,
    canonicalUserId
  );

  await LocalStorage.set(
    STORAGE_KEYS.userEmail,
    email
  );

  return {
    email,
    canonicalUserId,
  };
}