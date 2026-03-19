"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import type { MouseEvent } from "react"
import { useWishlist } from "@/lib/stores/wishlistStore"

interface WishlistBtnProps {
  productId: string
  className?: string
}

export function WishlistBtn({ productId, className = "" }: WishlistBtnProps) {
  const { toggle, has, hydrated } = useWishlist()
  const isWished = hydrated && has(productId)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggle(productId)
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/60 text-[var(--white)] backdrop-blur-sm transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] ${className}`.trim()}
    >
      <Heart
        className={`h-4 w-4 ${isWished ? "fill-[var(--gold)] text-[var(--gold)]" : ""}`}
      />
    </motion.button>
  )
}
