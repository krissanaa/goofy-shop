"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isLimited && !product.isSoldOut && (
            <Badge className="rounded-none bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
              Limited
            </Badge>
          )}
          {product.isSoldOut && (
            <Badge className="rounded-none bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        {!product.isSoldOut && product.stock <= 10 && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/70 bg-background/60 backdrop-blur-sm px-2 py-1">
              {product.stock} left
            </span>
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-colors duration-300 group-hover:bg-background/40">
          <span className="translate-y-4 text-xs font-bold uppercase tracking-[0.3em] text-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Quick View
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">
            {product.category}
          </p>
        </div>
        <p className={`text-sm font-bold tabular-nums ${product.isSoldOut ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          ${product.price}
        </p>
      </div>
    </Link>
  )
}
