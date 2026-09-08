import { create } from "zustand";
import axios from "axios";
import { wishlistApi } from "@/lib/api";

type WishlistType = "PROPERTY" | "LAYOUT";

interface WishlistState {
  /** Saved ids, keyed by type. */
  ids: Record<WishlistType, Set<string>>;
  loaded: boolean;
  loading: boolean;
  pending: Set<string>;
  load: () => Promise<void>;
  reset: () => void;
  toggle: (type: WishlistType, id: string) => Promise<void>;
}

/**
 * One shared copy of the wishlist for the whole page. The home page mounts
 * several property sections at once, so each of them reading its own copy
 * would fire a duplicate GET /wishlist on every render pass.
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: { PROPERTY: new Set(), LAYOUT: new Set() },
  loaded: false,
  loading: false,
  pending: new Set(),

  load: async () => {
    const { loaded, loading } = get();
    if (loaded || loading) return;
    set({ loading: true });
    try {
      const response = await wishlistApi.get({ page: 1, limit: 100 });
      const next: Record<WishlistType, Set<string>> = {
        PROPERTY: new Set(),
        LAYOUT: new Set(),
      };
      for (const item of response.data ?? []) {
        const id = item.type === "LAYOUT" ? item.layout?.id : item.property?.id;
        if (id && (item.type === "LAYOUT" || item.type === "PROPERTY")) {
          next[item.type].add(id);
        }
      }
      set({ ids: next, loaded: true });
    } catch {
      // A failed load just means no hearts are pre-filled; allow a retry later.
    } finally {
      set({ loading: false });
    }
  },

  reset: () =>
    set({
      ids: { PROPERTY: new Set(), LAYOUT: new Set() },
      loaded: false,
      loading: false,
      pending: new Set(),
    }),

  toggle: async (type, id) => {
    const { ids, pending } = get();
    if (pending.has(id)) return;

    const wasIn = ids[type].has(id);
    const optimistic = new Set(ids[type]);
    if (wasIn) optimistic.delete(id);
    else optimistic.add(id);

    set({
      ids: { ...ids, [type]: optimistic },
      pending: new Set(pending).add(id),
    });

    const payload =
      type === "LAYOUT"
        ? { type: "LAYOUT" as const, layoutId: id }
        : { type: "PROPERTY" as const, propertyId: id };

    try {
      if (wasIn) await wishlistApi.remove(payload);
      else await wishlistApi.add(payload);
    } catch (error) {
      const current = get().ids;
      const reverted = new Set(current[type]);
      // 409 means the server already holds the item, so keep it saved rather
      // than bouncing the heart back, the same reconciliation the app does.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        reverted.add(id);
      } else if (wasIn) {
        reverted.add(id);
      } else {
        reverted.delete(id);
      }
      set({ ids: { ...current, [type]: reverted } });
    } finally {
      const next = new Set(get().pending);
      next.delete(id);
      set({ pending: next });
    }
  },
}));
