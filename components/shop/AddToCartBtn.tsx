"use client"

import { useMemo } from "react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { getCategoryLabel, type ShopProduct } from "@/lib/shop"

interface AddToCartBtnProps {
  product: ShopProduct
  quantity: number
}

export function AddToCartBtn({ product, quantity }: AddToCartBtnProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const image = useMemo(
    () => product.images?.[0] || "/placeholder.jpg",
    [product.images],
  )
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return
    }

    addItem({
      productId: product.slug,
      name: product.name,
      category: getCategoryLabel(product.category ?? "product"),
      image,
      price: product.price,
      quantity,
      maxStock: Math.max(product.stock, 1),
    })

    toast({
      title: "Added to cart",
      description: `${product.name} x${quantity}`,
    })
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className="inline-flex h-14 w-full items-center justify-center bg-[var(--gold)] px-6 goofy-display text-[24px] uppercase text-[var(--black)] transition-colors hover:bg-[var(--white)] disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
    >
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  )
}
