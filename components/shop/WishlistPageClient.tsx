"use client"

import { useEffect, useState } from "react"
import { GoofyButton } from "@/components/GoofyButton"
import { ProductCard } from "@/components/shop/ProductCard"
import { useWishlist } from "@/lib/stores/wishlistStore"
import { type ShopProduct } from "@/lib/shop"
import { supabase } from "@/lib/supabase"

export function WishlistPageClient() {
  const { items, hydrated, clear } = useWishlist()
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (items.length === 0) {
      setProducts([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    void (async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .in("id", items)

      if (!cancelled) {
        const rows = (data as ShopProduct[] | null) ?? []
        const productMap = new Map(rows.map((product) => [product.id, product]))
        setProducts(
          items
            .map((id) => productMap.get(id))
            .filter((product): product is ShopProduct => Boolean(product)),
        )
        setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, items])

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1480px] px-5 pb-20 pt-24 md:px-10">
        <div className="border-b border-[var(--bordw)] pb-8">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            GOOFY. / WISHLIST
          </p>
          <h1 className="goofy-display mt-2 text-[clamp(38px,5vw,72px)] leading-none text-[var(--white)]">
            Saved Products
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="border border-[var(--bordw)] p-4">
              <div className="aspect-square bg-[#111] animate-pulse" />
              <div className="mt-3 h-4 w-3/4 bg-[#111] animate-pulse" />
              <div className="mt-2 h-3 w-1/3 bg-[#111] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1120px] flex-col items-center justify-center px-5 text-center md:px-10">
        <h1 className="goofy-display text-[clamp(38px,5vw,72px)] leading-none text-[var(--white)]">
          Your Wishlist Is Empty
        </h1>
        <p className="mt-4 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
          Save the decks, wheels, and shoes you want to come back to.
        </p>
        <GoofyButton href="/shop" variant="gold" className="mt-6">
          Browse Products
        </GoofyButton>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1480px] px-5 pb-20 pt-24 md:px-10">
      <div className="border-b border-[var(--bordw)] pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
              GOOFY. / WISHLIST
            </p>
            <h1 className="goofy-display mt-2 text-[clamp(38px,5vw,72px)] leading-none text-[var(--white)]">
              Saved Products
            </h1>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-[var(--gold)]"
            >
              Clear Wishlist
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="border border-[var(--bordw)] p-4">
              <div className="aspect-square bg-[#111] animate-pulse" />
              <div className="mt-3 h-4 w-3/4 bg-[#111] animate-pulse" />
              <div className="mt-2 h-3 w-1/3 bg-[#111] animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              view="grid"
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
