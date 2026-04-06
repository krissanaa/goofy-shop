"use client"

import { Toaster } from "react-hot-toast"

export function AdminToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-ui-sans)",
          fontSize: "11px",
        },
        success: {
          iconTheme: {
            primary: "var(--gold)",
            secondary: "var(--surface)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--danger)",
            secondary: "var(--surface)",
          },
        },
      }}
    />
  )
}
