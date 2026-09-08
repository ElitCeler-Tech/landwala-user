"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWishlistStore } from "@/store/wishlistStore";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Wishlist state for property/layout cards, mirroring the app's
 * PropertySectionSlider behaviour: load the current wishlist once, toggle
 * optimistically, and reconcile a 409 instead of bouncing the heart back.
 * The underlying store is shared, so several sections on one page cost a
 * single GET /wishlist.
 *
 * Sample/placeholder rows in some listings carry non-UUID ids; the app skips
 * those rather than firing a request the backend will reject, so we do too.
 */
export function useWishlist(type: "PROPERTY" | "LAYOUT" = "PROPERTY") {
  const { isAuthenticated } = useAuthStore();
  const { requireAuth } = useRequireAuth();
  const ids = useWishlistStore((s) => s.ids[type]);
  const load = useWishlistStore((s) => s.load);
  const reset = useWishlistStore((s) => s.reset);
  const toggleInStore = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    if (isAuthenticated) load();
    else reset();
  }, [isAuthenticated, load, reset]);

  const isWishlisted = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (!id || !UUID_RE.test(id)) return;
      if (!requireAuth()) return;
      void toggleInStore(type, id);
    },
    [requireAuth, toggleInStore, type],
  );

  return { isWishlisted, toggle, wishlistIds: ids };
}
