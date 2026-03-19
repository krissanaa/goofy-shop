"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { MouseEvent } from "react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { WishlistBtn } from "@/components/shop/WishlistBtn"
import { staggerItem } from "@/lib/motion"
import {
  getBadgeTone,
  getCategoryLabel,
  getProductComparePrice,
  type ShopProduct,
  type ShopView,
} from "@/lib/shop"
import { formatPrice } from "@/lib/utils/format"

interface ProductCardProps {
  product: ShopProduct
  view: ShopView
  index: number
}

export function ProductCard({ product, view }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const productUrl = `/shop/${product.slug}`
  const image = product.images?.[0] || "/placeholder.jpg"
  const comparePrice = getProductComparePrice(product)
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (isOutOfStock) {
      return
    }

    addItem({
      productId: product.slug,
      name: product.name,
      category: getCategoryLabel(product.category ?? "product"),
      image,
      price: product.price,
      quantity: 1,
      maxStock: Math.max(product.stock, 1),
    })

    toast({
      title: "Added to cart",
      description: product.name,
    })
  }

  if (view === "list") {
    return (
      <motion.article
        variants={staggerItem}
        className="border-b border-[var(--bordw)] bg-[var(--black)]"
      >
        <div className="flex items-center gap-5 px-5 py-5 transition-colors hover:bg-white/[0.02]">
          <Link href={productUrl} className="relative h-[120px] w-[120px] shrink-0 overflow-hidden bg-[#111]">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="120px"
              className="object-cover"
            />
            <WishlistBtn
              productId={product.id}
              className="absolute right-2 top-2 z-10"
            />
            {product.badge ? (
              <span
                className={`absolute left-2 top-2 inline-flex items-center px-2 py-1 goofy-mono text-[7px] uppercase tracking-[0.15em] ${getBadgeTone(product.badge)}`}
              >
                {product.badge}
              </span>
            ) : null}
          </Link>

          <div className="min-w-0 flex-1">
            <p className="goofy-mono mb-1 text-[8px] uppercase tracking-[0.18em] text-white/30">
              {product.brand || "GOOFY."}
            </p>
            <h3 className="goofy-display text-[24px] leading-none text-[var(--white)]">
              {product.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex border border-[var(--bordw)] px-2 py-1 goofy-mono text-[7px] uppercase tracking-[0.16em] text-white/50">
                {getCategoryLabel(product.category ?? "product")}
              </span>
              {isOutOfStock ? (
                <span className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/40">
                  Out of Stock
                </span>
              ) : (
                <span className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
                  {product.stock} in stock
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-3">
              <span className="goofy-mono text-[13px] text-[var(--white)]">
                {formatPrice(product.price)}
              </span>
              {comparePrice && comparePrice > product.price ? (
                <span className="goofy-mono text-[11px] text-white/30 line-through">
                  {formatPrice(comparePrice)}
                </span>
              ) : null}
            </div>

            <Link
              href={productUrl}
              className="mt-3 inline-flex goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-[var(--gold)]"
            >
              View -{">"}
            </Link>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.div variants={staggerItem}>
      <Link href={productUrl}>
        <motion.article
          initial="rest"
          whileHover="hover"
          className="group overflow-hidden bg-[var(--black)] border-b border-r border-[var(--bordw)]"
        >
          <div className="relative aspect-square overflow-hidden bg-[#111]">
            <WishlistBtn
              productId={product.id}
              className="absolute right-3 top-3 z-20 opacity-0 transition-opacity group-hover:opacity-100"
            />
            {product.badge ? (
              <span
                className={`absolute left-3 top-3 z-10 inline-flex items-center px-2 py-1 goofy-mono text-[7px] uppercase tracking-[0.15em] ${getBadgeTone(product.badge)}`}
              >
                {product.badge}
              </span>
            ) : null}

            <motion.div
              className="h-full w-full"
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.06 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-[var(--black)]/90 py-3"
              variants={{
                rest: { y: "100%", opacity: 0 },
                hover: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="goofy-mono flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[var(--white)] disabled:cursor-not-allowed disabled:text-white/30"
              >
                + Add to Cart
              </button>
            </motion.div>

            {isOutOfStock ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                <span className="goofy-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
                  Out of Stock
                </span>
              </div>
            ) : null}
          </div>

          <div className="p-4">
            <p className="goofy-mono mb-1 text-[7px] uppercase tracking-[0.18em] text-white/30">
              {product.brand || "GOOFY."}
            </p>
            <h3 className="goofy-display line-clamp-2 text-[18px] leading-tight text-[var(--white)] transition-colors duration-200 group-hover:text-[var(--gold)]">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="goofy-mono text-[13px] text-[var(--white)]">
                {formatPrice(product.price)}
              </span>
              {comparePrice && comparePrice > product.price ? (
                <span className="goofy-mono text-[11px] text-white/30 line-through">
                  {formatPrice(comparePrice)}
                </span>
              ) : null}
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
