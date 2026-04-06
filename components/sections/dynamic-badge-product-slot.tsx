"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Clock3 } from "lucide-react"
import {
  HomeNewArrivalsGrid,
  type HomeNewArrivalProduct,
  type ProductSectionGridTheme,
} from "@/components/home-new-arrivals-grid"
import { getProducts, getProductsByBadge } from "@/lib/api"
import { cn } from "@/lib/utils"

export type ProductBadge = "NEW" | "DROP" | "SALE" | "HOT" | "COLLAB"
export type ProductBadgeFilter = ProductBadge | "ALL"

const MIN_PRODUCTS = 1
const MAX_PRODUCTS = 12
const CATALOG_VISIBLE_COUNT = 6
const BADGE_FILTER_VALUES: ProductBadgeFilter[] = ["ALL", "NEW", "DROP", "SALE", "HOT", "COLLAB"]

interface DynamicBadgeProductSlotProps {
  title?: string | null
  subtitle?: string | null
  limit?: number | null
  badgeFilter?: ProductBadgeFilter | null
  defaultBadgeFilter: ProductBadgeFilter
  emptyMessage?: string
  saleEndDateOverride?: string | null
}

interface BadgeSlotTheme {
  variant: "compact" | "sale" | "editorial"
  eyebrow: string
  defaultTitle: string
  defaultSubtitle: string
  ctaLabel: string
  ctaHref: string
  background: string
  panelBackground: string
  panelBorder: string
  gridLine: string
  accent: string
  text: string
  mutedText: string
  pillBackground: string
  pillText: string
  buttonBackground: string
  buttonText: string
  featureHeadline?: string
  railLabel: string
  isDark: boolean
}

interface SectionStat {
  label: string
  value: string
}

interface SupabaseBadgeProduct {
  id: string
  slug: string
  name: string
  price: number | string
  original_price?: number | string | null
  images?: string[] | null
  category?: string | null
  brand_name?: string | null
  stock?: number | null
  created_at?: string | null
  views?: number | null
  sold_count?: number | null
  rating?: number | string | null
  limit_per_customer?: number | null
  waitlist_count?: number | null
}

const textFontStyle = {
  fontFamily: "var(--font-ui-sans)",
}

const headingFontStyle = {
  ...textFontStyle,
  fontWeight: 700 as const,
}

