import { create } from "zustand";

import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { STORAGE_KEYS } from "@/src/core/constants/storageKeys";

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  loadFromStorage: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,

  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken }),

  clearTokens: () => set({ accessToken: null, refreshToken: null }),

  loadFromStorage: async () => {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const accessToken = await prefs.retrieveData<string>(
      STORAGE_KEYS.ACCESS_TOKEN
    );
    const refreshToken = await prefs.retrieveData<string>(
      STORAGE_KEYS.REFRESH_TOKEN
    );
    set({ accessToken, refreshToken });
  },
}));
