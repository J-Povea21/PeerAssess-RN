import { create } from "zustand";

import { AuthUser } from "../domain/AuthUser";
import AuthRemoteDataSource from "../data/AuthRemoteDataSource";
import AuthRepositoryImpl from "../data/AuthRepositoryImpl";

import { LocalPreferencesAsyncStorage } from "../../../core/LocalPreferencesAsyncStorage";
import { STORAGE_KEYS } from "../../../core/storageKeys";

type AuthState = {
  user: AuthUser | null;
  canonicalUserId: string | null;
  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const authRepository =
  new AuthRepositoryImpl(
    new AuthRemoteDataSource()
  );

const storage =
  LocalPreferencesAsyncStorage.getInstance();

export const useAuthStore = create<AuthState>(
  (set) => ({
    user: null,
    canonicalUserId: null,
    isLoading: true,

    login: async (email, password) => {
      try {
        set({ isLoading: true });

        const result =
          await authRepository.login(
            email,
            password
          );

        await storage.storeData(
          STORAGE_KEYS.accessToken,
          result.accessToken
        );

        await storage.storeData(
          STORAGE_KEYS.refreshToken,
          result.refreshToken
        );

        await storage.storeData(
          STORAGE_KEYS.userEmail,
          result.user.email
        );

        await storage.storeData(
          STORAGE_KEYS.canonicalUserId,
          result.user.canonicalUserId
        );

        set({
          user: result.user,
          canonicalUserId:
            result.user.canonicalUserId,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
        });

        throw error;
      }
    },

    logout: async () => {
      await authRepository.logout();

      await storage.removeData(
        STORAGE_KEYS.accessToken
      );

      await storage.removeData(
        STORAGE_KEYS.refreshToken
      );

      await storage.removeData(
        STORAGE_KEYS.userEmail
      );

      await storage.removeData(
        STORAGE_KEYS.canonicalUserId
      );

      set({
        user: null,
        canonicalUserId: null,
        isLoading: false,
      });
    },

    restoreSession: async () => {
      try {
        const isValid =
          await authRepository.verifyToken();

        if (!isValid) {
          set({
            user: null,
            canonicalUserId: null,
            isLoading: false,
          });
          return;
        }

        const email =
          await storage.retrieveData<string>(
            STORAGE_KEYS.userEmail
          );

        const canonicalUserId =
          await storage.retrieveData<string>(
            STORAGE_KEYS.canonicalUserId
          );

        if (email && canonicalUserId) {
          set({
            user: {
              email,
              canonicalUserId,
            },
            canonicalUserId,
            isLoading: false,
          });
          return;
        }

        set({
          user: null,
          canonicalUserId: null,
          isLoading: false,
        });
      } catch {
        set({
          user: null,
          canonicalUserId: null,
          isLoading: false,
        });
      }
    },
  })
);