"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Clock3 } from "lucide-react"
import {
  HomeNewArrivalsGrid,
  type HomeNewArrivalProduct,
  type ProductSectionGridTheme,
} from "@/components/home-new-arrivals-grid"
import { cn } from "@/lib/utils"
import { getProductsByBadge } from "@/lib/api"

export type ProductBadge = 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
export type ProductBadgeFilter = ProductBadge | 'ALL';
const MIN_PRODUCTS = 1
const MAX_PRODUCTS = 12
const BADGE_FILTER_VALUES: ProductBadgeFilter[] = [
  "ALL",
  "NEW",
  "DROP",
  "SALE",
  "HOT",
  "COLLAB",
]

interface DynamicBadgeProductSlotProps {
  title?: string | null
  subtitle?: string | null
  limit?: number | null
  badgeFilter?: ProductBadgeFilter | null
  defaultBadgeFilter: ProductBadgeFilter
  emptyMessage?: string
  saleEndDateOverride?: string | null
}

interface ProductResponse {
  data?: unknown[]
}

interface BadgeSlotTheme {
  eyebrow: string
  defaultTitle: string
  defaultSubtitle: string
  ctaLabel: string
  ctaHref: string
  background: string
  accent: string
  text: string
  mutedText: string
  infoSurface: string
  isDark: boolean
  gridLine: string
}

interface SectionStat {
  label: string
  value: string
}

const headingFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 900 as const,
  fontStyle: "italic" as const,
}

const bodyFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const badgeFontStyle = {
  fontFamily: "'Press Start 2P', var(--font-mono), monospace",
}

const BADGE_SLOT_THEMES: Record<ProductBadgeFilter, BadgeSlotTheme> = {
  ALL: {
    eyebrow: "CURATED PICKS",
    defaultTitle: "SHOP ALL PRODUCTS",
    defaultSubtitle: "Freshly synced products across the entire GOOFY catalog.",
    ctaLabel: "SHOP ALL",
    ctaHref: "/products",
    background: "#FFFFFF",
    accent: "#1A1614",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.62)",
    infoSurface: "rgba(255,255,255,0.86)",
    isDark: false,
    gridLine: "rgba(0,0,0,0.06)",
  },
  NEW: {
    eyebrow: "JUST LANDED",
    defaultTitle: "NEW ARRIVALS",
    defaultSubtitle: "Latest setups, apparel, and fresh stock straight into the shop.",
    ctaLabel: "SHOP NEW ARRIVALS",
    ctaHref: "/products?badge=new",
    background: "#FFFFFF",
    accent: "#5C94FC",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.62)",
    infoSurface: "rgba(92,148,252,0.08)",
    isDark: false,
    gridLine: "rgba(0,0,0,0.06)",
  },
  DROP: {
    eyebrow: "DROP READY",
    defaultTitle: "DROP ITEMS",
    defaultSubtitle: "Pieces carrying drop energy and limited release timing.",
    ctaLabel: "SHOP DROP",
    ctaHref: "/products?badge=drop",
    background: "#F5EFE0",
    accent: "#5C94FC",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.62)",
    infoSurface: "rgba(92,148,252,0.08)",
    isDark: false,
    gridLine: "rgba(0,0,0,0.06)",
  },
  SALE: {
    eyebrow: "LIMITED TIME",
    defaultTitle: "SALE",
    defaultSubtitle: "Current markdowns moving fast while sizes and stock still hold.",
    ctaLabel: "SHOP SALE NOW",
    ctaHref: "/products?badge=sale",
    background: "#0D0000",
    accent: "#E52222",
    text: "#F5EFE0",
    mutedText: "rgba(245,239,224,0.62)",
    infoSurface: "rgba(229,34,34,0.08)",
    isDark: true,
    gridLine: "rgba(229,34,34,0.03)",
  },
  HOT: {
    eyebrow: "TRENDING",
    defaultTitle: "HOT TRENDING",
    defaultSubtitle: "What the community is checking, buying, and talking about most.",
    ctaLabel: "SHOP TRENDING",
    ctaHref: "/products?badge=hot",
    background: "#EDE8DC",
    accent: "#C84B0C",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.62)",
    infoSurface: "rgba(200,75,12,0.08)",
    isDark: false,
    gridLine: "rgba(0,0,0,0.06)",
  },
  COLLAB: {
    eyebrow: "COLLAB DROP",
    defaultTitle: "COLLAB",
    defaultSubtitle: "Limited partnership stock, controlled access, and faster sell-through.",
    ctaLabel: "SHOP COLLAB",
    ctaHref: "/products?badge=collab",
    background: "#0A0E1A",
    accent: "#F8B800",
    text: "#F5EFE0",
    mutedText: "rgba(245,239,224,0.68)",
    infoSurface: "rgba(17,17,17,0.82)",
    isDark: true,
    gridLine: "rgba(248,184,0,0.045)",
  },
}

