"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { AddToCartBtn } from "@/components/shop/AddToCartBtn"
import { WishlistBtn } from "@/components/shop/WishlistBtn"
import { type ShopProduct } from "@/lib/shop"

interface ProductPurchasePanelProps {
  product: ShopProduct
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1)

  const isOutOfStock = product.stock <= 0
  const maxQuantity = Math.max(product.stock, 1)

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: shareUrl,
        })
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      return
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <div>
        <p className="goofy-mono text-[9px] uppercase tracking-[0.2em] text-white/36">
          Quantity
        </p>
        <div className="mt-3 flex w-fit items-center border border-[var(--bordw)]">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="grid h-11 w-11 place-items-center text-white transition-colors hover:bg-white/6 disabled:cursor-not-allowed disabled:text-white/25"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="flex h-11 min-w-14 items-center justify-center border-x border-[var(--bordw)] goofy-mono text-[12px] text-[var(--white)]">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
            disabled={quantity >= maxQuantity || isOutOfStock}
            className="grid h-11 w-11 place-items-center text-white transition-colors hover:bg-white/6 disabled:cursor-not-allowed disabled:text-white/25"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AddToCartBtn product={product} quantity={quantity} />

      <div className="flex items-center gap-5 border-t border-[var(--bordw)] pt-4">
        <WishlistBtn productId={product.id} />
        <button
          type="button"
          onClick={handleShare}
          className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-[var(--gold)]"
        >
          Share
        </button>
        <span className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/18">
          Built for Vientiane streets
        </span>
      </div>
    </div>
  )
}
