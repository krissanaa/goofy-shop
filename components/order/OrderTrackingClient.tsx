"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { OrderTimeline } from "@/components/order/OrderTimeline"
import { SlipUploadClient } from "@/components/order/SlipUploadClient"
import {
  formatTrackingDate,
  normalizeTrackedOrder,
  type TrackedOrder,
} from "@/lib/order"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils/format"

interface OrderTrackingClientProps {
  initialOrder: TrackedOrder
}

export function OrderTrackingClient({
  initialOrder,
}: OrderTrackingClientProps) {
  const [order, setOrder] = useState<TrackedOrder>(initialOrder)
  const isUnpaid = order.paymentStatus === "UNPAID" || order.paymentStatus === "PENDING"

  useEffect(() => {
    setOrder(initialOrder)
  }, [initialOrder])

  useEffect(() => {
    const channel = supabase
      .channel(`order-status-${order.orderNumber}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_number=eq.${order.orderNumber}`,
        },
        (payload) => {
          if (payload.new) {
            setOrder(normalizeTrackedOrder(payload.new as Record<string, unknown>))
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [order.orderNumber])

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Status Timeline
          </p>
          <div className="mt-6">
            <OrderTimeline status={order.status} />
          </div>

          {order.status === "CANCELED" || order.status === "REFUNDED" ? (
            <p className="mt-5 goofy-mono text-[9px] uppercase tracking-[0.16em] text-rose-300">
              This order is {order.status.toLowerCase()}.
            </p>
          ) : null}
        </section>

        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Customer Info
          </p>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <dt className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/32">
                Name
              </dt>
              <dd className="mt-2 goofy-mono text-[11px] uppercase tracking-[0.12em] text-[var(--white)]">
                {order.customerName}
              </dd>
            </div>
            <div>
              <dt className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/32">
                Phone
              </dt>
              <dd className="mt-2 goofy-mono text-[11px] uppercase tracking-[0.12em] text-[var(--white)]">
                {order.phone}
              </dd>
            </div>
            <div>
              <dt className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/32">
                Email
              </dt>
              <dd className="mt-2 goofy-mono break-all text-[11px] uppercase tracking-[0.12em] text-[var(--white)]">
                {order.email}
              </dd>
            </div>
            <div>
              <dt className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/32">
                City
              </dt>
              <dd className="mt-2 goofy-mono text-[11px] uppercase tracking-[0.12em] text-[var(--white)]">
                {order.city}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/32">
                Address
              </dt>
              <dd className="mt-2 goofy-mono text-[11px] uppercase tracking-[0.12em] text-[var(--white)]">
                {order.address}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Need Help?
          </p>
          <p className="mt-4 goofy-mono text-[10px] uppercase tracking-[0.16em] text-white/36">
            Contact us on LINE, Facebook, or Instagram.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="https://line.me"
              target="_blank"
              className="goofy-mono border border-[var(--bordw)] px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              LINE
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              className="goofy-mono border border-[var(--bordw)] px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Facebook
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="goofy-mono border border-[var(--bordw)] px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Instagram
            </Link>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Order {order.orderNumber}
              </p>
              <h1 className="mt-3 goofy-display text-[clamp(38px,6vw,68px)] leading-none text-[var(--white)]">
                Order Detail
              </h1>
            </div>
            <p className="goofy-mono text-[10px] uppercase tracking-[0.16em] text-white/34">
              Placed {formatTrackingDate(order.createdAt)}
            </p>
          </div>
        </section>

        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Order Details
          </p>

          <div className="mt-5 space-y-4">
            {order.items.length === 0 ? (
              <p className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/34">
                No items recorded on this order.
              </p>
            ) : (
              order.items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 border-b border-[var(--bordw)] pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[#111]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="goofy-display text-[26px] leading-none text-[var(--white)]">
                      {item.name}
                    </p>
                    <p className="mt-2 goofy-mono text-[9px] uppercase tracking-[0.16em] text-white/34">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="goofy-mono shrink-0 text-[12px] text-[var(--white)]">
                    {formatPrice(item.lineTotal)}
                  </p>
                </article>
              ))
            )}
          </div>

          <div className="mt-6 space-y-2 border-t border-[var(--bordw)] pt-4">
            <div className="flex items-center justify-between goofy-mono text-[10px] uppercase tracking-[0.14em] text-white/42">
              <span>Subtotal</span>
              <span className="text-[var(--white)]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between goofy-mono text-[10px] uppercase tracking-[0.14em] text-white/42">
              <span>Shipping</span>
              <span className="text-[var(--white)]">{formatPrice(order.shippingTotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--bordw)] pt-3 goofy-mono text-[11px] uppercase tracking-[0.16em] text-[var(--white)]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="border border-[var(--bordw)] bg-white/[0.02] p-5 md:p-6">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Payment Status
          </p>

          {isUnpaid ? (
            <div className="mt-5 space-y-5">
              <div className="border border-[var(--bordw)] bg-[#111] p-4">
                <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/36">
                  Bank Transfer Details
                </p>
                <div className="mt-4 space-y-2 goofy-mono text-[10px] uppercase tracking-[0.16em] text-[var(--white)]">
                  <p>Bank: BCEL ONE</p>
                  <p>Account: GOOFY SKATE SHOP</p>
                  <p>Number: 0200 123 456 789</p>
                </div>
              </div>

              {order.slipUrl ? (
                <p className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300">
                  Slip already submitted. We will verify it soon.
                </p>
              ) : (
                <SlipUploadClient
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  currentSlipUrl={order.slipUrl}
                  onUploaded={(slipUrl) =>
                    setOrder((current) => ({
                      ...current,
                      slipUrl,
                    }))
                  }
                />
              )}
            </div>
          ) : (
            <p className="mt-5 goofy-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
              Payment confirmed.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