function clampLimit(value: number | null | undefined): number {
  if (!Number.isFinite(value)) {
    return 4
  }

  const normalized = Math.floor(Number(value))
  return Math.max(MIN_PRODUCTS, Math.min(MAX_PRODUCTS, normalized))
}

function normalizeBadgeFilter(
  value: ProductBadgeFilter | null | undefined,
  fallback: ProductBadgeFilter,
): ProductBadgeFilter {
  if (!value) return fallback
  const normalized = value.toUpperCase() as ProductBadgeFilter
  return BADGE_FILTER_VALUES.includes(normalized) ? normalized : fallback
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const attributes = record.attributes
  if (attributes && typeof attributes === "object") {
    return {
      ...record,
      ...(attributes as Record<string, unknown>),
    }
  }

  return record
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function resolveAssetUrl(url: string): string {
  if (!url) return "/images/placeholder.jpg"
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  return url
}

function toMediaArray(value: unknown): Record<string, unknown>[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
  }

  const record = toRecord(value)
  if (!record) return []

  const relationData = record.data
  if (Array.isArray(relationData)) {
    return relationData
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
  }

  return []
}

function toMediaItem(value: unknown): Record<string, unknown> | null {
  if (!value) return null

  if (Array.isArray(value)) {
    return toRecord(value[0] ?? null)
  }

  const record = toRecord(value)
  if (!record) return null

  const relationData = record.data
  if (relationData && typeof relationData === "object") {
    return toRecord(relationData)
  }

  return record
}

function toSingleRelation(value: unknown): Record<string, unknown> | null {
  const record = toRecord(value)
  if (!record) return null

  const relationData = record.data
  if (relationData && typeof relationData === "object") {
    return toRecord(relationData)
  }

  return record
}

function resolveProductImage(product: Record<string, unknown>): string {
  const category = toSingleRelation(product.category)
  const image =
    toMediaArray(product.images)[0] ??
    toMediaItem(category?.thumbnail)
  if (!image) return "/images/placeholder.jpg"

  const formats =
    image.formats && typeof image.formats === "object"
      ? (image.formats as Record<string, unknown>)
      : null
  const medium =
    formats?.medium && typeof formats.medium === "object"
      ? (formats.medium as Record<string, unknown>)
      : null
  const small =
    formats?.small && typeof formats.small === "object"
      ? (formats.small as Record<string, unknown>)
      : null
  const thumbnail =
    formats?.thumbnail && typeof formats.thumbnail === "object"
      ? (formats.thumbnail as Record<string, unknown>)
      : null

  const url =
    toStringValue(medium?.url) ||
    toStringValue(small?.url) ||
    toStringValue(thumbnail?.url) ||
    toStringValue(image.url)

  return resolveAssetUrl(url)
}

function toObjectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

function getNestedNumber(record: Record<string, unknown> | null, keys: string[]): number | null {
  if (!record) return null

  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

function getNestedString(record: Record<string, unknown> | null, keys: string[]): string | null {
  if (!record) return null

  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }

  return null
}

function getValidDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(0, value))
}

function formatRating(value: number): string {
  return value.toFixed(1)
}

function getCountdownUnits(targetDate: Date | null, now: number) {
  const diff = targetDate ? Math.max(targetDate.getTime() - now, 0) : 0

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return [
    { label: "Days", value: String(days).padStart(2, "0") },
    { label: "Hours", value: String(hours).padStart(2, "0") },
    { label: "Minutes", value: String(minutes).padStart(2, "0") },
    { label: "Seconds", value: String(seconds).padStart(2, "0") },
  ]
}

