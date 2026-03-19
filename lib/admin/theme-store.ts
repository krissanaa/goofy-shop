"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type AdminTheme = "dark" | "light"

interface AdminThemeStore {
  theme: AdminTheme
  setTheme: (theme: AdminTheme) => void
  toggleTheme: () => void
}

export const useAdminThemeStore = create<AdminThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "goofy-admin-theme-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
