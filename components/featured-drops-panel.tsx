"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, BellRing, Clock3, Package2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type DropPhase = "upcoming" | "live" | "ended"

export interface FeaturedDropItem {
  key: string
  href: string
  imageUrl: string | null
  imageAlt: string
  category: string
  name: string
  price: number
  stockQuantity: number
  isLimited: boolean
  isSoldOut: boolean
}

interface FeaturedDropsPanelProps {
  sectionHeading: string
  dropTitle: string
  dropDescription?: string | null
  releaseDate: string
  endDate?: string | null
  enteredCount?: number | null
  showTimer: boolean
  items: FeaturedDropItem[]
}

interface CountdownUnit {
  label: string
  value: string
}

const headingFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 900 as const,
  fontStyle: "italic" as const,
}

const bodyFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const badgeFontStyle = {
  fontFamily: "'Press Start 2P', var(--font-mono), monospace",
}

function getValidDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function resolveEndDate(releaseDate: Date, endDate?: Date | null): Date {
  if (endDate) return endDate
  return new Date(releaseDate.getTime() + 1000 * 60 * 60 * 24 * 2)
}

function resolveDropPhase(now: Date, releaseDate: Date, endDate?: Date | null): DropPhase {
  if (now.getTime() < releaseDate.getTime()) return "upcoming"

  if (endDate && now.getTime() >= endDate.getTime()) {
    return "ended"
  }

  return "live"
}

function getCountdownUnits(targetDate: Date | null): CountdownUnit[] {
  if (!targetDate) {
    return [
      { label: "Days", value: "00" },
      { label: "Hours", value: "00" },
      { label: "Minutes", value: "00" },
      { label: "Seconds", value: "00" },
    ]
  }

  const diff = Math.max(targetDate.getTime() - Date.now(), 0)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return [
    { label: "Days", value: String(days).padStart(2, "0") },
    { label: "Hours", value: String(hours).padStart(2, "0") },
    { label: "Minutes", value: String(minutes).padStart(2, "0") },
    { label: "Seconds", value: String(seconds).padStart(2, "0") },
  ]
}

function formatEnteredCount(value?: number | null): string {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(safeValue)))
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusCopy(phase: DropPhase) {
  switch (phase) {
    case "live":
      return {
        label: "DROP LIVE",
        countdownLabel: "Drop closes in",
        ctaLabel: "ENTER DROP NOW",
        ctaClassName:
          "border-[#E52222] bg-[#E52222] text-[#F5EFE0] hover:bg-[#c61c1c]",
      }
    case "ended":
      return {
        label: "DROP ENDED",
        countdownLabel: "Drop closed",
        ctaLabel: "DROP ENDED",
        ctaClassName:
          "border-[#4A4A57] bg-[#4A4A57] text-[#C4C0B7] cursor-not-allowed",
      }
    case "upcoming":
    default:
      return {
        label: "UPCOMING",
        countdownLabel: "Drop opens in",
        ctaLabel: "NOTIFY ME",
        ctaClassName:
          "border-[#F8B800] bg-transparent text-[#F8B800] hover:bg-[#F8B800] hover:text-[#1A1614]",
      }
  }
}

function getStockCopy(item: FeaturedDropItem, phase: DropPhase) {
  if (phase === "upcoming") {
    return "Unlocks at drop"
  }

  if (item.isSoldOut) {
    return "Sold out"
  }

  if (item.stockQuantity > 0 && item.stockQuantity <= 5) {
    return `Only ${item.stockQuantity} left`
  }

  if (item.isLimited) {
    return "Limited stock"
  }

  return "Ready to ship"
}

