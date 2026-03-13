"use client"

import Image from "next/image"
import Link from "next/link"
import { type MouseEvent, useState } from "react"
import { useCart } from "@/hooks/use-cart"
import type { HomeCategoryProduct } from "@/components/homepage/category-showcase"

interface NewArrivalsSliderProps {
  products: HomeCategoryProduct[]
}

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  DECKS: "linear-gradient(135deg, #20170A 0%, #080808 100%)",
  TRUCKS: "linear-gradient(135deg, #0B1220 0%, #080808 100%)",
  WHEELS: "linear-gradient(135deg, #130C1C 0%, #080808 100%)",
  SHOES: "linear-gradient(135deg, #091510 0%, #080808 100%)",
  APPAREL: "linear-gradient(135deg, #150D18 0%, #080808 100%)",
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getBadgeContent(product: HomeCategoryProduct) {
  const badge = product.badge.toUpperCase()

  if (badge === "HOT") {
    return (
      <span className="inline-flex items-center bg-[var(--black)] px-2.5 py-1 goofy-mono text-[7px] uppercase tracking-[0.18em] text-[var(--gold)]">
        {badge}
      </span>
    )
  }

  if (badge === "COLLAB") {
    return (
      <span className="inline-flex items-center bg-[var(--gold)] px-2.5 py-1 goofy-mono text-[7px] uppercase tracking-[0.18em] text-[var(--black)]">
        {badge}
      </span>
    )
  }

  if (badge === "DROP") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[var(--black)] px-2.5 py-1 goofy-mono text-[7px] uppercase tracking-[0.18em] text-[var(--gold)]">
        <span className="sale-dot-pulse inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        <span>{badge}</span>
      </span>
    )
  }

  if (badge === "SALE") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[var(--white)] px-2.5 py-1 goofy-mono text-[7px] uppercase tracking-[0.18em] text-[var(--black)]">
        <span>{badge}</span>
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/20 text-[6px] leading-none">
          %
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center bg-[var(--white)] px-2.5 py-1 goofy-mono text-[7px] uppercase tracking-[0.18em] text-[var(--black)]">
      {badge}
    </span>
  )
}

function getFallbackBackground(product: HomeCategoryProduct) {
  return (
    CATEGORY_BACKGROUNDS[product.categoryLabel] ??
    "linear-gradient(135deg, #141414 0%, #050505 100%)"
  )
}

export function NewArrivalsSlider({ products }: NewArrivalsSliderProps) {
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)

  const handleAddToCart = (
    event: MouseEvent<HTMLButtonElement>,
    product: HomeCategoryProduct,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (product.stock <= 0) return

    setAddingId(product.id)
    addItem({
      productId: product.slug,
      name: product.name,
      category: product.categoryLabel,
      image: product.image || "/placeholder.jpg",
      price: product.price,
      quantity: 1,
      maxStock: Math.max(product.stock, 1),
    })

    window.setTimeout(() => {
      setAddingId((current) => (current === product.id ? null : current))
    }, 900)
  }

  return (
    <section className="bg-[var(--white)] py-12">
      <div className="flex items-end justify-between gap-5 px-5 md:px-10">
        <div className="space-y-2">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
            The Shop
          </p>
          <h2 className="goofy-display text-[clamp(42px,6vw,76px)] leading-[0.84] text-[var(--black)]">
            New Arrivals
          </h2>
        </div>

        <Link
          href="/shop"
          className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-black/54 transition-colors hover:text-[var(--black)]"
        >
          Shop All {"->"}
        </Link>
      </div>

      <div
        className="mt-8 flex snap-x gap-4 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden md:px-10"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <article key={product.id} className="w-[220px] shrink-0 snap-start">
            <div className="group relative aspect-[3/4] overflow-hidden bg-[var(--black)]">
              <Link
                href={product.href}
                aria-label={product.name}
                className="absolute inset-0 z-10"
              />

              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="220px"
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: getFallbackBackground(product) }}
                />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.02),rgba(8,8,8,0.18)_42%,rgba(8,8,8,0.92)_100%)]" />

              <div className="absolute left-3 top-3 z-20">
                {getBadgeContent(product)}
              </div>

              <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-16">
                <p className="goofy-mono text-[7px] uppercase tracking-[0.18em] text-white/48">
                  {product.categoryLabel}
                </p>
                <h3 className="goofy-display mt-2 text-[34px] leading-[0.82] text-[var(--white)]">
                  {product.name}
                </h3>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
                <button
                  type="button"
                  onClick={(event) => handleAddToCart(event, product)}
                  disabled={product.stock <= 0}
                  className="goofy-btn goofy-btn-primary w-full translate-y-5 opacity-100 transition-all duration-300 disabled:bg-white/18 disabled:text-white/42 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                >
                  {product.stock <= 0
                    ? "Sold Out"
                    : addingId === product.id
                      ? "Added"
                      : "Add to Cart"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="goofy-mono text-[10px] uppercase tracking-[0.16em] text-[var(--black)]">
                {formatPrice(product.price)}
              </span>
              <span className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-black/45">
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
