"use client"

import Image from "next/image"
import { useState } from "react"
import type { Product } from "@/lib/data"
import { products } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProductCard } from "@/components/product-card"
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[1] || "")
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  const [quantity, setQuantity] = useState(1)

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <div className="pt-16">
      {/* Main product area */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left: Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="group relative aspect-square overflow-hidden bg-secondary">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
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
            </div>
            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`aspect-square overflow-hidden bg-secondary border-2 transition-colors cursor-pointer ${i === 1 ? 'border-primary' : 'border-transparent hover:border-foreground/20'}`}>
                  <Image
                    src={product.image}
                    alt={`${product.name} view ${i}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
              {product.category}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tighter text-foreground lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
              ${product.price}
            </p>

            {/* Stock status */}
            <div className="mt-4 flex items-center gap-2">
              {product.isSoldOut ? (
                <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                  Sold Out
                </span>
              ) : product.stock <= 10 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-widest text-primary">
                    Only {product.stock} left
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    In Stock
                  </span>
                </>
              )}
            </div>

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                  Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
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
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                  Color
                </p>
                <div className="mt-3 flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
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
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                Quantity
              </p>
              <div className="mt-3 flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-11 w-14 items-center justify-center border-x border-border text-sm font-bold tabular-nums text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex gap-3">
              <Button
                disabled={product.isSoldOut}
                size="lg"
                className="flex-1 rounded-none py-6 text-sm font-bold uppercase tracking-widest"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-none border-border py-6 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              >
                <Heart className="h-4 w-4" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </div>

            {/* Description */}
            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Accordions */}
            <div className="mt-8 border-t border-border">
              <Accordion type="single" collapsible>
                <AccordionItem value="specs" className="border-border">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.3em] text-foreground hover:no-underline">
                    Specifications
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Material</span>
                      </div>
                      <div className="text-foreground">Premium Quality</div>
                      <div>
                        <span className="text-muted-foreground">Weight</span>
                      </div>
                      <div className="text-foreground">0.8 kg</div>
                      <div>
                        <span className="text-muted-foreground">Origin</span>
                      </div>
                      <div className="text-foreground">Los Angeles, CA</div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping" className="border-border">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.3em] text-foreground hover:no-underline">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground">
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

      {/* Related products */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">
            You Might Also Like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sticky add to cart */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground">${product.price}</p>
          </div>
          <Button
            disabled={product.isSoldOut}
            className="rounded-none px-6 py-5 text-xs font-bold uppercase tracking-widest"
          >
            {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
