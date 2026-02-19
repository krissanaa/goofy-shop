"use client"

import { useState } from "react"
import { products, categories } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Collection
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tighter text-foreground lg:text-5xl">
            All Products
          </h2>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className={`rounded-none text-xs font-bold uppercase tracking-widest ${
                activeCategory === cat
                  ? ''
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">No products found</p>
        </div>
      )}
    </section>
  )
}
