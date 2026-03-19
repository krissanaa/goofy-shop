"use client"

import { usePathname } from "next/navigation"
import { CookiePolicyBar } from "@/components/cookie-policy-bar"
import { GlobalWatermark } from "@/components/global-watermark"

interface RouteChromeProps {
  watermarkText: string
}

export function RouteChrome({ watermarkText }: RouteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  if (isAdminRoute) {
    return null
  }

  return (
    <>
      <GlobalWatermark text={watermarkText} />
      <CookiePolicyBar />
    </>
  )
}
