"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { AdminToast } from "@/components/admin/toast"
import { useAdminThemeStore } from "@/lib/admin/theme-store"

interface AdminThemeProviderProps {
  children: ReactNode
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const theme = useAdminThemeStore((state) => state.theme)
  const initialThemeRef = useRef<string | null>(null)
  const initialBodyModeRef = useRef<string | null>(null)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (initialThemeRef.current === null) {
      initialThemeRef.current = html.getAttribute("data-theme")
    }

    if (initialBodyModeRef.current === null) {
      initialBodyModeRef.current = body.getAttribute("data-admin-ui")
    }

    html.setAttribute("data-theme", theme)
    body.setAttribute("data-admin-ui", "true")

    return () => {
      if (initialThemeRef.current === null) {
        html.removeAttribute("data-theme")
      } else {
        html.setAttribute("data-theme", initialThemeRef.current)
      }

      if (initialBodyModeRef.current === null) {
        body.removeAttribute("data-admin-ui")
      } else {
        body.setAttribute("data-admin-ui", initialBodyModeRef.current)
      }
    }
  }, [theme])

  return (
    <>
      {children}
      <AdminToast />
    </>
  )
}
