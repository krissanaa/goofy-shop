export const SHOP_CATEGORIES = [
  "deck",
  "wheel",
  "truck",
  "bearing",
  "shoe",
  "apparel",
] as const

export const SHOP_BADGES = ["NEW", "HOT", "SALE", "COLLAB"] as const

export const SHOP_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low -> High" },
  { value: "price_desc", label: "Price: High -> Low" },
  { value: "name_az", label: "Name: A -> Z" },
] as const

export const SHOP_PRICE_RANGES = [
  { value: "under500", label: "Under \u20AD500K", min: null, max: 500_000 },
  { value: "500to1m", label: "\u20AD500K-1M", min: 500_000, max: 1_000_000 },
  { value: "1mto2m", label: "\u20AD1M-2M", min: 1_000_000, max: 2_000_000 },
  { value: "above2m", label: "Above \u20AD2M", min: 2_000_000, max: null },
] as const

export type ShopCategory = (typeof SHOP_CATEGORIES)[number]
export type ShopBadge = (typeof SHOP_BADGES)[number]
export type ShopPriceRangeValue = (typeof SHOP_PRICE_RANGES)[number]["value"]
export type ShopSortValue = (typeof SHOP_SORT_OPTIONS)[number]["value"]
export type ShopView = "grid" | "list"
export type ShopMultiValueKey = "brand" | "category"

export interface ShopProduct {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  original_price?: number | null
  images: string[] | null
  category: string | null
  brand: string | null
  badge: string | null
  stock: number
  description: string | null
  specs: Record<string, unknown> | null
  active: boolean
  created_at: string | null
}

export interface ShopSearchParams {
  category?: string
  brand?: string
  sort?: string
  badge?: string
  price?: string
  q?: string
  inStock?: string
}

export interface ShopFacets {
  total: number
  categoryCounts: Record<string, number>
  brandCounts: Record<string, number>
  badgeCounts: Record<string, number>
  priceCounts: Record<string, number>
}

export function resolveSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function parseMultiValue(value?: string | null): string[] {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function createSearchParams(searchParams: ShopSearchParams): URLSearchParams {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value)
    }
  }

  return params
}

export function updateSearchParams(
  searchParams: ShopSearchParams,
  updates: Partial<Record<keyof ShopSearchParams, string | undefined>>,
): string {
  const params = createSearchParams(searchParams)

  for (const [key, value] of Object.entries(updates) as Array<
    [keyof ShopSearchParams, string | undefined]
  >) {
    if (!value) {
      params.delete(key)
      continue
    }

    params.set(key, value)
  }

  const query = params.toString()
  return query.length > 0 ? `/shop?${query}` : "/shop"
}

export function toggleMultiValueSearchParam(
  searchParams: ShopSearchParams,
  key: ShopMultiValueKey,
  value: string,
): string {
  const currentValues = parseMultiValue(searchParams[key])
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((entry) => entry !== value)
    : [...currentValues, value]

  return updateSearchParams(searchParams, {
    [key]: nextValues.length > 0 ? nextValues.join(",") : undefined,
  })
}

export function removeMultiValueSearchParam(
  searchParams: ShopSearchParams,
  key: ShopMultiValueKey,
  value: string,
): string {
  const nextValues = parseMultiValue(searchParams[key]).filter(
    (entry) => entry !== value,
  )

  return updateSearchParams(searchParams, {
    [key]: nextValues.length > 0 ? nextValues.join(",") : undefined,
  })
}

export function getPriceRange(value?: string | null) {
  return SHOP_PRICE_RANGES.find((range) => range.value === value)
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    deck: "Deck",
    wheel: "Wheel",
    truck: "Truck",
    bearing: "Bearing",
    shoe: "Shoe",
    apparel: "Apparel",
  }

  return labels[category] ?? category
}

export function getBadgeLabel(badge: string): string {
  return badge.toUpperCase()
}

export function getBadgeTone(badge?: string | null): string {
  if ((badge ?? "").toUpperCase() === "SALE") {
    return "bg-white/10 text-[var(--white)]"
  }

  return "bg-[var(--gold)] text-[var(--black)]"
}

export function getProductComparePrice(product: ShopProduct): number | null {
  return product.compare_price ?? product.original_price ?? null
}

export function getProductDiscountPercentage(product: ShopProduct): number | null {
  const comparePrice = getProductComparePrice(product)
  if (!comparePrice || comparePrice <= product.price) {
    return null
  }

  return Math.round((1 - product.price / comparePrice) * 100)
}

export function hasActiveShopFilters(searchParams: ShopSearchParams): boolean {
  return Boolean(
    searchParams.category ||
      searchParams.brand ||
      searchParams.badge ||
      searchParams.price ||
      searchParams.q ||
      searchParams.inStock,
  )
}

export function sanitizeSearchTerm(value?: string | null): string {
  return (value ?? "").replace(/[,%]/g, " ").trim()
}
