"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type WishlistStore = {
  items: string[]
  hydrated: boolean
  toggle: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  setHydrated: (value: boolean) => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      toggle: (id) =>
        set((state) => ({
          items: state.items.includes(id)
            ? state.items.filter((item) => item !== id)
            : [...state.items, id],
        })),
      has: (id) => get().items.includes(id),
      clear: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "goofy-wishlist",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