const BADGE_SLOT_THEMES: Record<ProductBadgeFilter, BadgeSlotTheme> = {
  ALL: {
    variant: "compact",
    eyebrow: "CURATED PICKS",
    defaultTitle: "SHOP ALL PRODUCTS",
    defaultSubtitle: "Freshly synced products across the entire GOOFY catalog.",
    ctaLabel: "SHOP ALL",
    ctaHref: "/products",
    background: "#F5EFE0",
    panelBackground: "rgba(255,255,255,0.92)",
    panelBorder: "rgba(26,22,20,0.12)",
    gridLine: "rgba(26,22,20,0.06)",
    accent: "#1A1614",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.58)",
    pillBackground: "#FFFFFF",
    pillText: "#1A1614",
    buttonBackground: "#1A1614",
    buttonText: "#F5EFE0",
    railLabel: "Featured picks",
    isDark: false,
  },
  NEW: {
    variant: "compact",
    eyebrow: "JUST LANDED",
    defaultTitle: "NEW PRODUCTS",
    defaultSubtitle: "",
    ctaLabel: "SHOP NEW",
    ctaHref: "/products?badge=new",
    background: "#F5EFE0",
    panelBackground: "rgba(255,255,255,0.92)",
    panelBorder: "rgba(26,22,20,0.12)",
    gridLine: "rgba(26,22,20,0.06)",
    accent: "#6B8CFF",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.58)",
    pillBackground: "#FFFFFF",
    pillText: "#6B8CFF",
    buttonBackground: "#6B8CFF",
    buttonText: "#F5EFE0",
    railLabel: "Fresh picks",
    isDark: false,
  },
  DROP: {
    variant: "editorial",
    eyebrow: "LIVE NOW",
    defaultTitle: "DROP ITEMS",
    defaultSubtitle: "Pieces carrying drop energy and limited release timing.",
    ctaLabel: "VIEW DROP",
    ctaHref: "/products?badge=drop",
    background: "#07111F",
    panelBackground: "rgba(12,22,37,0.86)",
    panelBorder: "rgba(225,183,56,0.14)",
    gridLine: "rgba(225,183,56,0.055)",
    accent: "#F1B926",
    text: "#F5EFE0",
    mutedText: "rgba(245,239,224,0.6)",
    pillBackground: "rgba(255,255,255,0.05)",
    pillText: "#F1B926",
    buttonBackground: "#F1B926",
    buttonText: "#07111F",
    featureHeadline: "LIMITED EDITION SET",
    railLabel: "View drop",
    isDark: true,
  },
  SALE: {
    variant: "sale",
    eyebrow: "PRICE CUT",
    defaultTitle: "PRODUCTS ON SALE",
    defaultSubtitle: "",
    ctaLabel: "SHOP SALE",
    ctaHref: "/products?badge=sale",
    background: "#F5EFE0",
    panelBackground: "rgba(255,255,255,0.92)",
    panelBorder: "rgba(26,22,20,0.12)",
    gridLine: "rgba(26,22,20,0.06)",
    accent: "#E70009",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.58)",
    pillBackground: "#FFF0EA",
    pillText: "#E70009",
    buttonBackground: "#E70009",
    buttonText: "#FFF4EE",
    railLabel: "Markdown picks",
    isDark: false,
  },
  HOT: {
    variant: "compact",
    eyebrow: "TREND WATCH",
    defaultTitle: "POPULAR PRODUCTS",
    defaultSubtitle: "",
    ctaLabel: "SHOP HOT",
    ctaHref: "/products?badge=hot",
    background: "#F5EFE0",
    panelBackground: "rgba(255,255,255,0.92)",
    panelBorder: "rgba(26,22,20,0.12)",
    gridLine: "rgba(26,22,20,0.06)",
    accent: "#FBD000",
    text: "#1A1614",
    mutedText: "rgba(26,22,20,0.58)",
    pillBackground: "#FFF7D6",
    pillText: "#111111",
    buttonBackground: "#FBD000",
    buttonText: "#111111",
    railLabel: "Trending now",
    isDark: false,
  },
  COLLAB: {
    variant: "editorial",
    eyebrow: "EXCLUSIVE",
    defaultTitle: "COLLAB",
    defaultSubtitle: "Limited partnership stock shaped into a sharper dark editorial layout.",
    ctaLabel: "VIEW COLLAB",
    ctaHref: "/products?badge=collab",
    background: "#07111F",
    panelBackground: "rgba(12,22,37,0.86)",
    panelBorder: "rgba(255,255,255,0.1)",
    gridLine: "rgba(225,183,56,0.055)",
    accent: "#D1A028",
    text: "#F5EFE0",
    mutedText: "rgba(245,239,224,0.6)",
    pillBackground: "rgba(255,255,255,0.05)",
    pillText: "#D1A028",
    buttonBackground: "#D1A028",
    buttonText: "#07111F",
    featureHeadline: "ONE RUN. NEVER AGAIN.",
    railLabel: "View collab",
    isDark: true,
  },
}

function clampLimit(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 4
  const normalized = Math.floor(Number(value))
  return Math.max(MIN_PRODUCTS, Math.min(MAX_PRODUCTS, normalized))
}

function normalizeBadgeFilter(value: ProductBadgeFilter | null | undefined, fallback: ProductBadgeFilter): ProductBadgeFilter {
  if (!value) return fallback
  const normalized = value.toUpperCase() as ProductBadgeFilter
  return BADGE_FILTER_VALUES.includes(normalized) ? normalized : fallback
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function getValidDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Math.max(0, value))
}

function getDiscountPercent(product: HomeNewArrivalProduct): number | null {
  if (typeof product.originalPrice !== "number" || product.originalPrice <= 0 || product.originalPrice <= product.price) {
    return null
  }
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}

function mapProduct(item: SupabaseBadgeProduct, index: number): HomeNewArrivalProduct {
  const stock = Math.max(0, toNumber(item.stock, 0))

  return {
    id: String(item.id ?? `${item.slug}-${index}`),
    slug: item.slug,
    name: item.name,
    price: toNumber(item.price, 0),
    originalPrice: item.original_price == null ? null : toNumber(item.original_price, 0),
    category: item.category?.trim() || "Product",
    brand: item.brand_name?.trim() || item.category?.trim() || "GOOFY",
    image: item.images?.[0] || "",
    stock,
    isSoldOut: stock <= 0,
    publishedAt: item.created_at ?? null,
    saleEndDate: null,
    viewsCount: toNumber(item.views, 0),
    soldCount: toNumber(item.sold_count, 0),
    averageRating: toNumber(item.rating, 4.8),
    limitPerCustomer: Math.max(1, toNumber(item.limit_per_customer, 1)),
    waitlistCount: Math.max(0, toNumber(item.waitlist_count, 0)),
  }
}

