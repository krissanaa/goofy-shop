"use client"

import Link from "next/link"

interface FilterTabItem {
  value: string
  label: string
  href?: string
  count?: number
}

interface FilterTabsProps {
  tabs: FilterTabItem[]
  activeValue: string
  onChange?: (value: string) => void
}

export function FilterTabs({
  tabs,
  activeValue,
  onChange,
}: FilterTabsProps) {
  return (
    <div className="filter-bar">
      {tabs.map((tab) => {
        const content =
          typeof tab.count === "number" ? `${tab.label} (${tab.count})` : tab.label
        const className = `ftab ${activeValue === tab.value ? "active" : ""}`

        if (tab.href) {
          return (
            <Link key={tab.value} href={tab.href} className={className}>
              {content}
            </Link>
          )
        }

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange?.(tab.value)}
            className={className}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
