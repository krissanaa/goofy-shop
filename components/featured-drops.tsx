import { featuredDropProducts } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { CountdownTimer } from "@/components/countdown-timer"

export function FeaturedDrops() {
  const dropDate = new Date("2026-03-01T17:00:00Z")

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Left: Info + Countdown */}
        <div className="flex flex-col justify-center lg:w-1/3">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Featured Drop
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tighter text-foreground lg:text-5xl text-balance">
            Shadow Series
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Our most anticipated collection yet. Limited quantities, no restocks. When it&apos;s gone, it&apos;s gone.
          </p>
          <div className="mt-8">
            <CountdownTimer targetDate={dropDate} variant="card" />
          </div>
        </div>

        {/* Right: Product grid */}
        <div className="grid grid-cols-2 gap-4 lg:w-2/3 lg:gap-6">
          {featuredDropProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
