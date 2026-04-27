import LocalStorage from '@/src/core/storage/localStorage';
import { STORAGE_KEYS } from '@/src/core/storage/storageKeys';
import { create } from 'zustand';

type AuthUser = {
  email: string;
  canonicalUserId: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;

  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (user) => {
    await LocalStorage.set(
      STORAGE_KEYS.userEmail,
      user.email
    );

    await LocalStorage.set(
      STORAGE_KEYS.canonicalUserId,
      user.canonicalUserId
    );

    set({
      user,
      isLoading: false,
    });
  },

  logout: async () => {
    await LocalStorage.remove(STORAGE_KEYS.accessToken);
    await LocalStorage.remove(STORAGE_KEYS.refreshToken);
    await LocalStorage.remove(STORAGE_KEYS.userEmail);
    await LocalStorage.remove(STORAGE_KEYS.canonicalUserId);

    set({
      user: null,
      isLoading: false,
    });
  },

  restoreSession: async () => {
    const accessToken = await LocalStorage.get(
      STORAGE_KEYS.accessToken
    );

    const email = await LocalStorage.get(
      STORAGE_KEYS.userEmail
    );

    const canonicalUserId = await LocalStorage.get(
      STORAGE_KEYS.canonicalUserId
    );

    if (accessToken && email && canonicalUserId) {
      set({
        user: {
          email,
          canonicalUserId,
        },
        isLoading: false,
      });

      return;
    }

    set({
      user: null,
      isLoading: false,
    });
  },
}));