"use client"

import { useMemo } from "react"
import { useGlobalConfig } from "@/components/global-config-provider"
import { cn } from "@/lib/utils"

interface MarqueeTickerProps {
  className?: string
  items?: string[]
}

const fallbackItems = [
  "* NEW DROP COMING SOON",
  "* LIMITED STOCK AVAILABLE",
  "* 1 PER CUSTOMER",
  "* FREE SHIPPING OVER $150",
]

export function MarqueeTicker({ className, items }: MarqueeTickerProps) {
  const config = useGlobalConfig()

  const sourceItems = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items
    }

    if (Array.isArray(config.announcement.items) && config.announcement.items.length > 0) {
      return config.announcement.items
    }

    return fallbackItems
  }, [config.announcement.items, items])

  if (!config.announcement.active && !items) {
    return null
  }

  const repeated = [...sourceItems, ...sourceItems, ...sourceItems]

  return (
    <div className={cn("overflow-hidden bg-black py-2", className)}>
      <div className="marquee-track flex whitespace-nowrap">
        {repeated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="mx-8 text-[12px] font-semibold uppercase tracking-[0.1em] text-white"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

