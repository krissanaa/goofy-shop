import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { FeaturedDrops } from "@/components/featured-drops"
import { ProductGrid } from "@/components/product-grid"
import { SearchCommand } from "@/components/search-command"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Marquee ticker */}
      <div className="overflow-hidden border-y border-border bg-secondary py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-8 text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">
              Free Shipping Over $150
              <span className="mx-8 text-primary/40">{'///'}</span>
              New Drop March 1
              <span className="mx-8 text-primary/40">{'///'}</span>
              Limited Stock Available
              <span className="mx-8 text-primary/40">{'///'}</span>
              1 Per Customer
            </span>
          ))}
        </div>
      </div>

      <FeaturedDrops />

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="h-px bg-border" />
      </div>

      <ProductGrid />
      <Footer />
      <SearchCommand />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  )
}
