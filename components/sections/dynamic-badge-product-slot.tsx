"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  HomeNewArrivalsGrid,
  type HomeNewArrivalProduct,
} from "@/components/home-new-arrivals-grid"
import type { ProductBadgeFilter } from "@/lib/strapi-types"

const DEFAULT_STRAPI_URL = "http://localhost:1337"
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
}

interface StrapiProductResponse {
  data?: unknown[]
}

interface BadgeSlotTheme {
  eyebrow: string
  chip: string
  ctaLabel: string
  ctaHref: string
  background: string
  accent: string
  text: string
  mutedText: string
  infoOnRight: boolean
}

const BADGE_SLOT_THEMES: Record<ProductBadgeFilter, BadgeSlotTheme> = {
  ALL: {
    eyebrow: "Section",
    chip: "ALL PRODUCTS",
    ctaLabel: "SHOP ALL",
    ctaHref: "/products",
    background: "#F1EEE8",
    accent: "#0F172A",
    text: "#0F172A",
    mutedText: "#64748B",
    infoOnRight: false,
  },
  NEW: {
    eyebrow: "Section 1",
    chip: "NEW ARRIVALS",
    ctaLabel: "SHOP NEW ARRIVALS",
    ctaHref: "/products?filter=new",
    background: "#FFFFFF",
    accent: "#5C94FC",
    text: "#0F172A",
    mutedText: "#64748B",
    infoOnRight: true,
  },
  DROP: {
    eyebrow: "Section",
    chip: "DROP",
    ctaLabel: "SHOP DROP",
    ctaHref: "/products?filter=drop",
    background: "#F1EEE8",
    accent: "#049CD8",
    text: "#0F172A",
    mutedText: "#64748B",
    infoOnRight: false,
  },
  SALE: {
    eyebrow: "Section 2",
    chip: "SALE",
    ctaLabel: "SHOP SALE NOW",
    ctaHref: "/products?filter=sale",
    background: "#F5EFE0",
    accent: "#E52222",
    text: "#0F172A",
    mutedText: "#64748B",
    infoOnRight: false,
  },
  HOT: {
    eyebrow: "Section 3",
    chip: "HOT",
    ctaLabel: "SHOP TRENDING",
    ctaHref: "/products?filter=hot",
    background: "#EDE8DC",
    accent: "#C84B0C",
    text: "#0F172A",
    mutedText: "#64748B",
    infoOnRight: true,
  },
  COLLAB: {
    eyebrow: "Section 4",
    chip: "COLLAB",
    ctaLabel: "SHOP COLLAB",
    ctaHref: "/products?filter=collab",
    background: "#0A0E1A",
    accent: "#F8B800",
    text: "#F8EBCA",
    mutedText: "#DBCFAE",
    infoOnRight: false,
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

function resolveStrapiAssetUrl(url: string): string {
  if (!url) return "/images/placeholder.jpg"
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  const baseUrl =
    (process.env.NEXT_PUBLIC_STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/$/, "")

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`
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

  return resolveStrapiAssetUrl(url)
}

function mapStrapiProduct(
  rawProduct: unknown,
  index: number,
): HomeNewArrivalProduct | null {
  const product = toRecord(rawProduct)
  if (!product) return null

  const slug = toStringValue(product.slug)
  const name = toStringValue(product.name)
  if (!slug || !name) return null

  const category =
    toStringValue(toSingleRelation(product.category)?.title) || "Product"
  const id =
    toStringValue(product.documentId) ||
    toStringValue(product.id) ||
    `${slug}-${index}`
  const stock = toNumberValue(product.stock_quantity, 0)
  const isSoldOut = Boolean(product.is_sold_out) || stock <= 0

  return {
    id,
    slug,
    name,
    price: toNumberValue(product.price, 0),
    category,
    image: resolveProductImage(product),
    stock,
    isSoldOut,
  }
}

function buildProductsUrl(badgeFilter: ProductBadgeFilter, limit: number): string {
  const baseUrl =
    (process.env.NEXT_PUBLIC_STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/$/, "")
  const params = new URLSearchParams()

  params.set("sort", "publishedAt:desc")
  params.set("pagination[limit]", String(limit))
  params.set("populate", "*")

  if (badgeFilter !== "ALL") {
    params.set("filters[badge][$eq]", badgeFilter)
  }

  return `${baseUrl}/api/products?${params.toString()}`
}

function ProductSkeletonCards({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`home-slot-skeleton-${index}`}
          className="overflow-hidden border-2 border-black bg-[#F3EFE5]"
        >
          <div className="aspect-square animate-pulse border-b-2 border-black bg-black/10" />
          <div className="space-y-3 p-4">
            <div className="h-2.5 w-20 animate-pulse bg-black/15" />
            <div className="h-3.5 w-4/5 animate-pulse bg-black/15" />
            <div className="h-8 w-full animate-pulse bg-black/15" />
          </div>
        </article>
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
}: DynamicBadgeProductSlotProps) {
  const [products, setProducts] = useState<HomeNewArrivalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizedLimit = useMemo(() => clampLimit(limit), [limit])
  const normalizedBadgeFilter = useMemo(
    () => normalizeBadgeFilter(badgeFilter, defaultBadgeFilter),
    [badgeFilter, defaultBadgeFilter],
  )
  const theme = useMemo(
    () => BADGE_SLOT_THEMES[normalizedBadgeFilter] ?? BADGE_SLOT_THEMES.NEW,
    [normalizedBadgeFilter],
  )
  const sectionTitle = title?.trim() || theme.chip
  const sectionSubtitle = subtitle?.trim() || "Auto-synced products from Strapi"
  const inStockUnits = useMemo(
    () => products.reduce((sum, product) => sum + Math.max(0, product.stock), 0),
    [products],
  )
  const soldOutCount = useMemo(
    () => products.filter((product) => product.isSoldOut || product.stock <= 0).length,
    [products],
  )
  const uniqueTypesCount = useMemo(
    () => new Set(products.map((product) => product.category).filter(Boolean)).size,
    [products],
  )

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        buildProductsUrl(normalizedBadgeFilter, normalizedLimit),
        {
          method: "GET",
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }

      const payload = (await response.json()) as StrapiProductResponse
      const items = Array.isArray(payload?.data) ? payload.data : []
      const mappedProducts = items
        .map((item, index) => mapStrapiProduct(item, index))
        .filter((item): item is HomeNewArrivalProduct => item !== null)

      setProducts(mappedProducts)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not load products from Strapi."
      setProducts([])
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [normalizedBadgeFilter, normalizedLimit])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  return (
    <section
      className="py-12"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        borderBottom: `2px solid ${normalizedBadgeFilter === "COLLAB" ? "#D0A640" : "#0F172A"}`,
        backgroundImage:
          normalizedBadgeFilter === "COLLAB"
            ? "linear-gradient(rgba(248,184,0,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(248,184,0,0.14) 1px, transparent 1px)"
            : "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div className={theme.infoOnRight ? "lg:order-2" : "lg:order-1"}>
            <p
              className="mb-2 text-[10px] font-black uppercase tracking-[0.16em]"
              style={{ color: theme.accent }}
            >
              {theme.eyebrow}
            </p>
            <div
              className="mb-4 inline-flex border-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]"
              style={{
                borderColor: normalizedBadgeFilter === "COLLAB" ? "#D0A640" : "#0F172A",
                backgroundColor: theme.accent,
                color: normalizedBadgeFilter === "COLLAB" ? "#0A0E1A" : "#FFFFFF",
              }}
            >
              {theme.chip}
            </div>
            <h2
              className="font-black uppercase leading-tight"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.8rem)" }}
            >
              {sectionTitle}
            </h2>
            {sectionSubtitle ? (
              <p className="mt-3 text-sm" style={{ color: theme.mutedText }}>
                {sectionSubtitle}
              </p>
            ) : null}

            <div
              className="mt-5 border-2 p-4"
              style={{
                borderColor: normalizedBadgeFilter === "COLLAB" ? "#D0A640" : "#0F172A",
                backgroundColor:
                  normalizedBadgeFilter === "COLLAB"
                    ? "rgba(17,24,39,0.74)"
                    : "rgba(255,255,255,0.78)",
              }}
            >
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: theme.mutedText }}>
                Section Stats
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] uppercase" style={{ color: theme.mutedText }}>
                    Items
                  </p>
                  <p className="text-2xl font-black">{loading ? "--" : products.length}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase" style={{ color: theme.mutedText }}>
                    Types
                  </p>
                  <p className="text-2xl font-black">{loading ? "--" : uniqueTypesCount || 1}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase" style={{ color: theme.mutedText }}>
                    Stock
                  </p>
                  <p className="text-2xl font-black">{loading ? "--" : inStockUnits}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold" style={{ color: theme.mutedText }}>
              {loading ? "Loading..." : `${soldOutCount} sold out`}
            </p>

            <Link
              href={theme.ctaHref}
              className="mt-5 inline-flex border-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em]"
              style={{
                borderColor: normalizedBadgeFilter === "COLLAB" ? "#D0A640" : "#0F172A",
                backgroundColor: theme.accent,
                color: normalizedBadgeFilter === "COLLAB" ? "#0A0E1A" : "#FFFFFF",
              }}
            >
              {theme.ctaLabel}
            </Link>
          </div>

          <div className={theme.infoOnRight ? "space-y-4 lg:order-1" : "space-y-4 lg:order-2"}>
            <h3 className="text-xl font-black">Featured Items</h3>

            {loading ? <ProductSkeletonCards count={normalizedLimit} /> : null}

            {!loading && error ? (
              <div className="border-2 border-dashed border-black bg-white p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#E70009]">
                  Failed to load products
                </p>
                <p className="mt-2 text-xs font-semibold text-black/70">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    void loadProducts()
                  }}
                  className="mt-4 inline-flex border-2 border-black bg-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#E70009]"
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!loading && !error ? (
              <HomeNewArrivalsGrid
                products={products}
                emptyMessage={emptyMessage || "No products found for this section"}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
