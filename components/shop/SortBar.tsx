"use client"

import { useRouter } from "next/navigation"
import {
  SHOP_SORT_OPTIONS,
  updateSearchParams,
  type ShopSearchParams,
  type ShopView,
} from "@/lib/shop"

interface SortBarProps {
  total: number
  view: ShopView
  onViewChange: (view: ShopView) => void
  onOpenMobileFilter: () => void
  searchParams: ShopSearchParams
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={active ? "text-[var(--white)]" : "text-white/30"}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.5" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="8.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.5" y="8.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={active ? "text-[var(--white)]" : "text-white/30"}
      aria-hidden="true"
    >
      <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  )
}

export function SortBar({
  total,
  view,
  onViewChange,
  onOpenMobileFilter,
  searchParams,
}: SortBarProps) {
  const router = useRouter()

  return (
    <div className="sticky top-[76px] z-10 flex items-center justify-between border-b border-[var(--bordw)] bg-[var(--black)]/95 px-5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileFilter}
          className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-[var(--white)] lg:hidden"
        >
          <FilterIcon />
          <span className="goofy-mono text-[8px] uppercase tracking-[0.18em]">Filter</span>
        </button>

        <div className="flex items-center gap-3">
          <select
            value={searchParams.sort ?? "newest"}
            onChange={(event) =>
              router.push(
                updateSearchParams(searchParams, {
                  sort: event.target.value || undefined,
                }),
              )
            }
            className="border border-[var(--bordw)] bg-transparent px-3 py-2 goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/60 outline-none transition-colors hover:text-[var(--white)]"
          >
            {SHOP_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[var(--black)] text-[var(--white)]">
                {option.label}
              </option>
            ))}
          </select>

          <span className="hidden goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/20 md:inline">
            {total} items
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewChange("grid")}
          className="grid h-8 w-8 place-items-center"
          aria-label="Grid view"
        >
          <GridIcon active={view === "grid"} />
        </button>
        <button
          type="button"
          onClick={() => onViewChange("list")}
          className="grid h-8 w-8 place-items-center"
          aria-label="List view"
        >
          <ListIcon active={view === "list"} />
        </button>
      </div>
    </div>
  )
}