function mapProduct(
  rawProduct: unknown,
  index: number,
): HomeNewArrivalProduct | null {
  const product = toRecord(rawProduct)
  if (!product) return null

  const slug = toStringValue(product.slug)
  const name = toStringValue(product.name)
  if (!slug || !name) return null

  const specs = toObjectValue(product.specs)
  const category =
    toStringValue(toSingleRelation(product.category)?.title) || "Product"
  const id =
    toStringValue(product.documentId) ||
    toStringValue(product.id) ||
    `${slug}-${index}`
  const stock = toNumberValue(product.stock_quantity, 0)
  const isSoldOut = Boolean(product.is_sold_out) || stock <= 0
  const price = toNumberValue(product.price, 0)
  const originalPrice = toNumberValue(product.compare_at_price, 0)

  const brand =
    toStringValue(product.brand_name) ||
    toStringValue(product.brandName) ||
    getNestedString(specs, ["brand_name", "brandName", "brand"]) ||
    category

  const publishedAt =
    toStringValue(product.publishedAt) ||
    toStringValue(product.createdAt) ||
    null

  const saleEndDate =
    toStringValue(product.sale_end_date) ||
    toStringValue(product.saleEndDate) ||
    getNestedString(specs, ["sale_end_date", "saleEndDate"]) ||
    null

  const fallbackViews = Math.max(320, Math.round(price * 16 + (index + 1) * 140))
  const fallbackSold = Math.max(1, (isSoldOut ? 12 : 4) + index * 3)
  const fallbackRating = Math.max(4.1, 4.8 - (index % 4) * 0.1)
  const fallbackLimit = Boolean(product.is_limited) ? 2 : 3
  const fallbackWaitlist = Boolean(product.is_limited) || isSoldOut ? 18 + index * 7 : 0

  return {
    id,
    slug,
    name,
    price,
    originalPrice: originalPrice > 0 ? originalPrice : null,
    category,
    brand,
    image: resolveProductImage(product),
    stock,
    isSoldOut,
    publishedAt,
    saleEndDate,
    viewsCount:
      getNestedNumber(product, ["views_count", "viewsCount"]) ??
      getNestedNumber(specs, ["views_count", "viewsCount", "views"]) ??
      fallbackViews,
    soldCount:
      getNestedNumber(product, ["sold_count", "soldCount"]) ??
      getNestedNumber(specs, ["sold_count", "soldCount", "sold"]) ??
      fallbackSold,
    averageRating:
      getNestedNumber(product, ["average_rating", "averageRating"]) ??
      getNestedNumber(specs, ["average_rating", "averageRating", "rating"]) ??
      fallbackRating,
    limitPerCustomer:
      getNestedNumber(product, ["limit_per_customer", "limitPerCustomer"]) ??
      getNestedNumber(specs, ["limit_per_customer", "limitPerCustomer"]) ??
      fallbackLimit,
    waitlistCount:
      getNestedNumber(product, ["waitlist_count", "waitlistCount"]) ??
      getNestedNumber(specs, ["waitlist_count", "waitlistCount", "waitlist"]) ??
      fallbackWaitlist,
  }
}

