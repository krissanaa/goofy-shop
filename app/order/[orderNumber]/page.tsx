import Link from "next/link"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { OrderTrackingClient } from "@/components/order/OrderTrackingClient"
import { SearchCommand } from "@/components/search-command"
import { normalizeTrackedOrder } from "@/lib/order"
import { createClient } from "@/lib/supabase/server"

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { orderNumber } = await params
  const client = await createClient()
  const normalizedOrderNumber = orderNumber.toUpperCase()
  const { data } = await client
    .from("orders")
    .select("*")
    .eq("order_number", normalizedOrderNumber)
    .single()

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />

      <div className="px-5 pb-20 pt-24 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          {data ? (
            <OrderTrackingClient
              initialOrder={normalizeTrackedOrder(data as Record<string, unknown>)}
            />
          ) : (
            <section className="mx-auto max-w-2xl border border-[var(--bordw)] bg-white/[0.02] p-8 text-center">
              <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Order Tracking
              </p>
              <h1 className="mt-4 goofy-display text-[clamp(42px,7vw,72px)] leading-none text-[var(--white)]">
                Order Not Found
              </h1>
              <p className="mt-4 goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
                We could not find {normalizedOrderNumber}. Check the number and try again.
              </p>
              <Link
                href="/track"
                className="mt-8 inline-flex h-12 items-center justify-center bg-[var(--gold)] px-6 goofy-display text-[24px] uppercase text-[var(--black)] transition-colors hover:bg-[var(--white)]"
              >
                Track Again
              </Link>
            </section>
          )}
        </div>
      </div>

      <Footer />
      <SearchCommand />
    </main>
  )
}
