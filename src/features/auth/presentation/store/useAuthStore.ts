import { create } from "zustand";

import { useSessionStore } from "@/src/core/session/sessionStore";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;
  _repo: AuthRepository | null;
  init: (repo: AuthRepository) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isRestoringSession: true,
  error: null,
  _repo: null,

  init: (repo) => set({ _repo: repo }),

  login: async (email, password) => {
    const { _repo } = get();
    if (!_repo) throw new Error("AuthStore not initialized");

    set({ isLoading: true, error: null });
    try {
      const user = await _repo.login(email, password);
      set({ user });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { _repo } = get();
    if (!_repo) throw new Error("AuthStore not initialized");

    set({ isLoading: true });
    try {
      await _repo.logout();
    } catch {
      // Always clear local state even if the API call fails
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  restoreSession: async () => {
    const { _repo } = get();
    if (!_repo) throw new Error("AuthStore not initialized");

    set({ isRestoringSession: true });
    try {
      await useSessionStore.getState().loadFromStorage();
      const user = await _repo.restoreSession();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ isRestoringSession: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// When authorizedFetch clears tokens mid-session (refresh failed), log the user out locally.
useSessionStore.subscribe((state, prevState) => {
  if (prevState.accessToken && !state.accessToken) {
    const { user } = useAuthStore.getState();
    if (user) {
      useAuthStore.setState({ user: null });
    }
  }
});
