"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type HeroStatTone = "red" | "blue" | "green" | "yellow" | "black" | "gray"

export interface HeroSlide {
  src: string
  alt: string
}

export interface HeroStat {
  value: string
  label: string
  tone?: HeroStatTone
  color?: string
}

interface HeroAction {
  label: string
  href: string
}

export interface HeroSectionProps {
  slides?: HeroSlide[]
  autoplaySeconds?: number
  compact?: boolean
  heightClassName?: string
  showDots?: boolean
  showBadge?: boolean
  showHeading?: boolean
  showDescription?: boolean
  showActions?: boolean
  showStatsRow?: boolean
  badgeText?: string
  headingLine1?: string
  headingLine2?: string
  headingLine3?: string
  description?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  stats?: HeroStat[]
  className?: string
}

const DEFAULT_HEADING_LINE_1 = "BUILT FOR THE"
const DEFAULT_HEADING_LINE_2 = "STREETS."
const DEFAULT_HEADING_LINE_3 = "WORN BY THE CULTURE."
const DEFAULT_DESCRIPTION =
  "Premium skate hardware and streetwear essentials. Limited drops, exclusive collabs, zero compromises."

const DEFAULT_STATS: HeroStat[] = [
  { value: "500+", label: "PRODUCTS", tone: "red" },
  { value: "12K+", label: "SKATERS", tone: "blue" },
  { value: "100%", label: "AUTHENTIC", tone: "green" },
]

function getToneColor(tone?: HeroStatTone): string {
  switch (tone) {
    case "red":
      return "var(--color-red)"
    case "blue":
      return "var(--color-blue)"
    case "green":
      return "var(--color-green)"
    case "yellow":
      return "var(--color-yellow)"
    case "gray":
      return "var(--color-gray)"
    case "black":
    default:
      return "var(--color-black)"
  }
}

export function HeroSection({
  slides = [],
  autoplaySeconds = 6,
  compact = false,
  heightClassName,
  showDots = true,
  showBadge = true,
  showHeading = true,
  showDescription = true,
  showActions = true,
  showStatsRow = true,
  badgeText = "SS26 COLLECTION",
  headingLine1 = DEFAULT_HEADING_LINE_1,
  headingLine2 = DEFAULT_HEADING_LINE_2,
  headingLine3 = DEFAULT_HEADING_LINE_3,
  description = DEFAULT_DESCRIPTION,
  primaryAction,
  secondaryAction,
  stats = DEFAULT_STATS,
  className,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const heroHeightClass =
    heightClassName && heightClassName.trim().length > 0
      ? heightClassName
      : compact
        ? "min-h-[72vh] md:min-h-[76vh] lg:min-h-[82vh]"
        : "min-h-screen"

  const safeSlides = useMemo(
    () => slides.filter((slide) => Boolean(slide.src)),
    [slides],
  )

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return
    }

    const intervalMs = Math.min(Math.max(autoplaySeconds, 2), 20) * 1000
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % safeSlides.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [autoplaySeconds, safeSlides.length])

  useEffect(() => {
    if (activeSlide > safeSlides.length - 1) {
      setActiveSlide(0)
    }
  }, [activeSlide, safeSlides.length])

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[var(--color-cream)]",
        heroHeightClass,
        className,
      )}
    >
      <div className="absolute inset-0">
        {safeSlides.map((slide, index) => (
          <Image
            key={`${slide.src}-${index}`}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-700",
              activeSlide === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(240,237,232,0.22),rgba(240,237,232,0.08),rgba(240,237,232,0.2))]" />
      <div className="pointer-events-none absolute -top-[18%] left-1/2 -translate-x-1/2 select-none text-[24vw] font-black uppercase leading-none tracking-[-0.05em] text-[var(--color-black)] opacity-[0.08]">
        GOOFY
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-6 py-16 text-center md:px-12 md:py-18",
          heroHeightClass,
        )}
      >
        {showBadge ? (
          <p className="mb-5 inline-flex items-center rounded-[999px] border border-[rgba(10,10,10,0.2)] bg-[var(--color-yellow)] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-black)]">
            {`* ${badgeText}`}
          </p>
        ) : null}

        {showHeading ? (
          <h1 className="font-black uppercase leading-[0.92] tracking-tight text-[clamp(36px,5vw,72px)]">
            <span className="block text-[var(--color-black)]">{headingLine1}</span>
            <span className="block text-[var(--color-red)]">{headingLine2}</span>
            <span className="block text-[var(--color-blue)]">{headingLine3}</span>
          </h1>
        ) : null}

        {showDescription ? (
          <p className="mt-6 max-w-[680px] text-base leading-relaxed text-[var(--color-gray)]">
            {description}
          </p>
        ) : null}

        {showActions ? (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="inline-flex h-12 items-center justify-center gap-2 border border-[var(--color-black)] bg-[var(--color-red)] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-white)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <Zap className="h-4 w-4" />
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}

            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex h-12 items-center justify-center border border-[var(--color-black)] bg-[var(--color-white)] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-black)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {showStatsRow ? (
          <div className="mt-12 grid grid-cols-3 gap-8">
            {(stats.length > 0 ? stats : DEFAULT_STATS).slice(0, 3).map((stat, index) => (
              <div key={`${stat.label}-${index}`} className="text-center">
                <p
                  className="text-4xl font-black tracking-tight"
                  style={{ color: stat.color || getToneColor(stat.tone) }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-gray)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showDots && safeSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-7 z-20 flex items-center justify-center gap-2">
          {safeSlides.map((slide, index) => (
            <button
              key={`${slide.src}-dot-${index}`}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 border border-[var(--color-black)] transition",
                activeSlide === index
                  ? "bg-[var(--color-red)]"
                  : "bg-[var(--color-white)]/80",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