function getPublishedTimestamp(product: HomeNewArrivalProduct): number {
  return getValidDate(product.publishedAt)?.getTime() ?? 0
}

function getSaleStrength(product: HomeNewArrivalProduct): number {
  if (typeof product.originalPrice !== "number" || product.originalPrice <= product.price) {
    return 0
  }

  return product.originalPrice - product.price
}

function rankHotProduct(product: HomeNewArrivalProduct): number {
  return (
    (product.soldCount ?? 0) * 1000 +
    (product.viewsCount ?? 0) * 10 +
    (product.averageRating ?? 0) * 100 +
    getPublishedTimestamp(product) / 100000000
  )
}

function deriveProductsForSection(
  products: HomeNewArrivalProduct[],
  badgeFilter: ProductBadgeFilter,
): HomeNewArrivalProduct[] {
  if (badgeFilter === "SALE") {
    const discountedProducts = [...products]
      .filter((product) => getSaleStrength(product) > 0)
      .sort((a, b) => getSaleStrength(b) - getSaleStrength(a) || getPublishedTimestamp(b) - getPublishedTimestamp(a))

    if (discountedProducts.length > 0) {
      return discountedProducts
    }

    return [...products].sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a))
  }

  if (badgeFilter === "HOT") {
    return [...products].sort((a, b) => rankHotProduct(b) - rankHotProduct(a))
  }

  if (badgeFilter === "NEW") {
    return [...products].sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a))
  }

  return products
}

function mergeProductSets(
  primary: HomeNewArrivalProduct[],
  fallback: HomeNewArrivalProduct[],
  limit: number,
): HomeNewArrivalProduct[] {
  const seen = new Set<string>()
  const merged: HomeNewArrivalProduct[] = []

  for (const product of [...primary, ...fallback]) {
    if (seen.has(product.id)) continue
    seen.add(product.id)
    merged.push(product)
    if (merged.length >= limit) break
  }

  return merged
}

function getGridTheme(theme: BadgeSlotTheme, badgeFilter: ProductBadgeFilter): ProductSectionGridTheme {
  return {
    badgeFilter,
    accent: theme.accent,
    text: theme.text,
    mutedText: theme.mutedText,
    cardBackground: theme.panelBackground,
    cardBorder: theme.panelBorder,
    hoverBorder: theme.accent,
    buttonBackground: theme.buttonBackground,
    buttonText: theme.buttonText,
    priceText: theme.accent,
    stockTrack: theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(26,22,20,0.08)",
    stockFill: theme.accent,
    surface: theme.isDark ? "rgba(255,255,255,0.03)" : "#F9F6EF",
    isDark: theme.isDark,
  }
}

function formatCountdownLabel(targetDate: Date | null, now: number): string {
  if (!targetDate) return "00:00:00 remaining"
  const diff = Math.max(targetDate.getTime() - now, 0)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  if (days > 0) {
    return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} remaining`
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} remaining`
}

