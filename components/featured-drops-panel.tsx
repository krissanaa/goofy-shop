"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, BellRing } from "lucide-react"
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

const textFontStyle = {
  fontFamily: "var(--font-barlow-condensed), var(--font-space-grotesk), sans-serif",
}

const headingFontStyle = {
  ...textFontStyle,
  fontWeight: 700 as const,
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

function resolveDropPhase(now: number, releaseDate: Date, endDate: Date): DropPhase {
  if (now < releaseDate.getTime()) return "upcoming"
  if (now >= endDate.getTime()) return "ended"
  return "live"
}

function getCountdownUnits(targetDate: Date | null, now: number) {
  const diff = targetDate ? Math.max(targetDate.getTime() - now, 0) : 0
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

function formatCountdownLine(targetDate: Date | null, now: number): string {
  if (!targetDate) return "00:00:00 remaining"
  const diff = Math.max(targetDate.getTime() - now, 0)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  if (days > 0) {
    return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} remaining`
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} remaining`
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

function getPhaseCopy(phase: DropPhase) {
  switch (phase) {
    case "live":
      return {
        eyebrow: "LIVE NOW",
        badgeColor: "#F1B926",
        ctaLabel: "ENTER DROP",
      }
    case "ended":
      return {
        eyebrow: "ARCHIVE",
        badgeColor: "#868A94",
        ctaLabel: "VIEW ARCHIVE",
      }
    case "upcoming":
    default:
      return {
        eyebrow: "UPCOMING",
        badgeColor: "#6C8BFF",
        ctaLabel: "NOTIFY ME",
      }
  }
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

  const releaseDateValue = useMemo(
    () => getValidDate(releaseDate) ?? new Date(Date.now() + 1000 * 60 * 60 * 12),
    [releaseDate],
  )
  const endDateValue = useMemo(
    () => resolveEndDate(releaseDateValue, getValidDate(endDate)),
    [endDate, releaseDateValue],
  )
  const phase = useMemo(
    () => resolveDropPhase(now, releaseDateValue, endDateValue),
    [endDateValue, now, releaseDateValue],
  )
  const countdownTarget = phase === "upcoming" ? releaseDateValue : phase === "live" ? endDateValue : null
  const countdownUnits = useMemo(() => getCountdownUnits(countdownTarget, now), [countdownTarget, now])
  const countdownLine = useMemo(() => formatCountdownLine(countdownTarget, now), [countdownTarget, now])
  const phaseCopy = getPhaseCopy(phase)
  const featureItem = items[0] ?? null
  const railItems = items.length > 1 ? items.slice(1, 4) : items.slice(0, 3)

  return (
    <section className="relative overflow-hidden bg-[#07111F] py-14 text-[#F5EFE0] md:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(241,185,38,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(241,185,38,0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,185,38,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(108,139,255,0.09),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
              style={{
                ...textFontStyle,
                borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: phaseCopy.badgeColor,
              }}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {phaseCopy.eyebrow}
            </div>

            <h2
              className="max-w-[9ch] text-[clamp(3.4rem,7vw,5.8rem)] uppercase leading-[0.84] tracking-[-0.05em]"
              style={headingFontStyle}
            >
              {dropTitle}
            </h2>
          </div>

          <Link
            href="/drop"
            className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
            style={{
              ...textFontStyle,
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(245,239,224,0.62)",
            }}
          >
            View drop
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <article
              className="relative min-h-[560px] overflow-hidden rounded-[30px] border"
              style={{
                borderColor: "rgba(241,185,38,0.14)",
                backgroundColor: "rgba(12,22,37,0.86)",
              }}
            >
              {featureItem?.imageUrl ? (
                <Image
                  src={featureItem.imageUrl}
                  alt={featureItem.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={cn(
                    "object-cover transition duration-500",
                    phase === "ended" ? "grayscale opacity-35" : "opacity-38",
                    phase === "upcoming" ? "scale-[1.03] blur-[1px]" : "",
                  )}
                />
              ) : null}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08)_0%,rgba(7,17,31,0.42)_38%,rgba(7,17,31,0.96)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,185,38,0.08),transparent_42%)]" />

              <p
                className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-[clamp(4.4rem,11vw,8.5rem)] uppercase leading-none tracking-[-0.06em] text-white/5"
                style={headingFontStyle}
              >
                DROP
              </p>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                {showTimer ? (
                  <div className="mb-5 space-y-3">
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                      style={{
                        ...textFontStyle,
                        borderColor: "rgba(241,185,38,0.16)",
                        backgroundColor: "rgba(7,17,31,0.72)",
                        color: "#F1B926",
                      }}
                    >
                      {phase === "upcoming" ? <BellRing className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      {countdownLine}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {countdownUnits.map((unit) => (
                        <div
                          key={unit.label}
                          className="rounded-[18px] border px-4 py-3"
                          style={{
                            borderColor: "rgba(241,185,38,0.16)",
                            backgroundColor: "rgba(7,17,31,0.72)",
                          }}
                        >
                          <p className="text-[1.5rem] uppercase tracking-[-0.04em] text-[#F1B926]" style={headingFontStyle}>
                            {unit.value}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/48" style={textFontStyle}>
                            {unit.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <p className="text-[11px] uppercase tracking-[0.2em] text-white/68" style={textFontStyle}>
                  {sectionHeading} x GOOFY WORLD
                </p>

                <h3
                  className="mt-3 max-w-[8ch] text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-[-0.05em]"
                  style={headingFontStyle}
                >
                  {phase === "upcoming" ? "DROP ACCESS OPENS SOON" : phase === "ended" ? "DROP ARCHIVE OPEN" : "LIMITED EDITION SET"}
                </h3>

                <p
                  className="mt-4 max-w-[34rem] text-[1rem] leading-6"
                  style={{ ...textFontStyle, color: "rgba(245,239,224,0.62)" }}
                >
                  {dropDescription || "Built as a feature drop with tighter rail cards, clearer timing, and limited stock handling."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div
                    className="inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                    style={{
                      ...textFontStyle,
                      borderColor: "rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(7,17,31,0.72)",
                      color: "rgba(245,239,224,0.62)",
                    }}
                  >
                    {formatEnteredCount(enteredCount)} entered
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                    style={{
                      ...textFontStyle,
                      borderColor: "rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(7,17,31,0.72)",
                      color: "rgba(245,239,224,0.62)",
                    }}
                  >
                    {items.length} featured items
                  </div>
                  <Link
                    href="/drop"
                    className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
                    style={{
                      ...textFontStyle,
                      borderColor: phaseCopy.badgeColor,
                      backgroundColor: phaseCopy.badgeColor,
                      color: "#07111F",
                    }}
                  >
                    {phaseCopy.ctaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]/58" style={textFontStyle}>
                Featured rail
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#F5EFE0]/38" style={textFontStyle}>
                {Math.max(railItems.length, featureItem ? 1 : 0)} items
              </p>
            </div>

            {featureItem || railItems.length > 0 ? (
              (railItems.length > 0 ? railItems : featureItem ? [featureItem] : []).map((item, index) => (
                <Link
                  key={`${item.key}-${index}`}
                  href={phase === "upcoming" ? "/drop" : item.href}
                  className="group flex items-stretch gap-4 rounded-[22px] border p-3 transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(12,22,37,0.86)",
                  }}
                >
                  <div
                    className="flex w-20 shrink-0 items-center justify-center rounded-[16px] border px-3 text-[11px] uppercase tracking-[0.14em]"
                    style={{
                      ...textFontStyle,
                      borderColor: "rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      color: "#F1B926",
                    }}
                  >
                    {item.category}
                  </div>

                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div>
                      <p className="text-[1.5rem] uppercase leading-[0.92]" style={{ ...headingFontStyle, color: "#F5EFE0" }}>
                        {item.name}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#F1B926]" style={textFontStyle}>
                        {phase === "upcoming" ? "Reveals on drop" : formatPrice(item.price)}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/46" style={textFontStyle}>
                        {phase === "upcoming"
                          ? "limit 1 per person"
                          : item.isSoldOut
                            ? "sold out"
                            : item.stockQuantity <= 5
                              ? `only ${item.stockQuantity} left`
                              : "limited stock"}
                      </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#F5EFE0]/45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              ))
            ) : (
              <div
                className="rounded-[24px] border border-dashed px-6 py-8 text-center"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(12,22,37,0.86)",
                }}
              >
                <p className="text-sm uppercase tracking-[0.14em] text-white/58" style={textFontStyle}>
                  No featured products found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
