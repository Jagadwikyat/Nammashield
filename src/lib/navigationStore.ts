import { create } from "zustand";

export type Page =
  | "landing"
  | "onboarding"
  | "dashboard"
  | "policy"
  | "claims"
  | "calculator"
  | "admin";

interface AppState {
  currentPage: Page;
  role: "worker" | "admin";
  isOnboarded: boolean;
  navigate: (page: Page) => void;
  setRole: (role: "worker" | "admin") => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "landing",
  role: "worker",
  isOnboarded: false,
  navigate: (page) => set({ currentPage: page }),
  setRole: (role) => set({ role }),
  completeOnboarding: () => set({ isOnboarded: true, currentPage: "dashboard" }),
}));
