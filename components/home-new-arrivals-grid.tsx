"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, type CSSProperties } from "react"
import { ShoppingBag } from "lucide-react"
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
  isDark: boolean
}

interface HomeNewArrivalsGridProps {
  products: HomeNewArrivalProduct[]
  emptyMessage?: string
  theme: ProductSectionGridTheme
  isVisible: boolean
  layout?: "two-column" | "four-column"
}

const bodyFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const headingFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 800,
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getDiscountPercent(product: HomeNewArrivalProduct): number | null {
  if (
    typeof product.originalPrice !== "number" ||
    product.originalPrice <= product.price ||
    product.originalPrice <= 0
  ) {
    return null
  }

  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}

export function HomeNewArrivalsGrid({
  products,
  emptyMessage = "No products found for this section",
  theme,
  isVisible,
  layout = "two-column",
}: HomeNewArrivalsGridProps) {
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)

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
    }, 1000)
  }

  if (products.length === 0) {
    return (
      <div
        className="border border-dashed p-8 text-center"
        style={{
          borderColor: theme.isDark ? "rgba(248,184,0,0.3)" : "rgba(0,0,0,0.16)",
          backgroundColor: theme.isDark ? "#111111" : "rgba(255,255,255,0.9)",
          color: theme.mutedText,
        }}
      >
        <p className="text-sm uppercase tracking-[0.14em]" style={bodyFontStyle}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        layout === "four-column"
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-2",
      )}
    >
      {products.map((product, index) => {
        const isSoldOut = product.isSoldOut || product.stock <= 0
        const isLowStock = !isSoldOut && product.stock < 10
        const discountPercent = getDiscountPercent(product)
        const isSaleSection = theme.badgeFilter === "SALE"
        const cardShadow = isSaleSection
          ? "0 22px 44px rgba(229,34,34,0.16)"
          : "0 18px 36px rgba(0,0,0,0.12)"

        return (
          <article
            key={product.id}
            className={cn(
              "group overflow-hidden border transition-[transform,opacity,border-color,box-shadow] duration-500 ease-out hover:border-[var(--card-hover-border)]",
              "hover:-translate-y-1 hover:shadow-[var(--card-hover-shadow)]",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{
              "--card-hover-border": theme.hoverBorder,
              "--card-hover-shadow": cardShadow,
              transitionDelay: `${(index % 4) * 100}ms`,
              borderColor: theme.cardBorder,
              backgroundColor: theme.cardBackground,
            } as CSSProperties}
          >
            <Link
              href={`/product/${product.slug}`}
              className="block"
              style={{
                color: theme.text,
              }}
            >
              <div className="relative aspect-[4/4.6] overflow-hidden border-b" style={{ borderColor: theme.cardBorder }}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
                    isSoldOut ? "grayscale opacity-60" : "",
                  )}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/10 to-transparent" />

                {theme.badgeFilter === "SALE" && discountPercent ? (
                  <span
                    className="absolute left-3 top-3 border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]"
                    style={{
                      ...bodyFontStyle,
                      borderColor: "#E52222",
                      backgroundColor: "#E52222",
                      color: "#F5EFE0",
                    }}
                  >
                    -{discountPercent}%
                  </span>
                ) : null}

                {isSoldOut ? (
                  <span
                    className={cn(
                      "absolute left-3 border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]",
                      discountPercent ? "top-12" : "top-3",
                    )}
                    style={{
                      ...bodyFontStyle,
                      borderColor: "#6B6B77",
                      backgroundColor: "#2A2D36",
                      color: "#E5DED0",
                    }}
                  >
                    Sold Out
                  </span>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.16em] text-white/76"
                      style={bodyFontStyle}
                    >
                      {product.category}
                    </p>
                    <p
                      className="mt-1 line-clamp-2 text-base text-white"
                      style={headingFontStyle}
                    >
                      {product.name}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p
                    className="text-[10px] uppercase tracking-[0.16em]"
                    style={{ ...bodyFontStyle, color: theme.mutedText }}
                  >
                    {product.brand}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-base"
                      style={{ color: theme.priceText }}
                    >
                      {formatPrice(product.price)}
                    </p>
                    {theme.badgeFilter === "SALE" && product.originalPrice ? (
                      <p
                        className="text-sm line-through"
                        style={{ ...bodyFontStyle, color: theme.mutedText }}
                      >
                        {formatPrice(product.originalPrice)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p
                  className={cn(
                    "text-right text-[10px] uppercase tracking-[0.16em]",
                    isSoldOut
                      ? "text-[#E52222]"
                      : isLowStock
                        ? ""
                        : "",
                  )}
                  style={{
                    ...bodyFontStyle,
                    color: isSoldOut ? "#E52222" : isLowStock ? theme.accent : theme.mutedText,
                  }}
                >
                  {isSoldOut ? "No stock" : isLowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[10px] uppercase tracking-[0.16em]"
                  style={{ ...bodyFontStyle, color: theme.mutedText }}
                >
                  {theme.badgeFilter === "COLLAB"
                    ? `Limit ${product.limitPerCustomer ?? 2} per customer`
                    : theme.badgeFilter === "HOT"
                      ? `${product.soldCount ?? 0} sold`
                      : theme.badgeFilter === "SALE"
                        ? isSoldOut
                          ? "Missed this one"
                          : isLowStock
                            ? "Final stock moving"
                            : "Live markdown"
                      : isSoldOut
                        ? "Join next restock"
                        : "Ready to roll"}
                </p>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={isSoldOut}
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition-all duration-300",
                    "md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100",
                    "disabled:cursor-not-allowed disabled:border-[#6B6B77] disabled:bg-[#6B6B77] disabled:text-[#E5DED0]",
                    "disabled:md:translate-y-0 disabled:md:opacity-100",
                  )}
                  style={{
                    ...bodyFontStyle,
                    borderColor: theme.accent,
                    backgroundColor: theme.buttonBackground,
                    color: theme.buttonText,
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {isSoldOut
                    ? "Sold Out"
                    : addingId === product.id
                      ? "Added"
                      : "Add To Cart"}
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
