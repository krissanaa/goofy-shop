"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  getCategoryLabel,
  parseMultiValue,
  removeMultiValueSearchParam,
  SHOP_SORT_OPTIONS,
  SHOP_PRICE_RANGES,
  updateSearchParams,
  type ShopSearchParams,
} from "@/lib/shop"

interface ActiveFiltersProps {
  searchParams: ShopSearchParams
}

export function ActiveFilters({ searchParams }: ActiveFiltersProps) {
  const router = useRouter()
  const activeCategories = parseMultiValue(searchParams.category)
  const activeBrands = parseMultiValue(searchParams.brand)
  const activeSort =
    searchParams.sort && searchParams.sort !== "newest"
      ? SHOP_SORT_OPTIONS.find((option) => option.value === searchParams.sort)
      : null
  const activePrice = SHOP_PRICE_RANGES.find(
    (range) => range.value === searchParams.price,
  )

  const filters = [
    ...activeCategories.map((category) => ({
      key: `category:${category}`,
      label: `Category: ${getCategoryLabel(category)}`,
      remove: () =>
        router.push(removeMultiValueSearchParam(searchParams, "category", category)),
    })),
    ...activeBrands.map((brand) => ({
      key: `brand:${brand}`,
      label: `Brand: ${brand}`,
      remove: () =>
        router.push(removeMultiValueSearchParam(searchParams, "brand", brand)),
    })),
    searchParams.badge
      ? {
          key: `badge:${searchParams.badge}`,
          label: `Badge: ${searchParams.badge}`,
          remove: () =>
            router.push(updateSearchParams(searchParams, { badge: undefined })),
        }
      : null,
    activePrice
      ? {
          key: `price:${activePrice.value}`,
          label: activePrice.label,
          remove: () =>
            router.push(updateSearchParams(searchParams, { price: undefined })),
        }
      : null,
    searchParams.inStock === "true"
      ? {
          key: "in-stock",
          label: "In Stock",
          remove: () =>
            router.push(updateSearchParams(searchParams, { inStock: undefined })),
        }
      : null,
    searchParams.q
      ? {
          key: `q:${searchParams.q}`,
          label: `Search: ${searchParams.q}`,
          remove: () => router.push(updateSearchParams(searchParams, { q: undefined })),
        }
      : null,
    activeSort
      ? {
          key: `sort:${activeSort.value}`,
          label: activeSort.label,
          remove: () =>
            router.push(updateSearchParams(searchParams, { sort: undefined })),
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    remove: () => void
  }>

  if (filters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--bordw)] px-5 py-3">
      <AnimatePresence>
        {filters.map((filter) => (
          <motion.span
            key={filter.key}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-2 border border-[var(--gold)] px-3 py-1.5 goofy-mono text-[7px] uppercase tracking-[0.15em] text-[var(--gold)]"
          >
            {filter.label}
            <button type="button" onClick={filter.remove} aria-label={`Remove ${filter.label}`}>
              x
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
