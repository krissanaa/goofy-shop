"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useGlobalConfig } from "@/components/global-config-provider"

const COOKIE_BAR_KEY = "goofy-cookie-policy-accepted-v1"

export function CookiePolicyBar() {
  const config = useGlobalConfig()
  const [dismissed, setDismissed] = useState(true)

  const godMode = config.godMode
  const shouldShow = !godMode.enabled || godMode.bottom.showCookieBar

  useEffect(() => {
    if (!shouldShow) {
      setDismissed(true)
      return
    }

    if (typeof window === "undefined") return
    const accepted = window.localStorage.getItem(COOKIE_BAR_KEY) === "1"
    setDismissed(accepted)
  }, [shouldShow])

  if (!shouldShow || dismissed) return null

  const onAccept = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_BAR_KEY, "1")
    }
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t-2 border-black bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="text-xs font-semibold text-foreground/80">
          {godMode.bottom.cookieBarText}{" "}
          <Link
            href={godMode.bottom.cookiePolicyUrl}
            className="font-black uppercase tracking-[0.08em] text-primary hover:underline"
          >
            Policy
          </Link>
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="border-2 border-black bg-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#E70009]"
        >
          {godMode.bottom.cookieButtonText}
        </button>
      </div>
    </div>
  )
}