export function FeaturedDropsPanel({
  sectionHeading,
  dropTitle,
  dropDescription,
  releaseDate,
  endDate,
  enteredCount,
  showTimer,
  items,
}: FeaturedDropsPanelProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const releaseDateValue = useMemo(() => {
    return getValidDate(releaseDate) ?? new Date(Date.now() + 1000 * 60 * 60 * 12)
  }, [releaseDate])
  const endDateValue = useMemo(() => {
    const parsedEndDate = getValidDate(endDate)
    return parsedEndDate ?? resolveEndDate(releaseDateValue)
  }, [endDate, releaseDateValue])
  const phase = useMemo(
    () => resolveDropPhase(new Date(now), releaseDateValue, endDateValue),
    [endDateValue, now, releaseDateValue],
  )
  const countdownTarget = phase === "upcoming" ? releaseDateValue : phase === "live" ? endDateValue : null
  const countdownUnits = useMemo(
    () => getCountdownUnits(countdownTarget),
    [countdownTarget, now],
  )
  const statusCopy = getStatusCopy(phase)

  return (
    <section className="relative overflow-hidden bg-[#0A0E1A] py-14 text-[#F5EFE0] md:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,184,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(248,184,0,0.045) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,184,0,0.12),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(92,148,252,0.08),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center border border-[#F8B800] bg-[#F8B800] px-3 py-2 text-[8px] uppercase tracking-[0.14em] text-[#1A1614]"
                style={badgeFontStyle}
              >
                {sectionHeading.toUpperCase()}
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-[0.16em]",
                  phase === "live"
                    ? "border-[#F8B800]/60 bg-[#F8B800]/10 text-[#F8B800]"
                    : phase === "ended"
                      ? "border-[#6B6B77] bg-[#232733] text-[#C4C0B7]"
                      : "border-[#5C94FC]/50 bg-[#5C94FC]/10 text-[#D7E3FF]",
                )}
                style={bodyFontStyle}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    phase === "live"
                      ? "animate-pulse bg-[#F8B800]"
                      : phase === "ended"
                        ? "bg-[#6B6B77]"
                        : "bg-[#5C94FC]",
                  )}
                />
                {statusCopy.label}
              </span>
            </div>

            <div className="space-y-4">
              <h2
                className="max-w-[12ch] text-[clamp(2.7rem,7vw,5.6rem)] uppercase leading-[0.86] tracking-[-0.04em] text-[#F5EFE0]"
                style={headingFontStyle}
              >
                {dropTitle}
              </h2>

              {dropDescription ? (
                <p
                  className="max-w-[38rem] text-sm leading-7 text-[#F5EFE0]/76 md:text-[15px]"
                  style={bodyFontStyle}
                >
                  {dropDescription}
                </p>
              ) : null}
            </div>

            {showTimer ? (
              <div className="border border-[#F8B800]/30 bg-[#10131B] p-5 shadow-[0_0_0_1px_rgba(248,184,0,0.04)]">
                <div
                  className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#F8B800]"
                  style={bodyFontStyle}
                >
                  <Clock3 className="h-4 w-4" />
                  {statusCopy.countdownLabel}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {countdownUnits.map((unit) => (
                    <div
                      key={unit.label}
                      className="border border-[#F8B800]/25 bg-[#0A0E1A] px-4 py-4 text-center"
                    >
                      <p
                        className="text-3xl font-semibold tracking-[-0.04em] text-[#F8B800] md:text-4xl"
                        style={bodyFontStyle}
                      >
                        {unit.value}
                      </p>
                      <p
                        className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#F5EFE0]/62"
                        style={bodyFontStyle}
                      >
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className="flex flex-wrap items-center gap-5 text-[12px] uppercase tracking-[0.14em] text-[#F5EFE0]/72"
              style={bodyFontStyle}
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-[#F8B800]" />
                {formatEnteredCount(enteredCount)} entered
              </span>
              <span className="inline-flex items-center gap-2">
                <Package2 className="h-4 w-4 text-[#F8B800]" />
                {items.length} featured items
              </span>
            </div>

            {phase === "ended" ? (
              <span
                className={cn(
                  "inline-flex h-12 items-center justify-center border px-6 text-xs uppercase tracking-[0.16em]",
                  statusCopy.ctaClassName,
                )}
                style={bodyFontStyle}
              >
                {statusCopy.ctaLabel}
              </span>
            ) : (
              <Link
                href="/drop"
                className={cn(
                  "inline-flex h-12 items-center gap-2 border px-6 text-xs uppercase tracking-[0.16em] transition-colors",
                  statusCopy.ctaClassName,
                )}
                style={bodyFontStyle}
              >
                {phase === "upcoming" ? <BellRing className="h-4 w-4" /> : null}
                {statusCopy.ctaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3
                className="text-lg uppercase tracking-[0.12em] text-[#F8B800]"
                style={bodyFontStyle}
              >
                Featured Items
              </h3>
              <p
                className="text-[11px] uppercase tracking-[0.16em] text-[#F5EFE0]/52"
                style={bodyFontStyle}
              >
                {phase === "upcoming"
                  ? "Locked until the timer hits zero"
                  : phase === "ended"
                    ? "Archive view"
                    : "Live stock status"}
              </p>
            </div>

            {items.length === 0 ? (
              <div className="border border-dashed border-[#F8B800]/25 bg-[#111111] p-8 text-center text-sm text-[#F5EFE0]/60">
                No featured products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((item) => {
                  const stockCopy = getStockCopy(item, phase)
                  const cardClasses =
                    "group block border border-[#2B2B33] bg-[#111111] transition-colors hover:border-[#F8B800]/65"

                  const cardInner = (
                    <>
                      <div className="relative aspect-[4/4.6] overflow-hidden border-b border-[#2B2B33] bg-[#16181F]">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.imageAlt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className={cn(
                              "object-cover transition duration-500 group-hover:scale-[1.03]",
                              phase === "ended" ? "grayscale opacity-55" : "",
                              phase === "upcoming" ? "scale-[1.02] blur-[1px] opacity-62" : "",
                            )}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1F2430,#0D1016)]" />
                        )}

                        {phase === "upcoming" ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0E1A]/36">
                            <span
                              className="border border-[#F8B800]/40 bg-[#0A0E1A]/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[#F8B800]"
                              style={bodyFontStyle}
                            >
                              Unlocks at drop
                            </span>
                          </div>
                        ) : null}

                        {item.isSoldOut ? (
                          <span
                            className="absolute left-3 top-3 border border-[#E52222] bg-[#E52222] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#F5EFE0]"
                            style={bodyFontStyle}
                          >
                            Sold Out
                          </span>
                        ) : item.isLimited ? (
                          <span
                            className="absolute left-3 top-3 border border-[#F8B800] bg-[#F8B800] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#1A1614]"
                            style={bodyFontStyle}
                          >
                            Limited
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="space-y-1">
                          <p
                            className="text-[11px] uppercase tracking-[0.16em] text-[#F5EFE0]/45"
                            style={bodyFontStyle}
                          >
                            {phase === "upcoming" ? item.category : item.category}
                          </p>
                          <h4 className="text-base font-semibold leading-snug text-[#F5EFE0]">
                            {phase === "upcoming" ? item.name : item.name}
                          </h4>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          <p
                            className={cn(
                              "text-sm uppercase tracking-[0.12em]",
                              phase === "upcoming" ? "text-[#F5EFE0]/70" : "text-[#F8B800]",
                            )}
                            style={bodyFontStyle}
                          >
                            {phase === "upcoming" ? "Reveals on drop" : formatPrice(item.price)}
                          </p>
                          <p
                            className={cn(
                              "text-right text-[11px] uppercase tracking-[0.16em]",
                              item.isSoldOut
                                ? "text-[#E52222]"
                                : stockCopy.includes("Only")
                                  ? "text-[#F8B800]"
                                  : "text-[#F5EFE0]/55",
                            )}
                            style={bodyFontStyle}
                          >
                            {stockCopy}
                          </p>
                        </div>
                      </div>
                    </>
                  )

                  if (phase === "upcoming") {
                    return (
                      <div key={item.key} className={cardClasses}>
                        {cardInner}
                      </div>
                    )
                  }

                  return (
                    <Link key={item.key} href={item.href} className={cardClasses}>
                      {cardInner}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
