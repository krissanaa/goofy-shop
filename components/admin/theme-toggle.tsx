"use client"

import { Moon, Sun } from "lucide-react"
import { useAdminThemeStore } from "@/lib/admin/theme-store"

interface ThemeToggleProps {
  compact?: boolean
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const theme = useAdminThemeStore((state) => state.theme)
  const toggleTheme = useAdminThemeStore((state) => state.toggleTheme)

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle admin theme"
      >
        <span className="theme-toggle-knob">
          {theme === "dark" ? "🌙" : "☀"}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-2 goofy-mono text-[10px] uppercase tracking-[0.18em] text-[var(--admin-fg)] transition-colors hover:border-[var(--admin-accent)]"
      aria-label="Toggle admin theme"
    >
      {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  )
}
