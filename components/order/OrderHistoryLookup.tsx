"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { lookupOrders } from "@/lib/actions/orderActions"
import { formatTrackingDate, type OrderLookupSummary } from "@/lib/order"
import { formatPrice } from "@/lib/utils/format"

interface OrderHistoryLookupProps {
  initialPhone?: string
}

function getStatusTone(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/18 text-emerald-200"
    case "SHIPPED":
      return "bg-sky-500/18 text-sky-200"
    case "PAID":
    case "FULFILLING":
      return "bg-[var(--gold)]/18 text-[var(--gold)]"
    case "CANCELED":
    case "REFUNDED":
      return "bg-rose-500/18 text-rose-200"
    case "PENDING":
    default:
      return "bg-white/10 text-white/60"
  }
}

export function OrderHistoryLookup({
  initialPhone = "",
}: OrderHistoryLookupProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(initialPhone)
  const [orders, setOrders] = useState<OrderLookupSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!initialPhone) {
      setOrders([])
      return
    }

    startTransition(async () => {
      try {
        const response = await lookupOrders(initialPhone)
        setOrders(response)
        setError(null)
      } catch (lookupError) {
        setOrders([])
        setError(
          lookupError instanceof Error ? lookupError.message : "Unable to load orders.",
        )
      }
    })
  }, [initialPhone])

  const handleSubmit = () => {
    const normalizedPhone = phone.trim()
    if (!normalizedPhone) {
      setError("Phone number is required.")
      return
    }

    router.push(`/orders?phone=${encodeURIComponent(normalizedPhone)}`)
  }

  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-24 md:px-10">
      <div className="border-b border-[var(--bordw)] pb-8">
        <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
          GOOFY. / ORDERS
        </p>
        <h1 className="goofy-display mt-2 text-[clamp(38px,5vw,72px)] leading-none text-[var(--white)]">
          Find Your Orders
        </h1>
        <p className="mt-4 max-w-xl goofy-mono text-[10px] leading-[1.8] text-white/55">
          Enter the phone number used at checkout and we will pull every order tied to it.
        </p>
      </div>

      <div className="mt-8 border border-[var(--bordw)] bg-white/[0.02] p-5">
        <label className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
          Phone Number
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="85620xxxxxxxx"
            className="h-12 flex-1 border border-[var(--bordw)] bg-transparent px-4 goofy-mono text-[11px] tracking-[0.08em] text-[var(--white)] outline-none transition-colors placeholder:text-white/18 focus:border-[var(--gold)]"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center bg-[var(--gold)] px-5 goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:bg-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Looking up..." : "Find Orders"}
          </button>
        </div>

        {error ? (
          <p className="mt-3 goofy-mono text-[8px] uppercase tracking-[0.14em] text-rose-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        {initialPhone ? (
          <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
            {orders.length} orders for {initialPhone}
          </p>
        ) : null}

        {initialPhone && !isPending && orders.length === 0 && !error ? (
          <div className="mt-5 border border-[var(--bordw)] bg-white/[0.02] p-5">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
              No orders found for this number.
            </p>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-[var(--bordw)] bg-white/[0.02] p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="goofy-display text-[28px] leading-none text-[var(--white)]">
                    {order.orderNumber}
                  </p>
                  <p className="mt-2 goofy-mono text-[8px] uppercase tracking-[0.16em] text-white/35">
                    {formatTrackingDate(order.createdAt)} / {order.itemCount} items
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="goofy-mono text-[11px] text-[var(--white)]">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.18em] ${getStatusTone(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/order/${order.orderNumber}`}
                    className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--white)] transition-colors hover:text-[var(--gold)]"
                  >
                    View -{">"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
