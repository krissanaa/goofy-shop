"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type { CatalogProduct } from "@/lib/types/catalog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react"

interface ProductDetailProps {
  product: CatalogProduct
  showStockWarning?: boolean
  withTopOffset?: boolean
}

const WISHLIST_KEY = "goofy-shop-wishlist-v1"

function parseWishlist(raw: string | null): Set<string> {
  if (!raw) return new Set<string>()

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((value): value is string => typeof value === "string"))
  } catch {
    return new Set<string>()
  }
}

export function ProductDetail({
  product,
  showStockWarning = true,
  withTopOffset = true,
}: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const isOutOfStock = product.isSoldOut || product.stock <= 0

  useEffect(() => {
    if (typeof window === "undefined") return
    const current = parseWishlist(window.localStorage.getItem(WISHLIST_KEY))
    setIsWishlisted(current.has(product.id))
  }, [product.id])

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return
    }

    if (product.sizes?.length && !selectedSize) {
      toast({
        title: "Select a size first",
        description: "Please choose a size before adding this item.",
      })
      return
    }

    if (product.colors?.length && !selectedColor) {
      toast({
        title: "Select a color first",
        description: "Please choose a color before adding this item.",
      })
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
      quantity,
      maxStock: product.stock,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} x${quantity} added to your bag.`,
    })
  }

  const handleToggleWishlist = () => {
    if (typeof window === "undefined") return

    const current = parseWishlist(window.localStorage.getItem(WISHLIST_KEY))
    let nextState = false

    if (current.has(product.id)) {
      current.delete(product.id)
      nextState = false
    } else {
      current.add(product.id)
      nextState = true
    }

    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...current]))
    window.dispatchEvent(new Event("wishlist-updated"))
    setIsWishlisted(nextState)

    toast({
      title: nextState ? "Added to favorites" : "Removed from favorites",
      description: product.name,
    })
  }

  return (
    <div className={`${withTopOffset ? "pt-16" : ""} bg-[var(--color-cream)]`}>
      {/* Main product area */}
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Left: Image gallery */}
          <div className="flex flex-col gap-3 border-4 border-black bg-white p-3 shadow-[4px_4px_0_#0A0A0A]">
            <div className="group relative aspect-square overflow-hidden border-2 border-black bg-[#F8E2E8] transition-shadow duration-150 hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isLimited && !product.isSoldOut && (
                  <Badge className="rounded-none border border-black bg-[#FBD000] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                    Limited
                  </Badge>
                )}
                {product.isSoldOut && (
                  <Badge className="rounded-none border border-black bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Sold Out
                  </Badge>
                )}
              </div>
            </div>
            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`aspect-square cursor-pointer overflow-hidden border-2 bg-white transition-all ${
                    i === 1
                      ? "border-[#E70009] shadow-[2px_2px_0_#0A0A0A]"
                      : "border-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#0A0A0A]"
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} view ${i}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col border-4 border-black bg-[#E6E6E6] p-4 shadow-[4px_4px_0_#0A0A0A] md:p-6">
            <p className="inline-flex w-fit border border-black bg-[#FBD000] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
              {product.category}
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-black md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-4xl font-black tabular-nums text-[#E70009]">
              ${product.price}
            </p>

            {showStockWarning ? (
              <div className="mt-4 flex items-center gap-2">
                {product.isSoldOut ? (
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#E70009]">
                    Sold Out
                  </span>
                ) : product.stock <= 10 ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#E70009]" />
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#E70009]">
                      Only {product.stock} left
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-[#00AA00]" />
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-black/70">
                      In Stock
                    </span>
                  </>
                )}
              </div>
            ) : null}

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                  Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all ${
                        selectedSize === size
                          ? "border-black bg-black text-white shadow-[2px_2px_0_#0A0A0A]"
                          : "border-black bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#0A0A0A]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                  Color
                </p>
                <div className="mt-3 flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`border-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all ${
                        selectedColor === color
                          ? "border-black bg-black text-white shadow-[2px_2px_0_#0A0A0A]"
                          : "border-black bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#0A0A0A]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                Quantity
              </p>
              <div className="mt-3 flex w-fit items-center border-2 border-black bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center text-black transition-colors hover:bg-[#FBD000] disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-11 w-14 items-center justify-center border-x-2 border-black text-sm font-bold tabular-nums text-black">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center text-black transition-colors hover:bg-[#FBD000] disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex gap-3">
              <Button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 rounded-none border-2 border-black bg-black py-6 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_#0A0A0A] transition-all hover:-translate-y-0.5 hover:bg-[#E70009] hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] active:translate-y-0.5 disabled:bg-[#8A8A8A] disabled:text-white"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Sold Out" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                className={`rounded-none border-2 border-black py-6 text-black shadow-[3px_3px_0_#0A0A0A] transition-all hover:-translate-y-0.5 active:translate-y-0.5 ${
                  isWishlisted ? "bg-[#FBD000]" : "bg-white hover:bg-[#FBD000]"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#E70009] text-[#E70009]" : ""}`} />
                <span className="sr-only">Wishlist</span>
              </Button>
            </div>

            {/* Description */}
            <p className="mt-8 border-t-2 border-black pt-6 text-sm leading-relaxed text-black/75">
              {product.description}
            </p>

            {/* Accordions */}
            <div className="mt-6 border-t-2 border-black">
              <Accordion type="single" collapsible>
                <AccordionItem value="specs" className="border-black">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.14em] text-black hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-black/60">Material</span>
                      </div>
                      <div className="text-black">Premium Quality</div>
                      <div>
                        <span className="text-black/60">Weight</span>
                      </div>
                      <div className="text-black">0.8 kg</div>
                      <div>
                        <span className="text-black/60">Origin</span>
                      </div>
                      <div className="text-black">Los Angeles, CA</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping" className="border-black">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.14em] text-black hover:no-underline">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3 text-sm text-black/70">
                      <p>Free shipping on orders over $150. Standard delivery 3-5 business days.</p>
                      <p>Express shipping available at checkout. International shipping to 40+ countries.</p>
                      <p>Returns accepted within 14 days of delivery. Items must be unworn with tags attached.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add to cart */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-black bg-[#E6E6E6] p-4 shadow-[0_-4px_0_#0A0A0A] lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold uppercase text-black">{product.name}</p>
            <p className="text-xs font-bold text-[#E70009]">${product.price}</p>
          </div>
          <Button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="rounded-none border-2 border-black bg-black px-6 py-5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_#0A0A0A] disabled:bg-[#8A8A8A]"
          >
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}
