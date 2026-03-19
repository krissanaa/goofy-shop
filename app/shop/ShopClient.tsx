"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { GoofyButton } from "@/components/GoofyButton"
import { ActiveFilters } from "@/components/shop/ActiveFilters"
import { FilterSidebar } from "@/components/shop/FilterSidebar"
import { ProductCard } from "@/components/shop/ProductCard"
import { SortBar } from "@/components/shop/SortBar"
import { staggerContainer } from "@/lib/motion"
import type { ShopFacets, ShopProduct, ShopSearchParams, ShopView } from "@/lib/shop"

interface ShopClientProps {
  initialProducts: ShopProduct[]
  brands: string[]
  categories: string[]
  facets: ShopFacets
  searchParams: ShopSearchParams
}

function EmptyState({ query }: { query?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 text-center">
      <h2 className="goofy-display text-[clamp(34px,5vw,64px)] leading-none text-[var(--white)]">
        No Products Found
      </h2>
      <p className="mt-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
        {query
          ? `No matches for "${query}". Try different keywords.`
          : "Try another filter set or reset the catalog."}
      </p>
      <GoofyButton href="/shop" variant="ghost" size="sm" className="mt-6">
        Clear Filters
      </GoofyButton>
    </div>
  )
}

export default function ShopClient({
  initialProducts,
  brands,
  categories,
  facets,
  searchParams,
}: ShopClientProps) {
  const [view, setView] = useState<ShopView>("grid")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const resultSummary = useMemo(() => {
    if (!searchParams.q) {
      return null
    }

    return `${initialProducts.length} results for "${searchParams.q}"`
  }, [initialProducts.length, searchParams.q])

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <div className="border-b border-[var(--bordw)] px-5 py-6 md:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
              GOOFY. / SHOP
            </p>
            <h1 className="goofy-display mt-1 text-[clamp(36px,5vw,72px)] leading-none">
              All Products
            </h1>
            {resultSummary ? (
              <p className="mt-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                {resultSummary}
              </p>
            ) : null}
          </div>
          <p className="goofy-mono text-[9px] text-white/30">
            {initialProducts.length} items
          </p>
        </div>
      </div>

      <ActiveFilters searchParams={searchParams} />

      <div className="flex">
        <FilterSidebar
          categories={categories}
          brands={brands}
          searchParams={searchParams}
          facets={facets}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <SortBar
            total={initialProducts.length}
            view={view}
            onViewChange={setView}
            onOpenMobileFilter={() => setSidebarOpen(true)}
            searchParams={searchParams}
          />

          {initialProducts.length === 0 ? (
            <EmptyState query={searchParams.q} />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className={
                view === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col"
              }
            >
              {initialProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  view={view}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
