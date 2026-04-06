"use client"

import Image from "next/image"
import Link from "next/link"
import { type CSSProperties, useState } from "react"
import { ArrowUpRight, ShoppingBag } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useCart } from "@/hooks/use-cart"
import type { ProductBadgeFilter } from "@/lib/types/cms"
import { cn } from "@/lib/utils"

export interface HomeNewArrivalProduct {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number | null
  category: string
  brand: string
  image: string
  stock: number
  isSoldOut: boolean
  publishedAt?: string | null
  saleEndDate?: string | null
  viewsCount?: number
  soldCount?: number
  averageRating?: number
  limitPerCustomer?: number
  waitlistCount?: number
}

export interface ProductSectionGridTheme {
  badgeFilter: ProductBadgeFilter
  accent: string
  text: string
  mutedText: string
  cardBackground: string
  cardBorder: string
  hoverBorder: string
  buttonBackground: string
  buttonText: string
  priceText: string
  stockTrack: string
  stockFill: string
  surface: string
  isDark: boolean
}

interface HomeNewArrivalsGridProps {
  products: HomeNewArrivalProduct[]
  emptyMessage?: string
  theme: ProductSectionGridTheme
  isVisible: boolean
  layout?: "two-column" | "four-column"
  variant?: "compact" | "sale" | "new" | "catalog"
}

const textFontStyle = {
  fontFamily: "var(--font-ui-sans)",
}

const headingFontStyle = {
  ...textFontStyle,
  fontWeight: 700 as const,
}

const CATALOG_VISIBLE_COUNT = 5

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(0, value))
}

function getDiscountPercent(product: HomeNewArrivalProduct): number | null {
  if (
    typeof product.originalPrice !== "number" ||
    product.originalPrice <= 0 ||
    product.originalPrice <= product.price
  ) {
    return null
  }

  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}

function getHoursSincePublished(value?: string | null): number | null {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null
  return Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60)))
}

function getCardMeta(product: HomeNewArrivalProduct, badgeFilter: ProductBadgeFilter) {
  const hoursSincePublished = getHoursSincePublished(product.publishedAt)

  switch (badgeFilter) {
    case "HOT":
      return {
        eyebrow: `${formatCompactNumber(product.viewsCount ?? 0)} views`,
        detail: `${product.soldCount ?? 0} sold`,
      }
    case "SALE": {
      const discountPercent = getDiscountPercent(product)
      return {
        eyebrow: discountPercent ? `${discountPercent}% off` : "markdown live",
        detail: product.isSoldOut ? "missed this one" : product.stock <= 8 ? "final stock" : "live markdown",
      }
    }
    case "COLLAB":
      return {
        eyebrow: `limit ${product.limitPerCustomer ?? 1}`,
        detail: product.stock > 0 ? `${product.stock} remaining` : "numbered out",
      }
    case "DROP":
      return {
        eyebrow: product.stock > 0 ? `${product.stock} units ready` : "locked",
        detail: product.isSoldOut ? "drop closed" : "release stock",
      }
    case "NEW":
    default:
      return {
        eyebrow: hoursSincePublished ? `${hoursSincePublished}h fresh` : "just landed",
        detail: product.stock > 0 ? `${product.stock} in stock` : "restock soon",
      }
  }
}

function getStockBarWidth(product: HomeNewArrivalProduct): number {
  if (product.isSoldOut || product.stock <= 0) return 0
  return Math.max(10, Math.min(100, (product.stock / 12) * 100))
}

function getRetroAccent(badgeFilter: ProductBadgeFilter): string {
  switch (badgeFilter) {
    case "NEW":
      return "#6B8CFF"
    case "HOT":
      return "#FBD000"
    case "SALE":
      return "#E70009"
    default:
      return "#111111"
  }
}

function getRetroPanelTone(badgeFilter: ProductBadgeFilter): string {
  switch (badgeFilter) {
    case "NEW":
      return "#EAF0FF"
    case "HOT":
      return "#F7F1D8"
    case "SALE":
      return "#F7E3DF"
    default:
      return "#E6E6E6"
  }
}

function getAccentTextColor(accent: string): string {
  return accent === "#FBD000" ? "#111111" : "#FFFFFF"
}

