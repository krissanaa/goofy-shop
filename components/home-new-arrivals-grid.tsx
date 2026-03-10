"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export interface HomeNewArrivalProduct {
  id: string
  slug: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  isSoldOut: boolean
}

interface HomeNewArrivalsGridProps {
  products: HomeNewArrivalProduct[]
  emptyMessage?: string
}

export function HomeNewArrivalsGrid({
  products,
  emptyMessage = "No new arrivals yet",
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
      <div className="border-2 border-dashed border-black bg-white p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-black/70">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product, index) => {
        const isSoldOut = product.isSoldOut || product.stock <= 0
        const panelClassName = index % 2 === 0 ? "bg-[#F3EFE5]" : "bg-white"

        return (
          <article
            key={product.id}
            className={`group overflow-hidden border-2 border-black ${panelClassName}`}
          >
            <Link href={`/product/${product.slug}`} className="block border-b-2 border-black bg-[#EAEAEA]">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className={`object-cover ${isSoldOut ? "grayscale" : ""}`}
                />
              </div>
            </Link>
            <div className="space-y-3 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
                {product.category}
              </p>
              <h3 className="line-clamp-2 text-sm font-black uppercase tracking-[0.04em] text-black">
                {product.name}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-black text-[#E70009]">${product.price}</p>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={isSoldOut}
                  className="inline-flex items-center gap-1 border-2 border-black bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all duration-200 hover:bg-[#E70009] disabled:cursor-not-allowed disabled:bg-[#888] md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 disabled:md:translate-y-0 disabled:md:opacity-100"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {isSoldOut
                    ? "Sold Out"
                    : addingId === product.id
                      ? "Added"
                      : "Add"}
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