function ProductSkeletonGrid({ count, dark }: { count: number; dark: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`product-skeleton-${index}`}
          className="overflow-hidden rounded-[26px] border"
          style={{
            borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,20,0.12)",
            backgroundColor: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
          }}
        >
          <div
            className="aspect-[4/4.8] animate-pulse"
            style={{
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(26,22,20,0.08)",
            }}
          />
          <div className="space-y-3 p-4">
            <div
              className="h-3 w-20 animate-pulse rounded-full"
              style={{
                backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,20,0.08)",
              }}
            />
            <div
              className="h-5 w-3/4 animate-pulse rounded-full"
              style={{
                backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,20,0.08)",
              }}
            />
            <div
              className="h-10 animate-pulse rounded-[18px]"
              style={{
                backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,20,0.08)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function EditorialRailSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`editorial-rail-skeleton-${index}`}
          className="flex items-stretch gap-4 rounded-[20px] border p-3"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <div className="w-20 animate-pulse rounded-[14px] bg-white/5" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
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
  const isCatalogBadge =
    normalizedBadgeFilter === "NEW" ||
    normalizedBadgeFilter === "SALE" ||
    normalizedBadgeFilter === "HOT"
  const effectiveLimit = normalizedLimit
  const theme = useMemo(
    () => BADGE_SLOT_THEMES[normalizedBadgeFilter] ?? BADGE_SLOT_THEMES.NEW,
    [normalizedBadgeFilter],
  )
  const sectionTitle = title?.trim() || theme.defaultTitle
  const sectionSubtitle = subtitle?.trim() || theme.defaultSubtitle
  const gridTheme = useMemo(
    () => getGridTheme(theme, normalizedBadgeFilter),
    [normalizedBadgeFilter, theme],
  )

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
      if (isCatalogBadge) {
        const [allProductsResponse, badgeResponse] = await Promise.all([
          getProducts(),
          getProductsByBadge(normalizedBadgeFilter, null),
        ])

        const badgeMapped = deriveProductsForSection(
          (Array.isArray(badgeResponse) ? badgeResponse : []).map((item, index) =>
            mapProduct(item as SupabaseBadgeProduct, index),
          ),
          normalizedBadgeFilter,
        )
        const derivedFallback = deriveProductsForSection(
          (Array.isArray(allProductsResponse) ? allProductsResponse : []).map((item, index) =>
            mapProduct(item as SupabaseBadgeProduct, index),
          ),
          normalizedBadgeFilter,
        )

        setProducts(
          mergeProductSets(
            badgeMapped,
            derivedFallback,
            badgeMapped.length + derivedFallback.length,
          ),
        )

        return
      }

      const response =
        normalizedBadgeFilter === "ALL"
          ? await getProducts()
          : await getProductsByBadge(normalizedBadgeFilter, effectiveLimit)
      const mapped = (Array.isArray(response) ? response : [])
        .slice(0, effectiveLimit)
        .map((item, index) => mapProduct(item as SupabaseBadgeProduct, index))

      setProducts(mapped)
    } catch (err) {
      setProducts([])
      setError(
        err instanceof Error
          ? err.message
          : "Could not load products from Supabase.",
      )
    } finally {
      setLoading(false)
    }
  }, [effectiveLimit, isCatalogBadge, normalizedBadgeFilter])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const uniqueBrandsCount = useMemo(
    () => new Set(products.map((product) => product.brand).filter(Boolean)).size,
    [products],
  )
  const totalViews = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.viewsCount ?? 0), 0),
    [products],
  )
  const totalSold = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.soldCount ?? 0), 0),
    [products],
  )
  const totalUnitsAvailable = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.stock), 0),
    [products],
  )
  const lowStockCount = useMemo(
    () => products.filter((product) => !product.isSoldOut && product.stock <= 8).length,
    [products],
  )
  const averageRating = useMemo(() => {
    if (products.length === 0) return 0
    return products.reduce((sum, product) => sum + Math.max(0, product.averageRating ?? 0), 0) / products.length
  }, [products])
  const newestPublishedAt = useMemo(() => {
    const timestamps = products
      .map((product) => getValidDate(product.publishedAt))
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())

    return timestamps[0] ?? null
  }, [products])
  const hoursSinceNewest = useMemo(() => {
    if (!newestPublishedAt) return 0
    return Math.max(1, Math.floor((now - newestPublishedAt.getTime()) / (1000 * 60 * 60)))
  }, [newestPublishedAt, now])
  const maxDiscount = useMemo(() => {
    const values = products
      .map((product) => getDiscountPercent(product))
      .filter((value): value is number => value !== null)

    return values.length > 0 ? Math.max(...values) : 0
  }, [products])
  const limitPerCustomer = useMemo(() => {
    const found = products.find((product) => (product.limitPerCustomer ?? 0) > 0)
    return found?.limitPerCustomer ?? 1
  }, [products])
  const saleEndDate = useMemo(() => getValidDate(saleEndDateOverride), [saleEndDateOverride])
  const saleCountdown = useMemo(() => formatCountdownLabel(saleEndDate, now), [saleEndDate, now])

  const sectionStats = useMemo<SectionStat[]>(() => {
    switch (normalizedBadgeFilter) {
      case "HOT":
        return [
          { label: "Watching", value: formatCompactNumber(totalViews) },
          { label: "Moved", value: formatCompactNumber(totalSold) },
          { label: "Rated", value: averageRating > 0 ? averageRating.toFixed(1) : "--" },
        ]
      case "SALE":
        return [
          { label: "Max off", value: maxDiscount > 0 ? `${maxDiscount}%` : "--" },
          { label: "Low stock", value: String(lowStockCount).padStart(2, "0") },
          { label: "Live cards", value: String(products.length).padStart(2, "0") },
        ]
      case "COLLAB":
      case "DROP":
        return [
          { label: "Pieces", value: String(products.length).padStart(2, "0") },
          { label: "Remaining", value: formatCompactNumber(totalUnitsAvailable) },
          { label: "Limit", value: `${limitPerCustomer}/pp` },
        ]
      case "NEW":
      default:
        return [
          { label: "Fresh window", value: newestPublishedAt ? `${hoursSinceNewest}h` : "--" },
          { label: "Brands", value: String(uniqueBrandsCount).padStart(2, "0") },
          { label: "In stock", value: formatCompactNumber(totalUnitsAvailable) },
        ]
    }
  }, [
    averageRating,
    hoursSinceNewest,
    limitPerCustomer,
    lowStockCount,
    maxDiscount,
    newestPublishedAt,
    normalizedBadgeFilter,
    products.length,
    totalSold,
    totalUnitsAvailable,
    totalViews,
    uniqueBrandsCount,
  ])

  const featureProduct = products[0] ?? null
  const railProducts = useMemo(() => {
    if (products.length <= 1) return products.slice(0, 3)
    return products.slice(1, 4)
  }, [products])

  const catalogSection = (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F7F7F5] py-14 text-[#111111] md:py-16"
    >
      <div className="relative mx-auto w-full max-w-[1700px] px-5 lg:px-8 xl:px-10">
        <div
          className={cn(
            "mb-5 text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <h2
            className="text-[clamp(2rem,3.4vw,2.95rem)] uppercase leading-[0.9] tracking-[-0.04em] text-[#111111]"
            style={headingFontStyle}
          >
            {sectionTitle.toUpperCase()}
          </h2>
        </div>

        <div
          className={cn(
            "transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: "120ms" }}
        >
          {loading ? <ProductSkeletonGrid count={CATALOG_VISIBLE_COUNT} dark={false} /> : null}

          {!loading && error ? (
            <div className="bg-white px-6 py-8 text-center">
              <p className="text-base uppercase tracking-[0.14em] text-[#111111]" style={textFontStyle}>
                Failed to load products
              </p>
              <p className="mt-2 text-sm text-[#1A1614]/58" style={textFontStyle}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  void loadProducts()
                }}
                className="mt-5 inline-flex rounded-full border border-[#111111] bg-[#111111] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white"
                style={textFontStyle}
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
              layout="four-column"
              variant="catalog"
            />
          ) : null}
        </div>
      </div>
    </section>
  )

  const compactSection = (
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
        <div
          className={cn(
            "mb-8 flex flex-col gap-6 border-b pb-8 transition-all duration-700 lg:flex-row lg:items-end lg:justify-between",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ borderColor: theme.panelBorder }}
        >
          <div className="space-y-4">
            <span
              className="inline-flex rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
              style={{
                ...textFontStyle,
                borderColor: theme.accent,
                backgroundColor: theme.pillBackground,
                color: theme.pillText,
              }}
            >
              {theme.eyebrow}
            </span>

            <div className="space-y-3">
              <h2
                className="max-w-[10ch] text-[clamp(3rem,6vw,5.1rem)] uppercase leading-[0.88] tracking-[-0.04em]"
                style={headingFontStyle}
              >
                {sectionTitle}
              </h2>

              <p
                className="max-w-[42rem] text-[1rem] leading-6 md:text-[1.05rem]"
                style={{ ...textFontStyle, color: theme.mutedText }}
              >
                {sectionSubtitle}
              </p>

              {normalizedBadgeFilter === "SALE" && saleEndDate ? (
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                  style={{
                    ...textFontStyle,
                    borderColor: theme.accent,
                    backgroundColor: "#FFF4EE",
                    color: theme.accent,
                  }}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {saleCountdown}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="grid grid-cols-3 gap-3 md:min-w-[24rem]">
              {sectionStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border px-4 py-4"
                  style={{
                    borderColor: theme.panelBorder,
                    backgroundColor: theme.panelBackground,
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.mutedText }}>
                    {item.label}
                  </p>
                  <p
                    className="mt-2 text-[1.7rem] uppercase tracking-[-0.04em]"
                    style={{ ...headingFontStyle, color: theme.accent }}
                  >
                    {loading ? "--" : item.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={theme.ctaHref}
              className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
              style={{
                ...textFontStyle,
                borderColor: theme.accent,
                backgroundColor: theme.buttonBackground,
                color: theme.buttonText,
              }}
            >
              {theme.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ transitionDelay: "120ms" }}
        >
          {loading ? <ProductSkeletonGrid count={normalizedLimit} dark={false} /> : null}

          {!loading && error ? (
            <div
              className="rounded-[28px] border px-6 py-8 text-center"
              style={{
                borderColor: theme.panelBorder,
                backgroundColor: theme.panelBackground,
              }}
            >
              <p className="text-base uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.accent }}>
                Failed to load products
              </p>
              <p className="mt-2 text-sm" style={{ ...textFontStyle, color: theme.mutedText }}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  void loadProducts()
                }}
                className="mt-5 inline-flex rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.16em]"
                style={{
                  ...textFontStyle,
                  borderColor: theme.accent,
                  backgroundColor: theme.buttonBackground,
                  color: theme.buttonText,
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
              layout="four-column"
              variant={theme.variant === "sale" ? "sale" : "compact"}
            />
          ) : null}
        </div>
      </div>
    </section>
  )

  const editorialSection = (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-14 text-[#F5EFE0] md:py-16"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${theme.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,160,40,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(91,121,255,0.08),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div
          className={cn(
            "mb-8 flex flex-col gap-5 transition-all duration-700 lg:flex-row lg:items-end lg:justify-between",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="space-y-4">
            <span
              className="inline-flex rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
              style={{
                ...textFontStyle,
                borderColor: theme.panelBorder,
                backgroundColor: theme.pillBackground,
                color: theme.pillText,
              }}
            >
              {theme.eyebrow}
            </span>

            <h2
              className="max-w-[8ch] text-[clamp(3.4rem,7vw,5.8rem)] uppercase leading-[0.86] tracking-[-0.05em]"
              style={headingFontStyle}
            >
              {sectionTitle}
            </h2>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="grid grid-cols-3 gap-3 md:min-w-[24rem]">
              {sectionStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border px-4 py-4"
                  style={{
                    borderColor: theme.panelBorder,
                    backgroundColor: "rgba(12,22,37,0.68)",
                  }}
                >
                  <p className="text-[11px] uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.mutedText }}>
                    {item.label}
                  </p>
                  <p
                    className="mt-2 text-[1.6rem] uppercase tracking-[-0.04em]"
                    style={{ ...headingFontStyle, color: theme.accent }}
                  >
                    {loading ? "--" : item.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={theme.ctaHref}
              className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
              style={{
                ...textFontStyle,
                borderColor: theme.panelBorder,
                color: theme.mutedText,
              }}
            >
              {theme.railLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transitionDelay: "120ms" }}
          >
            {loading ? (
              <div
                className="relative min-h-[520px] overflow-hidden rounded-[30px] border bg-white/5"
                style={{ borderColor: theme.panelBorder }}
              />
            ) : null}

            {!loading && error ? (
              <div
                className="rounded-[30px] border px-6 py-8 text-center"
                style={{
                  borderColor: theme.panelBorder,
                  backgroundColor: theme.panelBackground,
                }}
              >
                <p className="text-base uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.accent }}>
                  Failed to load products
                </p>
                <p className="mt-2 text-sm" style={{ ...textFontStyle, color: theme.mutedText }}>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void loadProducts()
                  }}
                  className="mt-5 inline-flex rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.16em]"
                  style={{
                    ...textFontStyle,
                    borderColor: theme.accent,
                    backgroundColor: theme.buttonBackground,
                    color: theme.buttonText,
                  }}
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!loading && !error && featureProduct ? (
              <article
                className="relative min-h-[520px] overflow-hidden rounded-[30px] border"
                style={{
                  borderColor: theme.panelBorder,
                  backgroundColor: theme.panelBackground,
                }}
              >
                {featureProduct.image ? (
                  <Image
                    src={featureProduct.image}
                    alt={featureProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover opacity-38"
                  />
                ) : null}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08)_0%,rgba(7,17,31,0.42)_38%,rgba(7,17,31,0.96)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(209,160,40,0.08),transparent_42%)]" />

                <p
                  className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-[clamp(4.4rem,11vw,8.5rem)] uppercase leading-none tracking-[-0.06em] text-white/5"
                  style={headingFontStyle}
                >
                  {sectionTitle}
                </p>

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                      style={{
                        ...textFontStyle,
                        borderColor: theme.panelBorder,
                        backgroundColor: "rgba(7,17,31,0.72)",
                        color: theme.accent,
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {theme.eyebrow}
                    </div>

                    {normalizedBadgeFilter === "COLLAB" ? (
                      <div
                        className="inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                        style={{
                          ...textFontStyle,
                          borderColor: theme.panelBorder,
                          backgroundColor: "rgba(7,17,31,0.72)",
                          color: theme.mutedText,
                        }}
                      >
                        {featureProduct.stock > 0 ? `${featureProduct.stock} pieces remaining` : "edition complete"}
                      </div>
                    ) : null}
                  </div>

                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/68" style={textFontStyle}>
                    {featureProduct.brand} x GOOFY WORLD
                  </p>

                  <h3
                    className="mt-3 max-w-[8ch] text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-[-0.05em]"
                    style={headingFontStyle}
                  >
                    {theme.featureHeadline ?? featureProduct.name}
                  </h3>

                  <p
                    className="mt-4 max-w-[32rem] text-[1rem] leading-6"
                    style={{ ...textFontStyle, color: theme.mutedText }}
                  >
                    {sectionSubtitle}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                      style={{
                        ...textFontStyle,
                        borderColor: theme.panelBorder,
                        backgroundColor: "rgba(7,17,31,0.72)",
                        color: theme.accent,
                      }}
                    >
                      {featureProduct.name}
                    </div>

                    <Link
                      href={`/product/${featureProduct.slug}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
                      style={{
                        ...textFontStyle,
                        borderColor: theme.accent,
                        backgroundColor: theme.buttonBackground,
                        color: theme.buttonText,
                      }}
                    >
                      Shop collection
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <div
            className={cn(
              "space-y-4 transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]/58" style={textFontStyle}>
                {theme.railLabel}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]/38" style={textFontStyle}>
                {loading ? "Syncing rail" : `${Math.max(railProducts.length, featureProduct ? 1 : 0)} items`}
              </p>
            </div>

            {loading ? <EditorialRailSkeleton /> : null}

            {!loading && !error && !featureProduct ? (
              <div
                className="rounded-[24px] border border-dashed px-6 py-8 text-center"
                style={{
                  borderColor: theme.panelBorder,
                  backgroundColor: theme.panelBackground,
                }}
              >
                <p className="text-sm uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.mutedText }}>
                  {emptyMessage || "No products found for this section"}
                </p>
              </div>
            ) : null}

            {!loading && !error
              ? (railProducts.length > 0 ? railProducts : featureProduct ? [featureProduct] : []).map((product, index) => (
                  <Link
                    key={`${product.id}-${index}`}
                    href={`/product/${product.slug}`}
                    className="group flex items-stretch gap-4 rounded-[22px] border p-3 transition-transform duration-300 hover:-translate-y-0.5"
                    style={{
                      borderColor: theme.panelBorder,
                      backgroundColor: theme.panelBackground,
                    }}
                  >
                    <div
                      className="flex w-20 shrink-0 items-center justify-center rounded-[16px] border px-3 text-[11px] uppercase tracking-[0.14em]"
                      style={{
                        ...textFontStyle,
                        borderColor: theme.panelBorder,
                        backgroundColor: "rgba(255,255,255,0.03)",
                        color: theme.accent,
                      }}
                    >
                      {product.category}
                    </div>

                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p
                          className="text-[1.5rem] uppercase leading-[0.92]"
                          style={{ ...headingFontStyle, color: theme.text }}
                        >
                          {product.name}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em]" style={{ ...textFontStyle, color: theme.accent }}>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(product.price)}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em]" style={{ ...textFontStyle, color: theme.mutedText }}>
                          {normalizedBadgeFilter === "COLLAB"
                            ? `#${index + 12} / ${Math.max(product.stock, 1)} remaining`
                            : `limit ${product.limitPerCustomer ?? 1} per person`}
                        </p>
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#F5EFE0]/45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </div>
    </section>
  )

  return normalizedBadgeFilter === "NEW" ||
    normalizedBadgeFilter === "SALE" ||
    normalizedBadgeFilter === "HOT"
    ? catalogSection
    : theme.variant === "editorial"
      ? editorialSection
      : compactSection
}