export function HomeNewArrivalsGrid({
  products,
  emptyMessage = "No products found for this section",
  theme,
  isVisible,
  layout = "four-column",
  variant = "compact",
}: HomeNewArrivalsGridProps) {
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleAddToCart = (product: HomeNewArrivalProduct) => {
    if (product.isSoldOut || product.stock <= 0) return

    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
      quantity: 1,
      maxStock: product.stock,
    })

    setAddingId(product.id)
    window.setTimeout(() => {
      setAddingId((current) => (current === product.id ? null : current))
    }, 900)
  }

  const renderCatalogCard = (product: HomeNewArrivalProduct, index: number) => {
    const isSoldOut = product.isSoldOut || product.stock <= 0
    const discountPercent = getDiscountPercent(product)
    const retroAccent = getRetroAccent(theme.badgeFilter)
    const retroPanelTone = getRetroPanelTone(theme.badgeFilter)
    const accentTextColor = getAccentTextColor(retroAccent)
    const stockLabel = isSoldOut ? "Sold out" : `${product.stock} in stock`
    const hasImage = Boolean(product.image) && !imageErrors[product.id]

    return (
      <article
        key={product.id}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow,opacity] duration-200 [will-change:transform]",
          "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--retro-accent),8px_8px_0_#002868]",
          "focus-within:-translate-y-0.5 focus-within:shadow-[4px_4px_0_var(--retro-accent),8px_8px_0_#002868]",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        )}
        style={{
          transitionDelay: `${(index % CATALOG_VISIBLE_COUNT) * 80}ms`,
          ["--retro-accent" as const]: retroAccent,
        } as CSSProperties}
      >
        <Link href={`/product/${product.slug}`} className="block h-full text-[#161616]">
          <div className="relative border-b-2 border-black">
            <div className="absolute left-2 top-2 z-10">
              <span
                className="border border-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                style={{
                  ...textFontStyle,
                  backgroundColor: retroAccent,
                  color: accentTextColor,
                }}
              >
                {theme.badgeFilter}
              </span>
            </div>

            <div className="absolute right-2 top-2 z-10">
              <span
                className="border border-black bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-black/65"
                style={textFontStyle}
              >
                {product.category}
              </span>
            </div>

            <div
              className="relative flex aspect-[1/1.7] items-center justify-center overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:12px_12px]"
              style={{ backgroundColor: retroPanelTone }}
            >
              {hasImage ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 86vw, (max-width: 768px) 60vw, (max-width: 1024px) 42vw, 20vw"
                  onError={() => {
                    setImageErrors((current) =>
                      current[product.id] ? current : { ...current, [product.id]: true },
                    )
                  }}
                  className={cn(
                    "object-contain p-2 drop-shadow-[2px_2px_0_#0A0A0A] transition-transform duration-300 group-hover:scale-[1.06] group-focus-within:scale-[1.06]",
                    isSoldOut ? "grayscale opacity-60" : "",
                  )}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-5 text-center">
                  <div className="space-y-2">
                    <p
                      className="text-[0.8rem] font-black uppercase tracking-[0.16em] text-black/55"
                      style={textFontStyle}
                    >
                      Image Soon
                    </p>
                    <p
                      className="text-[1rem] font-black uppercase leading-[0.92] text-black"
                      style={headingFontStyle}
                    >
                      {product.brand}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-3">
              <h3
                className={cn(
                  "line-clamp-2 text-[1.96rem] uppercase leading-[0.78] text-white transition-colors duration-200",
                  theme.badgeFilter === "SALE" && discountPercent ? "max-w-[72%]" : "",
                )}
                style={{
                  ...headingFontStyle,
                  textShadow: "2px 2px 0 #0A0A0A",
                }}
              >
                {product.name}
              </h3>
            </div>

            {theme.badgeFilter === "SALE" && discountPercent ? (
              <div
                className="absolute bottom-3 right-3 z-10 border border-black px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white"
                style={{
                  ...textFontStyle,
                  backgroundColor: retroAccent,
                }}
              >
                -{discountPercent}%
              </div>
            ) : null}

            {isSoldOut ? (
              <div
                className="absolute left-2 top-9 z-10 border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#E70009]"
                style={textFontStyle}
              >
                Sold out
              </div>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-[0.12em]"
                style={{
                  ...textFontStyle,
                  color: isSoldOut ? "#E70009" : retroAccent,
                }}
              >
                {stockLabel}
              </p>

              {(theme.badgeFilter === "SALE" || product.originalPrice) && product.originalPrice ? (
                <p className="mt-0.5 text-[0.82rem] leading-none text-black/55 line-through" style={textFontStyle}>
                  {formatPrice(product.originalPrice)}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[1.05rem] font-bold leading-none text-black" style={textFontStyle}>
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </Link>

        <div className="sr-only">
          <button type="button" onClick={() => handleAddToCart(product)} disabled={isSoldOut}>
            Add {product.name}
          </button>
        </div>
      </article>
    )
  }

  if (products.length === 0) {
    if (variant === "catalog") {
      return (
        <div className="border-4 border-black bg-[#E6E6E6] px-6 py-10 text-center shadow-[4px_4px_0_#0A0A0A]">
          <p className="text-sm uppercase tracking-[0.14em] text-black" style={textFontStyle}>
            {emptyMessage}
          </p>
        </div>
      )
    }

    return (
      <div
        className="rounded-[28px] border border-dashed px-6 py-10 text-center"
        style={{
          borderColor: theme.cardBorder,
          backgroundColor: theme.surface,
          color: theme.mutedText,
        }}
      >
        <p className="text-sm uppercase tracking-[0.14em]" style={textFontStyle}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  if (variant === "catalog") {
    const retroAccent = getRetroAccent(theme.badgeFilter)

    return (
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="basis-[86%] sm:basis-[60%] md:basis-[42%] lg:basis-1/5 xl:basis-1/5 2xl:basis-1/5"
              >
                {renderCatalogCard(product, index)}
              </CarouselItem>
            ))}
          </CarouselContent>

          {products.length > 1 ? (
            <>
              <CarouselPrevious
                className="left-auto right-12 top-[-3.25rem] h-11 w-11 -translate-y-0 rounded-none border-4 border-black bg-white text-black shadow-[3px_3px_0_#0A0A0A] transition-[transform,box-shadow,color,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[3px_3px_0_var(--retro-accent),6px_6px_0_#002868] disabled:border-black/20 disabled:bg-white disabled:text-black/25 disabled:shadow-none"
                style={{ ["--retro-accent" as const]: retroAccent } as CSSProperties}
              />
              <CarouselNext
                className="right-0 top-[-3.25rem] h-11 w-11 -translate-y-0 rounded-none border-4 border-black bg-white text-black shadow-[3px_3px_0_#0A0A0A] transition-[transform,box-shadow,color,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[3px_3px_0_var(--retro-accent),6px_6px_0_#002868] disabled:border-black/20 disabled:bg-white disabled:text-black/25 disabled:shadow-none"
                style={{ ["--retro-accent" as const]: retroAccent } as CSSProperties}
              />
            </>
          ) : null}
        </Carousel>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        layout === "four-column"
          ? "md:grid-cols-2 xl:grid-cols-4"
          : "md:grid-cols-2",
      )}
    >
      {products.map((product, index) => {
        const isSoldOut = product.isSoldOut || product.stock <= 0
        const isLowStock = !isSoldOut && product.stock <= 8
        const discountPercent = getDiscountPercent(product)
        const meta = getCardMeta(product, theme.badgeFilter)
        const stockBarWidth = getStockBarWidth(product)

        return (
          <article
            key={product.id}
            className={cn(
              "group flex h-full flex-col overflow-hidden rounded-[26px] border transition-[transform,opacity,border-color,box-shadow] duration-500 ease-out",
              "hover:-translate-y-1",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{
              transitionDelay: `${(index % 4) * 90}ms`,
              borderColor: theme.cardBorder,
              backgroundColor: theme.cardBackground,
              boxShadow: theme.isDark
                ? "0 24px 48px rgba(0,0,0,0.24)"
                : "0 18px 36px rgba(15,23,42,0.08)",
            }}
          >
            <Link href={`/product/${product.slug}`} className="block" style={{ color: theme.text }}>
              <div
                className="relative aspect-[4/4.8] overflow-hidden border-b"
                style={{ borderColor: theme.cardBorder }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
                    isSoldOut ? "grayscale opacity-60" : "",
                  )}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />

                <div className="absolute left-3 top-3 inline-flex rounded-full border border-white/16 bg-black/48 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm" style={textFontStyle}>
                  {product.category}
                </div>

                {variant === "sale" && discountPercent ? (
                  <div
                    className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full text-center leading-none shadow-[0_10px_30px_rgba(202,33,24,0.28)]"
                    style={{
                      backgroundColor: "#CA2118",
                      color: "#FFF4EE",
                    }}
                  >
                    <span className="text-[12px] uppercase tracking-[0.08em]" style={headingFontStyle}>
                      -{discountPercent}%
                    </span>
                  </div>
                ) : null}

                {isSoldOut ? (
                  <div
                    className={cn(
                      "absolute rounded-full border bg-[#1F2430]/90 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#F5EFE0]",
                      variant === "sale" && discountPercent ? "right-3 top-[4.75rem]" : "right-3 top-3",
                    )}
                    style={textFontStyle}
                  >
                    Sold out
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/72" style={textFontStyle}>
                    {product.brand}
                  </p>
                  <h3
                    className="mt-1 line-clamp-2 text-[1.65rem] uppercase leading-[0.92] text-white"
                    style={headingFontStyle}
                  >
                    {product.name}
                  </h3>
                </div>
              </div>
            </Link>

            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p
                    className="text-[11px] uppercase tracking-[0.14em]"
                    style={{ ...textFontStyle, color: theme.mutedText }}
                  >
                    {meta.eyebrow}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p
                      className="text-[1.55rem] uppercase leading-none"
                      style={{ ...headingFontStyle, color: theme.priceText }}
                    >
                      {formatPrice(product.price)}
                    </p>
                    {variant === "sale" && product.originalPrice ? (
                      <p
                        className="text-sm line-through"
                        style={{ ...textFontStyle, color: theme.mutedText }}
                      >
                        {formatPrice(product.originalPrice)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p
                  className="text-right text-[11px] uppercase leading-tight tracking-[0.14em]"
                  style={{
                    ...textFontStyle,
                    color: isSoldOut ? "#CA2118" : isLowStock ? theme.accent : theme.mutedText,
                  }}
                >
                  {meta.detail}
                </p>
              </div>

              {variant === "sale" ? (
                <div
                  className="rounded-[18px] border px-3 py-3"
                  style={{
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.surface,
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.14em]" style={{ ...textFontStyle, color: theme.mutedText }}>
                      Stock signal
                    </p>
                    <p
                      className="text-[11px] uppercase tracking-[0.14em]"
                      style={{
                        ...textFontStyle,
                        color: isSoldOut ? "#CA2118" : isLowStock ? theme.accent : theme.text,
                      }}
                    >
                      {isSoldOut ? "gone" : `${product.stock} left`}
                    </p>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{ backgroundColor: theme.stockTrack }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stockBarWidth}%`,
                        backgroundColor: isSoldOut ? "#CA2118" : theme.stockFill,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between gap-3">
                <p
                  className="text-[11px] uppercase tracking-[0.14em]"
                  style={{ ...textFontStyle, color: theme.mutedText }}
                >
                  {theme.badgeFilter === "HOT"
                    ? `${product.averageRating?.toFixed(1) ?? "4.8"} rated`
                    : theme.badgeFilter === "NEW"
                      ? "ready to roll"
                      : "quick add"}
                </p>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={isSoldOut}
                  className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] uppercase tracking-[0.14em] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-[#6B6B77] disabled:bg-[#6B6B77] disabled:text-[#E5DED0]"
                  style={{
                    ...textFontStyle,
                    borderColor: theme.accent,
                    backgroundColor: theme.buttonBackground,
                    color: theme.buttonText,
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {isSoldOut
                    ? "Sold out"
                    : addingId === product.id
                      ? "Added"
                      : "Add"}
                  {!isSoldOut ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
