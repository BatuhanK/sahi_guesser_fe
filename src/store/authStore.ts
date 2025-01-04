import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  fingerprint: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setFingerprint: (fingerprint: string) => void;
  logout: () => void;
  clearForcedLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  fingerprint: localStorage.getItem("fingerprint"),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.removeItem("forced_logout");
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },
  setFingerprint: (fingerprint) => {
    localStorage.setItem("fingerprint", fingerprint);
    set({ fingerprint });
  },
  logout: () => {
    localStorage.setItem("forced_logout", "true");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  clearForcedLogout: () => {
    localStorage.removeItem("forced_logout");
  },
}));
