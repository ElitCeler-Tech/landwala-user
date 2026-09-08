import { create } from "zustand";

interface AuthGateState {
  isOpen: boolean;
  redirectPath: string;
  open: (redirectPath?: string) => void;
  close: () => void;
}

// UI-only state for the "sign in to continue" modal, deliberately not
// persisted (unlike useAuthStore) -- it should always start closed.
export const useAuthGateStore = create<AuthGateState>()((set) => ({
  isOpen: false,
  redirectPath: "/",

  open: (redirectPath) =>
    set({
      isOpen: true,
      redirectPath:
        redirectPath ??
        (typeof window !== "undefined" ? window.location.pathname : "/"),
    }),

  close: () => set({ isOpen: false }),
}));
