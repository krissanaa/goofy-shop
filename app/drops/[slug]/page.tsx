import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { Countdown } from "@/components/drops/Countdown"
import { NotifyBtn } from "@/components/drops/NotifyBtn"
import { ProductCard } from "@/components/shop/ProductCard"
import { formatDropDate, normalizeDropEvent } from "@/lib/drops"
import { createClient } from "@/lib/supabase/server"

interface DropDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getDropBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("drop_events")
    .select("*, drop_event_products(product_id, products(*))")
    .eq("slug", slug)
    .single()

  if (!data) {
    return null
  }

  return normalizeDropEvent(data as Record<string, unknown>)
}

export async function generateMetadata({
  params,
}: DropDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const drop = await getDropBySlug(slug)

  return {
    title: drop ? `${drop.title} - GOOFY. Skate` : "Drop Not Found - GOOFY. Skate",
  }
}

export default async function DropDetailPage({
  params,
}: DropDetailPageProps) {
  const { slug } = await params
  const drop = await getDropBySlug(slug)

  if (!drop) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />

      <section className="relative overflow-hidden border-b border-[var(--bordw)] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#090909,#121212)]" />
        {drop.coverImage || drop.teaserImage ? (
          <Image
            src={drop.coverImage || drop.teaserImage || "/placeholder.jpg"}
            alt={drop.title}
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.2),rgba(10,10,10,0.84))]" />

        <div className="relative mx-auto max-w-[1480px] px-5 py-16 md:px-10 md:py-24">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            GOOFY. DROP
          </p>
          <h1 className="goofy-display mt-4 max-w-5xl text-[clamp(48px,9vw,132px)] leading-[0.82] text-[var(--white)]">
            {drop.title}
          </h1>
          <p className="mt-5 goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {drop.status === "active" ? "NOW LIVE" : formatDropDate(drop.dropDate)}
          </p>

          {drop.status === "upcoming" ? (
            <div className="mt-8 max-w-4xl space-y-5">
              <Countdown targetDate={drop.dropDate} />
              <NotifyBtn dropId={drop.id} />
            </div>
          ) : null}

          {drop.status === "active" ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-3 border border-[var(--gold)] bg-[var(--gold)]/12 px-4 py-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--gold)] sale-dot-pulse" />
                NOW LIVE
              </span>
              <Link
                href="#drop-products"
                className="goofy-mono inline-flex items-center bg-[var(--gold)] px-5 py-3 text-[9px] uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:bg-[var(--white)]"
              >
                Shop Now -{">"}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section id="drop-products" className="mx-auto max-w-[1480px] px-5 py-16 md:px-10">
        <div className="mb-8">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            The Drop
          </p>
          <h2 className="goofy-display mt-2 text-[clamp(34px,4vw,56px)] leading-none text-[var(--white)]">
            Release Lineup
          </h2>
        </div>

        {drop.products.length === 0 ? (
          <p className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            Products for this drop have not been linked yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {drop.products.map((product, index) =>
              drop.status === "upcoming" ? (
                <div key={product.id} className="relative">
                  <div className="pointer-events-none blur-[2px] grayscale">
                    <ProductCard product={product} view="grid" index={index} />
                  </div>
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/46 text-center">
                    <span className="goofy-mono px-4 text-[9px] uppercase tracking-[0.18em] text-[var(--white)]">
                      Available {formatDropDate(drop.dropDate)}
                    </span>
                  </div>
                </div>
              ) : (
                <ProductCard
                  key={product.id}
                  product={product}
                  view="grid"
                  index={index}
                />
              ),
            )}
          </div>
        )}
      </section>

      <section className="border-y border-[var(--bordw)] bg-white/[0.02]">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-10">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Editorial
          </p>
          <div className="mt-5 max-w-4xl goofy-mono text-[11px] leading-[2] text-white/68">
            {drop.description}
          </div>
        </div>
      </section>

      <Footer />
      <SearchCommand />
    </main>
  )
}
