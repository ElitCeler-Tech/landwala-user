"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuthGateStore } from "@/store/authGateStore";

// Guards an action (wishlist add, submit enquiry, etc.) behind login.
// If already authenticated, runs immediately and returns true. Otherwise
// opens the "sign in to continue" modal (which offers Login/Signup that
// redirect back to the current page) and returns false without acting --
// the caller's form/page state is untouched since nothing navigates away.
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const openAuthGate = useAuthGateStore((s) => s.open);
  const pathname = usePathname();

  const requireAuth = () => {
    if (isAuthenticated) return true;
    openAuthGate(pathname);
    return false;
  };

  return { requireAuth, isAuthenticated };
}