function ProductSkeletonCards({
  count,
  theme,
}: {
  count: number
  theme: BadgeSlotTheme
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`home-slot-skeleton-${index}`}
          className="overflow-hidden border"
          style={{
            borderColor: theme.isDark ? "rgba(248,184,0,0.2)" : "rgba(0,0,0,0.12)",
            backgroundColor: theme.isDark ? "#111111" : "rgba(255,255,255,0.86)",
          }}
        >
          <div
            className="aspect-[4/4.6] animate-pulse border-b"
            style={{
              borderColor: theme.isDark ? "rgba(248,184,0,0.2)" : "rgba(0,0,0,0.12)",
              backgroundColor: theme.isDark ? "rgba(248,184,0,0.08)" : "rgba(0,0,0,0.08)",
            }}
          />
          <div className="space-y-3 p-4">
            <div
              className="h-2.5 w-20 animate-pulse"
              style={{ backgroundColor: theme.isDark ? "rgba(245,239,224,0.16)" : "rgba(0,0,0,0.1)" }}
            />
            <div
              className="h-4 w-4/5 animate-pulse"
              style={{ backgroundColor: theme.isDark ? "rgba(245,239,224,0.16)" : "rgba(0,0,0,0.1)" }}
            />
            <div
              className="h-10 w-full animate-pulse"
              style={{ backgroundColor: theme.isDark ? "rgba(245,239,224,0.16)" : "rgba(0,0,0,0.1)" }}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

function resolveNewestPublishedAt(products: HomeNewArrivalProduct[]): Date | null {
  const timestamps = products
    .map((product) => getValidDate(product.publishedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())

  return timestamps[0] ?? null
}

export function DynamicBadgeProductSlot({
  title,
  subtitle,
  limit,
  badgeFilter,
  defaultBadgeFilter,
  emptyMessage,
  saleEndDateOverride,
}: DynamicBadgeProductSlotProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [products, setProducts] = useState<HomeNewArrivalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const normalizedLimit = useMemo(() => clampLimit(limit), [limit])
  const normalizedBadgeFilter = useMemo(
    () => normalizeBadgeFilter(badgeFilter, defaultBadgeFilter),
    [badgeFilter, defaultBadgeFilter],
  )
  const theme = useMemo(
    () => BADGE_SLOT_THEMES[normalizedBadgeFilter] ?? BADGE_SLOT_THEMES.NEW,
    [normalizedBadgeFilter],
  )
  const sectionTitle = title?.trim() || theme.defaultTitle
  const sectionSubtitle = subtitle?.trim() || theme.defaultSubtitle

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const items = await getProductsByBadge(normalizedBadgeFilter === 'ALL' ? '' : normalizedBadgeFilter, normalizedLimit)
      const mappedProducts = items
        .map((item, index) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : null,
            category: item.category,
            brand: item.brand_name || item.category,
            image: item.images?.[0] || "/images/placeholder.jpg",
            stock: item.stock,
            isSoldOut: item.stock <= 0,
            publishedAt: item.created_at,
            saleEndDate: null,
            viewsCount: item.views || 0,
            soldCount: item.sold_count || 0,
            averageRating: Number(item.rating) || 0,
            limitPerCustomer: 2,
            waitlistCount: 0,
        }))
        .filter((item): item is HomeNewArrivalProduct => item !== null)

      setProducts(mappedProducts)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not load products from Supabase."
      setProducts([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [normalizedBadgeFilter, normalizedLimit])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const uniqueBrandsCount = useMemo(
    () => new Set(products.map((product) => product.brand).filter(Boolean)).size,
    [products],
  )
  const newestPublishedAt = useMemo(
    () => resolveNewestPublishedAt(products),
    [products],
  )
  const hoursSinceDrop = useMemo(() => {
    if (!newestPublishedAt) return 0
    return Math.max(1, Math.floor((now - newestPublishedAt.getTime()) / (1000 * 60 * 60)))
  }, [newestPublishedAt, now])
  const totalViews = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.viewsCount ?? 0), 0),
    [products],
  )
  const totalSold = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.soldCount ?? 0), 0),
    [products],
  )
  const averageRating = useMemo(() => {
    if (products.length === 0) return 0
    const total = products.reduce((sum, product) => sum + Math.max(0, product.averageRating ?? 0), 0)
    return total / products.length
  }, [products])
  const totalUnitsAvailable = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.stock), 0),
    [products],
  )
  const limitPerCustomer = useMemo(() => {
    const found = products.find((product) => (product.limitPerCustomer ?? 0) > 0)
    return found?.limitPerCustomer ?? 2
  }, [products])
  const waitlistTotal = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.waitlistCount ?? 0), 0),
    [products],
  )
  const saleEndDate = useMemo(() => {
    const overrideDate = getValidDate(saleEndDateOverride)
    if (overrideDate) {
      return overrideDate
    }

    const explicitDates = products
      .map((product) => getValidDate(product.saleEndDate))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())

    if (explicitDates[0]) {
      return explicitDates[0]
    }

    if (newestPublishedAt) {
      const derived = new Date(newestPublishedAt.getTime() + 1000 * 60 * 60 * 72)
      if (derived.getTime() > now) {
        return derived
      }
    }

    return new Date(now + 1000 * 60 * 60 * 36)
  }, [newestPublishedAt, now, products, saleEndDateOverride])

  const saleCountdownUnits = useMemo(
    () => getCountdownUnits(saleEndDate, now),
    [saleEndDate, now],
  )

  const sectionStats = useMemo<SectionStat[]>(() => {
    switch (normalizedBadgeFilter) {
      case "NEW":
        return [
          { label: "Products Added", value: String(products.length) },
          { label: "Brands", value: String(uniqueBrandsCount || 1) },
          { label: "Hours Since Drop", value: `${hoursSinceDrop}h` },
        ]
      case "HOT":
        return [
          { label: "Views", value: formatCompactNumber(totalViews) },
          { label: "Sold", value: formatCompactNumber(totalSold) },
          { label: "Avg Rating", value: averageRating > 0 ? formatRating(averageRating) : "4.7" },
        ]
      case "COLLAB":
        return [
          { label: "Units Available", value: String(totalUnitsAvailable) },
          { label: "Limit / Customer", value: String(limitPerCustomer) },
          { label: "Waitlist", value: formatCompactNumber(waitlistTotal) },
        ]
      case "ALL":
      case "DROP":
      default:
        return [
          { label: "Products", value: String(products.length) },
          { label: "Brands", value: String(uniqueBrandsCount || 1) },
          { label: "Units", value: String(totalUnitsAvailable) },
        ]
    }
  }, [
    averageRating,
    hoursSinceDrop,
    limitPerCustomer,
    normalizedBadgeFilter,
    products.length,
    totalSold,
    totalUnitsAvailable,
    totalViews,
    uniqueBrandsCount,
    waitlistTotal,
  ])

  const gridTheme = useMemo<ProductSectionGridTheme>(
    () => ({
      badgeFilter: normalizedBadgeFilter,
      accent: theme.accent,
      text:
        normalizedBadgeFilter === "SALE" ? "#F5EFE0" : theme.text,
      mutedText:
        normalizedBadgeFilter === "SALE"
          ? "rgba(245,239,224,0.58)"
          : theme.mutedText,
      cardBackground:
        normalizedBadgeFilter === "SALE"
          ? "rgba(255,255,255,0.03)"
          : theme.isDark
            ? "#111111"
            : "#FFFFFF",
      cardBorder:
        normalizedBadgeFilter === "SALE"
          ? "rgba(229,34,34,0.15)"
          : theme.isDark
            ? "rgba(248,184,0,0.2)"
            : "rgba(0,0,0,0.12)",
      hoverBorder:
        normalizedBadgeFilter === "SALE" ? "#E52222" : theme.accent,
      buttonBackground:
        normalizedBadgeFilter === "SALE" ? "#E52222" : theme.accent,
      buttonText:
        normalizedBadgeFilter === "SALE"
          ? "#FFFFFF"
          : theme.isDark
            ? "#0A0E1A"
            : "#F5EFE0",
      priceText: theme.accent,
      isDark: normalizedBadgeFilter === "SALE" ? true : theme.isDark,
    }),
    [normalizedBadgeFilter, theme],
  )

  const sectionEyebrow = useMemo(() => {
    switch (normalizedBadgeFilter) {
      case "NEW":
        return "JUST LANDED"
      case "HOT":
        return "TRENDING NOW"
      case "COLLAB":
        return "COLLAB DROP"
      case "DROP":
        return "DROP READY"
      default:
        return theme.eyebrow
    }
  }, [normalizedBadgeFilter, theme.eyebrow])

  const hotRankedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const scoreA =
          (a.viewsCount ?? 0) + (a.soldCount ?? 0) * 30 + (a.averageRating ?? 0) * 120
        const scoreB =
          (b.viewsCount ?? 0) + (b.soldCount ?? 0) * 30 + (b.averageRating ?? 0) * 120
        return scoreB - scoreA
      })
      .slice(0, 3)
  }, [products])

  const hotTickerItems = useMemo(() => {
    const ranked = hotRankedProducts.map((product, index) => `#${index + 1} ${product.name}`)
    return ranked.length > 0
      ? [...ranked, "COMMUNITY PICKS", "MOVING FAST"]
      : ["COMMUNITY PICKS", "MOVING FAST", "TOP RATED"]
  }, [hotRankedProducts])

  if (normalizedBadgeFilter === "SALE") {
    return (
      <section
        ref={sectionRef}
        className="relative overflow-hidden py-0"
        style={{
          backgroundColor: "#0D0000",
          color: "#F5EFE0",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(229,34,34,0.03) 0px, rgba(229,34,34,0.03) 1px, transparent 1px, transparent 4px)",
          }}
        />

        <div className="relative left-1/2 w-screen -translate-x-1/2 border-y border-[#E52222]/60 bg-[#E52222]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-3">
            {["\u26A1 SALE ENDS SOON", "UP TO 40% OFF", "LIMITED STOCK"].map((item, index) => (
              <span
                key={item}
                className="sale-urgency-flash text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]"
                style={{
                  ...bodyFontStyle,
                  animationDelay: `${index * 0.18}s`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
            <div
              className={cn(
                "space-y-6 transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="sale-dot-pulse h-2.5 w-2.5 rounded-full bg-[#E52222]" />
                <span
                  className="text-[8px] uppercase tracking-[0.16em] text-[#F5EFE0]"
                  style={badgeFontStyle}
                >
                  LIMITED TIME
                </span>
              </div>

              <div className="space-y-3">
                <h2
                  className="max-w-[10ch] uppercase leading-[0.84] tracking-[-0.05em] text-[#F5EFE0]"
                  style={headingFontStyle}
                >
                  <span className="block text-[clamp(3rem,8vw,6rem)]">LAST</span>
                  <span className="block text-[clamp(3.2rem,8.6vw,6.5rem)] text-[#E52222]">
                    CALL.
                  </span>
                </h2>

                <p
                  className="max-w-[38rem] text-sm leading-7 md:text-[15px]"
                  style={{ ...bodyFontStyle, color: "rgba(245,239,224,0.78)" }}
                >
                  {sectionSubtitle}
                </p>
              </div>

              <div
                className="border border-[#E52222]/30 bg-[rgba(229,34,34,0.08)] p-5 shadow-[0_0_0_1px_rgba(229,34,34,0.03)]"
              >
                <p
                  className="mb-4 text-[8px] uppercase tracking-[0.16em] text-[#F5EFE0]"
                  style={badgeFontStyle}
                >
                  SALE ENDS IN
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {saleCountdownUnits.map((unit) => (
                    <div
                      key={unit.label}
                      className="border border-[#E52222]/55 bg-[rgba(229,34,34,0.12)] px-4 py-4 text-center"
                    >
                      <p
                        className="text-[clamp(2rem,5vw,3.4rem)] leading-none text-[#F5EFE0]"
                        style={headingFontStyle}
                      >
                        {unit.value}
                      </p>
                      <p
                        className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#F5EFE0]/62"
                        style={bodyFontStyle}
                      >
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={theme.ctaHref}
                className="inline-flex h-12 items-center gap-2 border border-[#E52222] bg-[#E52222] px-6 text-xs uppercase tracking-[0.16em] text-white shadow-[0_0_26px_rgba(229,34,34,0.34)] transition-transform hover:-translate-y-0.5"
                style={bodyFontStyle}
              >
                SHOP SALE NOW
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className={cn(
                "space-y-4 transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{ transitionDelay: "120ms" }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-[12px] uppercase tracking-[0.18em] text-[#F5EFE0]"
                  style={badgeFontStyle}
                >
                  FEATURED ITEMS
                </h3>
                <p
                  className="text-[11px] uppercase tracking-[0.16em] text-[#F5EFE0]/68"
                  style={bodyFontStyle}
                >
                  {loading ? "SYNCING" : `${products.length} ITEMS`}
                </p>
              </div>

              {loading ? <ProductSkeletonCards count={normalizedLimit} theme={theme} /> : null}

              {!loading && error ? (
                <div className="border border-[#E52222]/25 bg-[rgba(255,255,255,0.03)] p-6 text-center">
                  <p
                    className="text-sm uppercase tracking-[0.14em] text-[#E52222]"
                    style={bodyFontStyle}
                  >
                    Failed to load sale items
                  </p>
                  <p
                    className="mt-2 text-xs text-[#F5EFE0]/62"
                    style={bodyFontStyle}
                  >
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void loadProducts()
                    }}
                    className="mt-4 inline-flex border border-[#E52222] bg-[#E52222] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white"
                    style={bodyFontStyle}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!loading && !error ? (
                <HomeNewArrivalsGrid
                  products={products}
                  emptyMessage={emptyMessage || "No sale products found for this section"}
                  theme={gridTheme}
                  isVisible={isVisible}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (normalizedBadgeFilter === "NEW") {
    return (
      <section
        ref={sectionRef}
        className="relative overflow-hidden py-14 md:py-16"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#1A1614",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl space-y-8 px-6 lg:px-12">
          <div
            className={cn(
              "flex flex-col gap-6 transition-all duration-700 lg:flex-row lg:items-end lg:justify-between",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <div className="space-y-4">
              <div
                className="inline-flex border border-[#5C94FC] bg-[#5C94FC] px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-[#F5EFE0]"
                style={badgeFontStyle}
              >
                {sectionEyebrow}
              </div>

              <div className="space-y-3">
                <h2
                  className="max-w-[10ch] text-[clamp(2.7rem,6vw,5.4rem)] uppercase leading-[0.9] tracking-[-0.05em]"
                  style={headingFontStyle}
                >
                  {sectionTitle}
                </h2>
                <p
                  className="max-w-[44rem] text-sm leading-7 md:text-[15px]"
                  style={{ ...bodyFontStyle, color: "rgba(26,22,20,0.66)" }}
                >
                  {sectionSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[25rem]">
              {sectionStats.map((item) => (
                <div
                  key={item.label}
                  className="border bg-[rgba(92,148,252,0.08)] px-4 py-4"
                  style={{ borderColor: "rgba(92,148,252,0.2)" }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.16em] text-[#5C94FC]"
                    style={bodyFontStyle}
                  >
                    {item.label}
                  </p>
                  <p
                    className="mt-2 text-[clamp(1.4rem,3vw,2rem)] tracking-[-0.04em] text-[#1A1614]"
                    style={headingFontStyle}
                  >
                    {loading ? "--" : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transitionDelay: "120ms" }}
          >
            {loading ? <ProductSkeletonCards count={normalizedLimit} theme={theme} /> : null}

            {!loading && error ? (
              <div className="border border-[rgba(92,148,252,0.2)] bg-white p-6 text-center">
                <p className="text-sm uppercase tracking-[0.14em] text-[#5C94FC]" style={bodyFontStyle}>
                  Failed to load new arrivals
                </p>
                <p className="mt-2 text-xs text-[rgba(26,22,20,0.62)]" style={bodyFontStyle}>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void loadProducts()
                  }}
                  className="mt-4 inline-flex border border-[#5C94FC] bg-[#5C94FC] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white"
                  style={bodyFontStyle}
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!loading && !error ? (
              <HomeNewArrivalsGrid
                products={products}
                emptyMessage={emptyMessage || "No new arrivals found for this section"}
                theme={gridTheme}
                isVisible={isVisible}
                layout="four-column"
              />
            ) : null}
          </div>

          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <Link
              href={theme.ctaHref}
              className="inline-flex h-12 items-center gap-2 border border-[#5C94FC] bg-[#5C94FC] px-6 text-xs uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
              style={bodyFontStyle}
            >
              {theme.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (normalizedBadgeFilter === "HOT") {
    return (
      <section
        ref={sectionRef}
        className="relative overflow-hidden py-0"
        style={{
          backgroundColor: "#EDE8DC",
          color: "#1A1614",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-[#C84B0C]/30 bg-[#C84B0C]">
          <div className="animate-marquee flex min-w-max gap-10 whitespace-nowrap px-6 py-3">
            {[...hotTickerItems, ...hotTickerItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]"
                style={bodyFontStyle}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-10">
            <div
              className={cn(
                "space-y-6 transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
            >
              <div className="space-y-4">
                <div
                  className="inline-flex border border-[#C84B0C] bg-[#C84B0C] px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-[#F5EFE0]"
                  style={badgeFontStyle}
                >
                  {sectionEyebrow}
                </div>

                <div className="space-y-3">
                  <h2
                    className="max-w-[10ch] text-[clamp(2.7rem,6vw,5.2rem)] uppercase leading-[0.9] tracking-[-0.05em]"
                    style={headingFontStyle}
                  >
                    {sectionTitle}
                  </h2>
                  <p
                    className="max-w-[34rem] text-sm leading-7 md:text-[15px]"
                    style={{ ...bodyFontStyle, color: "rgba(26,22,20,0.62)" }}
                  >
                    {sectionSubtitle}
                  </p>
                </div>
              </div>

              <div className="border border-[rgba(200,75,12,0.18)] bg-[rgba(255,255,255,0.56)] p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#C84B0C]" style={bodyFontStyle}>
                    Ranked list
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(26,22,20,0.55)]" style={bodyFontStyle}>
                    Top 3
                  </p>
                </div>

                <div className="space-y-3">
                  {hotRankedProducts.length > 0
                    ? hotRankedProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-4 border-t border-[rgba(200,75,12,0.14)] pt-3 first:border-t-0 first:pt-0"
                        >
                          <div className="flex items-start gap-4">
                            <span
                              className="inline-flex min-w-9 justify-center border border-[#C84B0C] bg-[#C84B0C] px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[#F5EFE0]"
                              style={bodyFontStyle}
                            >
                              #{index + 1}
                            </span>
                            <div>
                              <p className="text-lg uppercase tracking-[-0.03em]" style={headingFontStyle}>
                                {product.name}
                              </p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[rgba(26,22,20,0.55)]" style={bodyFontStyle}>
                                {product.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C84B0C]" style={bodyFontStyle}>
                              {formatCompactNumber(product.viewsCount ?? 0)} views
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[rgba(26,22,20,0.55)]" style={bodyFontStyle}>
                              {product.soldCount ?? 0} sold
                            </p>
                          </div>
                        </div>
                      ))
                    : Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`hot-placeholder-${index}`}
                          className="flex items-center justify-between gap-4 border-t border-[rgba(200,75,12,0.14)] pt-3 first:border-t-0 first:pt-0"
                        >
                          <span
                            className="inline-flex min-w-9 justify-center border border-[#C84B0C] bg-[#C84B0C] px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[#F5EFE0]"
                            style={bodyFontStyle}
                          >
                            #{index + 1}
                          </span>
                          <div className="h-4 flex-1 animate-pulse bg-[rgba(200,75,12,0.14)]" />
                        </div>
                      ))}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "space-y-4 transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{ transitionDelay: "120ms" }}
            >
              <div className="grid grid-cols-3 gap-3">
                {sectionStats.map((item) => (
                  <div
                    key={item.label}
                    className="border border-[rgba(200,75,12,0.16)] bg-[rgba(255,255,255,0.56)] px-4 py-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#C84B0C]" style={bodyFontStyle}>
                      {item.label}
                    </p>
                    <p className="mt-2 text-[clamp(1.4rem,3vw,2rem)] tracking-[-0.04em] text-[#1A1614]" style={headingFontStyle}>
                      {loading ? "--" : item.value}
                    </p>
                  </div>
                ))}
              </div>

              {loading ? <ProductSkeletonCards count={normalizedLimit} theme={theme} /> : null}

              {!loading && error ? (
                <div className="border border-[rgba(200,75,12,0.18)] bg-[rgba(255,255,255,0.56)] p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.14em] text-[#C84B0C]" style={bodyFontStyle}>
                    Failed to load trending products
                  </p>
                  <p className="mt-2 text-xs text-[rgba(26,22,20,0.62)]" style={bodyFontStyle}>
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void loadProducts()
                    }}
                    className="mt-4 inline-flex border border-[#C84B0C] bg-[#C84B0C] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white"
                    style={bodyFontStyle}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!loading && !error ? (
                <HomeNewArrivalsGrid
                  products={products}
                  emptyMessage={emptyMessage || "No trending products found for this section"}
                  theme={gridTheme}
                  isVisible={isVisible}
                />
              ) : null}

              <Link
                href={theme.ctaHref}
                className="inline-flex h-12 items-center gap-2 border border-[#C84B0C] bg-[#C84B0C] px-6 text-xs uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
                style={bodyFontStyle}
              >
                {theme.ctaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-14 md:py-16"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
          <div
            className={cn(
              "space-y-5 transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <div className="space-y-3">
              <span
                className="inline-flex border px-3 py-2 text-[11px] uppercase tracking-[0.16em]"
                style={{
                  ...bodyFontStyle,
                  borderColor: theme.accent,
                  backgroundColor: theme.accent,
                  color: theme.isDark ? "#0A0E1A" : "#F5EFE0",
                }}
              >
                {normalizedBadgeFilter === "NEW"
                  ? "✨ JUST LANDED"
                  : normalizedBadgeFilter === "HOT"
                    ? "🔥 TRENDING"
                    : normalizedBadgeFilter === "COLLAB"
                      ? "★ COLLAB DROP"
                      : theme.eyebrow}
              </span>

              <h2
                className="max-w-[12ch] text-[clamp(2.4rem,6.5vw,5.2rem)] uppercase leading-[0.88] tracking-[-0.04em]"
                style={headingFontStyle}
              >
                {sectionTitle}
              </h2>

              {sectionSubtitle ? (
                <p
                  className="max-w-[38rem] text-sm leading-7 md:text-[15px]"
                  style={{ ...bodyFontStyle, color: theme.mutedText }}
                >
                  {sectionSubtitle}
                </p>
              ) : null}
            </div>

            <div
              className="border p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
              style={{
                borderColor: theme.isDark ? "rgba(248,184,0,0.25)" : "rgba(0,0,0,0.12)",
                backgroundColor: theme.infoSurface,
              }}
            >
              <div
                className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]"
                style={{ ...bodyFontStyle, color: theme.accent }}
              >
                <Clock3 className="h-4 w-4" />
                Section intel
              </div>

              <div className="grid grid-cols-3 gap-4">
                {sectionStats.map((item) => (
                  <div key={item.label}>
                    <p
                      className="text-[10px] uppercase tracking-[0.16em]"
                      style={{ ...bodyFontStyle, color: theme.mutedText }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="mt-2 text-[clamp(1.5rem,4vw,2.4rem)] tracking-[-0.04em]"
                      style={{ ...bodyFontStyle, color: theme.accent }}
                    >
                      {loading ? "--" : item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={theme.ctaHref}
              className="inline-flex h-12 items-center gap-2 border px-6 text-xs uppercase tracking-[0.16em] transition-colors"
              style={{
                ...bodyFontStyle,
                borderColor: theme.accent,
                backgroundColor: theme.accent,
                color: theme.isDark ? "#0A0E1A" : "#F5EFE0",
              }}
            >
              {theme.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={cn(
              "space-y-4 transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transitionDelay: "120ms" }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                className="text-lg uppercase tracking-[0.12em]"
                style={{ ...bodyFontStyle, color: theme.accent }}
              >
                Featured Items
              </h3>
              <p
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{ ...bodyFontStyle, color: theme.mutedText }}
              >
                {loading ? "Syncing inventory" : `${products.length} loaded`}
              </p>
            </div>

            {loading ? <ProductSkeletonCards count={normalizedLimit} theme={theme} /> : null}

            {!loading && error ? (
              <div
                className="border p-6 text-center"
                style={{
                  borderColor: theme.isDark ? "rgba(248,184,0,0.25)" : "rgba(0,0,0,0.12)",
                  backgroundColor: theme.isDark ? "#111111" : "rgba(255,255,255,0.86)",
                }}
              >
                <p
                  className="text-sm uppercase tracking-[0.14em]"
                  style={{ ...bodyFontStyle, color: theme.accent }}
                >
                  Failed to load products
                </p>
                <p
                  className="mt-2 text-xs"
                  style={{ ...bodyFontStyle, color: theme.mutedText }}
                >
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void loadProducts()
                  }}
                  className="mt-4 inline-flex border px-4 py-2 text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    ...bodyFontStyle,
                    borderColor: theme.accent,
                    backgroundColor: theme.accent,
                    color: theme.isDark ? "#0A0E1A" : "#F5EFE0",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!loading && !error ? (
              <HomeNewArrivalsGrid
                products={products}
                emptyMessage={emptyMessage || "No products found for this section"}
                theme={gridTheme}
                isVisible={isVisible}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
