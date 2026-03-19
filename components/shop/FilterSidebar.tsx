"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { GoofyButton } from "@/components/GoofyButton"
import {
  getCategoryLabel,
  hasActiveShopFilters,
  parseMultiValue,
  SHOP_BADGES,
  SHOP_PRICE_RANGES,
  toggleMultiValueSearchParam,
  updateSearchParams,
  type ShopFacets,
  type ShopSearchParams,
} from "@/lib/shop"

interface FilterSidebarProps {
  categories: string[]
  brands: string[]
  searchParams: ShopSearchParams
  facets: ShopFacets
  isOpen: boolean
  onClose: () => void
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="goofy-mono text-[7px] uppercase tracking-[0.24em] text-[var(--gold)]">
        {children}
      </span>
      <span className="h-px flex-1 bg-[var(--gold)]/20" />
    </div>
  )
}

function SidebarContent({
  categories,
  brands,
  searchParams,
  facets,
  onNavigate,
}: Omit<FilterSidebarProps, "isOpen" | "onClose"> & {
  onNavigate?: () => void
}) {
  const router = useRouter()
  const activeCategories = parseMultiValue(searchParams.category)
  const activeBrands = parseMultiValue(searchParams.brand)
  const hasFilters = hasActiveShopFilters(searchParams)

  const navigate = (href: string) => {
    router.push(href)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--bordw)] px-5 py-5">
        <SectionLabel>CATEGORY</SectionLabel>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(updateSearchParams(searchParams, { category: undefined }))}
            className={`flex w-full items-center justify-between border-l-2 py-2 pl-3 pr-0 text-left transition-colors ${
              activeCategories.length === 0
                ? "border-[var(--gold)] text-[var(--gold)]"
                : "border-transparent text-white/60 hover:text-[var(--white)]"
            }`}
          >
            <span className="goofy-mono text-[9px] uppercase tracking-[0.16em]">All</span>
            <span className="goofy-mono text-[8px] text-white/20">{facets.total}</span>
          </button>

          {categories.map((category) => {
            const isActive = activeCategories.includes(category)

            return (
              <button
                key={category}
                type="button"
                onClick={() => navigate(toggleMultiValueSearchParam(searchParams, "category", category))}
                className={`flex w-full items-center justify-between border-l-2 py-2 pl-3 pr-0 text-left transition-colors ${
                  isActive
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-transparent text-white/60 hover:text-[var(--white)]"
                }`}
              >
                <span className="goofy-mono text-[9px] uppercase tracking-[0.16em]">
                  {getCategoryLabel(category)}
                </span>
                <span className="goofy-mono text-[8px] text-white/20">
                  {facets.categoryCounts[category] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-b border-[var(--bordw)] px-5 py-5">
        <SectionLabel>BRAND</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => {
            const isActive = activeBrands.includes(brand)

            return (
              <button
                key={brand}
                type="button"
                onClick={() => navigate(toggleMultiValueSearchParam(searchParams, "brand", brand))}
                className={`px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "bg-[var(--gold)] text-[var(--black)]"
                    : "border border-[var(--bordw)] text-white/50 hover:text-[var(--white)]"
                }`}
              >
                {brand}{" "}
                <span className={isActive ? "text-[var(--black)]/60" : "text-white/20"}>
                  {facets.brandCounts[brand] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-b border-[var(--bordw)] px-5 py-5">
        <SectionLabel>FILTER</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SHOP_BADGES.map((badge) => {
            const isActive = searchParams.badge === badge

            return (
              <button
                key={badge}
                type="button"
                onClick={() =>
                  navigate(
                    updateSearchParams(searchParams, {
                      badge: isActive ? undefined : badge,
                    }),
                  )
                }
                className={`px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "bg-[var(--gold)] text-[var(--black)]"
                    : "border border-[var(--bordw)] text-white/50 hover:text-[var(--white)]"
                }`}
              >
                {badge}{" "}
                <span className={isActive ? "text-[var(--black)]/60" : "text-white/20"}>
                  {facets.badgeCounts[badge] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-b border-[var(--bordw)] px-5 py-5">
        <SectionLabel>PRICE</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SHOP_PRICE_RANGES.map((range) => {
            const isActive = searchParams.price === range.value

            return (
              <button
                key={range.value}
                type="button"
                onClick={() =>
                  navigate(
                    updateSearchParams(searchParams, {
                      price: isActive ? undefined : range.value,
                    }),
                  )
                }
                className={`px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "bg-[var(--gold)] text-[var(--black)]"
                    : "border border-[var(--bordw)] text-white/50 hover:text-[var(--white)]"
                }`}
              >
                {range.label}{" "}
                <span className={isActive ? "text-[var(--black)]/60" : "text-white/20"}>
                  {facets.priceCounts[range.value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-b border-[var(--bordw)] px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="goofy-mono text-[7px] uppercase tracking-[0.24em] text-[var(--gold)]">
              IN STOCK
            </span>
            <span className="h-px w-12 bg-[var(--gold)]/20" />
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                updateSearchParams(searchParams, {
                  inStock: searchParams.inStock === "true" ? undefined : "true",
                }),
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
              searchParams.inStock === "true"
                ? "border-[var(--gold)] bg-[var(--gold)]/18"
                : "border-[var(--bordw)] bg-transparent"
            }`}
            aria-pressed={searchParams.inStock === "true"}
          >
            <span
              className={`h-4 w-4 rounded-full transition-transform ${
                searchParams.inStock === "true"
                  ? "translate-x-6 bg-[var(--gold)]"
                  : "translate-x-1 bg-white/30"
              }`}
            />
          </button>
        </div>
        <p className="goofy-mono text-[8px] uppercase tracking-[0.16em] text-white/34">
          Show only products ready to ship now.
        </p>
      </div>

      <div className="mt-auto px-5 py-5">
        {hasFilters ? (
          <GoofyButton variant="ghost" size="sm" href="/shop" className="px-0">
            Clear All Filters
          </GoofyButton>
        ) : (
          <Link
            href="/shop"
            className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/20"
          >
            All products live now
          </Link>
        )}
      </div>
    </div>
  )
}

export function FilterSidebar({
  categories,
  brands,
  searchParams,
  facets,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  return (
    <>
      <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-[240px] shrink-0 overflow-y-auto border-r border-[var(--bordw)] lg:block">
        <SidebarContent
          categories={categories}
          brands={brands}
          searchParams={searchParams}
          facets={facets}
        />
      </aside>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 z-50 h-screen w-[240px] overflow-y-auto border-r border-[var(--bordw)] bg-[var(--black)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--bordw)] px-5 py-4">
                <span className="goofy-mono text-[8px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Filters
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/50 transition-colors hover:text-[var(--white)]"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <SidebarContent
                categories={categories}
                brands={brands}
                searchParams={searchParams}
                facets={facets}
                onNavigate={onClose}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
