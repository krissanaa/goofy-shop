"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
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
  contentPosition?: "center" | "bottom-left"
  textVisibleOnFirstSlideOnly?: boolean
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
  bottomNoteText?: string
  stats?: HeroStat[]
  className?: string
}

interface ParsedCountValue {
  target: number
  decimals: number
  prefix: string
  suffix: string
}

const DEFAULT_HEADING_LINE_1 = "LAOS"
const DEFAULT_HEADING_LINE_2 = "SKATE"
const DEFAULT_HEADING_LINE_3 = "CULTURE"
const DEFAULT_DESCRIPTION = "First skateboard shop & community in Laos"

const DEFAULT_STATS: HeroStat[] = [
  { value: "50+", label: "PRODUCTS", tone: "yellow" },
  { value: "100+", label: "COMMUNITY", tone: "yellow" },
  { value: "20+", label: "VIDEOS", tone: "yellow" },
]

const heroHeadingFontStyle = {
  fontFamily: "var(--font-ui-sans)",
  fontWeight: 900 as const,
  fontStyle: "italic" as const,
}

const heroBodyFontStyle = {
  fontFamily: "var(--font-ui-sans)",
}

const heroBadgeFontStyle = {
  fontFamily: "var(--font-ui-sans)",
}

function getToneColor(tone?: HeroStatTone): string {
  switch (tone) {
    case "red":
      return "var(--color-red)"
    case "blue":
      return "var(--color-blue)"
    case "green":
      return "var(--color-green)"
    case "yellow":
      return "#F8B800"
    case "gray":
      return "var(--color-gray)"
    case "black":
    default:
      return "#F5EFE0"
  }
}

function scrollToHashTarget(href: string) {
  if (!href.startsWith("#")) return

  const id = href.slice(1).trim()
  if (!id) return

  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" })
    return
  }

  window.location.hash = id
}

function parseCountValue(value: string): ParsedCountValue | null {
  const normalized = value.trim()
  if (!normalized) return null

  const match = normalized.match(/-?\d+(\.\d+)?/)
  if (!match || match.index === undefined) return null

  const numberPart = match[0]
  const prefix = normalized.slice(0, match.index)
  const suffix = normalized.slice(match.index + numberPart.length)
  const alphaOnly = `${prefix}${suffix}`.replace(/[+%.\s]/g, "")
  if (/[a-z]/i.test(alphaOnly)) return null

  const target = Number(numberPart)
  if (!Number.isFinite(target)) return null

  const decimals = numberPart.includes(".")
    ? numberPart.split(".")[1].length
    : 0

  return { target, decimals, prefix, suffix }
}

function formatCountValue(parsed: ParsedCountValue, progress: number): string {
  const nextValue = parsed.target * progress
  const rounded =
    parsed.decimals > 0
      ? nextValue.toFixed(parsed.decimals)
      : String(Math.round(nextValue))
  return `${parsed.prefix}${rounded}${parsed.suffix}`
}

function scrollToNextViewport() {
  if (typeof window === "undefined") return
  window.scrollTo({
    top: window.scrollY + window.innerHeight * 0.85,
    behavior: "smooth",
  })
}

export function HeroSection({
  slides = [],
  autoplaySeconds = 6,
  compact = false,
  heightClassName,
  contentPosition = "bottom-left",
  textVisibleOnFirstSlideOnly = true,
  showDots = true,
  showBadge = true,
  showHeading = true,
  showDescription = true,
  showActions = true,
  showStatsRow = true,
  badgeText = "GOOFY LAOS",
  headingLine1 = DEFAULT_HEADING_LINE_1,
  headingLine2 = DEFAULT_HEADING_LINE_2,
  headingLine3 = DEFAULT_HEADING_LINE_3,
  description = DEFAULT_DESCRIPTION,
  primaryAction = { label: "SHOP NOW", href: "/products" },
  secondaryAction = { label: "WATCH US SKATE \u25B6", href: "#videos" },
  bottomNoteText,
  stats = DEFAULT_STATS,
  className,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [parallaxY, setParallaxY] = useState(0)
  const [titleEntered, setTitleEntered] = useState(false)
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
  const statsToRender = useMemo(
    () => (stats.length > 0 ? stats : DEFAULT_STATS).slice(0, 3),
    [stats],
  )
  const [animatedStatValues, setAnimatedStatValues] = useState<string[]>(
    () => statsToRender.map((stat) => stat.value),
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

  useEffect(() => {
    const timer = window.setTimeout(() => setTitleEntered(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        const next = Math.max(-30, Math.min(120, window.scrollY * 0.18))
        setParallaxY(next)
        frame = 0
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  useEffect(() => {
    const parsed = statsToRender.map((stat) => parseCountValue(stat.value))
    let frame = 0
    let startTime: number | null = null
    const durationMs = 1150

    const step = (now: number) => {
      if (startTime === null) startTime = now
      const progress = Math.min((now - startTime) / durationMs, 1)

      setAnimatedStatValues(
        statsToRender.map((stat, index) => {
          const parsedValue = parsed[index]
          return parsedValue
            ? formatCountValue(parsedValue, progress)
            : stat.value
        }),
      )

      if (progress < 1) {
        frame = window.requestAnimationFrame(step)
      }
    }

    frame = window.requestAnimationFrame(step)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [statsToRender])

  const headingLines = [
    {
      text: headingLine1,
      color: "#F5EFE0",
      sizeClass: "text-[clamp(34px,6.6vw,92px)]",
      delayMs: 0,
    },
    {
      text: headingLine2,
      color: "#F8B800",
      sizeClass: "text-[clamp(46px,9.8vw,138px)]",
      delayMs: 150,
    },
    {
      text: headingLine3,
      color: "#F5EFE0",
      sizeClass: "text-[clamp(34px,6.6vw,92px)]",
      delayMs: 300,
    },
  ]
  const showOverlayContent =
    !textVisibleOnFirstSlideOnly ||
    safeSlides.length <= 1 ||
    activeSlide === 0
  const showCompactSlideOverlay =
    textVisibleOnFirstSlideOnly && safeSlides.length > 1 && activeSlide > 0
  const contentPositionClass =
    contentPosition === "bottom-left"
      ? "items-start justify-end text-left"
      : "items-center justify-center text-center"
  const contentMaxWidthClass =
    contentPosition === "bottom-left" ? "max-w-[760px]" : "max-w-[900px]"
  const compactSlideTitle = [headingLine1, headingLine2, headingLine3]
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ")
  const normalizedBottomNoteText = bottomNoteText?.trim()

  const renderBottomNote = (compactOverlay = false) => {
    if (!normalizedBottomNoteText) return null

    const noteClassName = compactOverlay
      ? "mt-3 inline-flex items-center text-[10px] uppercase tracking-[0.16em] text-[#F5EFE0]/66 transition-colors hover:text-[#F8B800]"
      : "mt-5 inline-flex items-center text-[10px] uppercase tracking-[0.16em] text-[#F5EFE0]/62 transition-colors hover:text-[#F8B800]"

    return (
      <p className={cn(noteClassName, "text-left")} style={heroBodyFontStyle}>
        {normalizedBottomNoteText}
      </p>
    )
  }

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[#0A0E1A] text-[#F5EFE0]",
        heroHeightClass,
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        {safeSlides.map((slide, index) => (
          <Image
            key={`${slide.src}-${index}`}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-center transition-opacity duration-700 [transform:scale(1.08)]",
              activeSlide === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,14,26,0.28),rgba(10,14,26,0.66),rgba(10,14,26,0.88))]" />

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-6 pb-20 pt-24 md:px-12 md:pb-24 md:pt-28",
          contentPositionClass,
          heroHeightClass,
        )}
      >
        <div
          className={cn(
            "w-full transition-all duration-500",
            contentMaxWidthClass,
            showOverlayContent
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-6 opacity-0",
          )}
        >
          {showBadge ? (
            <p
              className="mb-6 inline-flex items-center border border-[#F8B800] px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-[#1A1614]"
              style={{
                ...heroBadgeFontStyle,
                backgroundColor: "#F8B800",
              }}
            >
              {badgeText}
            </p>
          ) : null}

          {showHeading ? (
            <h1
              className="uppercase leading-[0.84] tracking-[-0.02em]"
              style={heroHeadingFontStyle}
            >
              {headingLines.map((line) => (
                <span
                  key={line.text}
                  className={cn(
                    "block transition-all duration-700 ease-out",
                    line.sizeClass,
                    titleEntered
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0",
                  )}
                  style={{
                    color: line.color,
                    transitionDelay: `${line.delayMs}ms`,
                  }}
                >
                  {line.text}
                </span>
              ))}
            </h1>
          ) : null}

          {showDescription ? (
            <p
              className="mt-5 max-w-[680px] text-sm leading-relaxed text-[#F5EFE0]/86 md:text-base"
              style={heroBodyFontStyle}
            >
              {description}
            </p>
          ) : null}

          {showActions ? (
            <div
              className={cn(
                "mt-8 flex flex-wrap items-center gap-3",
                contentPosition === "bottom-left"
                  ? "justify-start"
                  : "justify-center",
              )}
              style={heroBodyFontStyle}
            >
              {primaryAction ? (
                primaryAction.href.startsWith("#") ? (
                  <button
                    type="button"
                    onClick={() => scrollToHashTarget(primaryAction.href)}
                    className="inline-flex h-12 items-center justify-center border border-[#F8B800] bg-[#F8B800] px-7 text-xs uppercase tracking-[0.14em] text-[#1A1614] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    {primaryAction.label}
                  </button>
                ) : (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex h-12 items-center justify-center border border-[#F8B800] bg-[#F8B800] px-7 text-xs uppercase tracking-[0.14em] text-[#1A1614] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    {primaryAction.label}
                  </Link>
                )
              ) : null}

              {secondaryAction ? (
                secondaryAction.href.startsWith("#") ? (
                  <button
                    type="button"
                    onClick={() => scrollToHashTarget(secondaryAction.href)}
                    className="inline-flex h-12 items-center justify-center border border-[#F5EFE0]/70 bg-transparent px-7 text-xs uppercase tracking-[0.14em] text-[#F5EFE0] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    {secondaryAction.label}
                  </button>
                ) : (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex h-12 items-center justify-center border border-[#F5EFE0]/70 bg-transparent px-7 text-xs uppercase tracking-[0.14em] text-[#F5EFE0] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    {secondaryAction.label}
                  </Link>
                )
              ) : null}
            </div>
          ) : null}

          {showStatsRow ? (
            <div
              className="mt-10 grid grid-cols-3 gap-5 border-t border-[#F8B800]/35 pt-5 md:gap-9"
              style={heroBodyFontStyle}
            >
              {statsToRender.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className={
                    contentPosition === "bottom-left" ? "text-left" : "text-center"
                  }
                >
                  <p
                    className="text-[clamp(22px,3.6vw,42px)] font-bold tracking-tight"
                    style={{ color: stat.color || getToneColor(stat.tone) }}
                  >
                    {animatedStatValues[index] || stat.value}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#F5EFE0]/75">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {renderBottomNote()}
        </div>

        {showCompactSlideOverlay ? (
          <div
            className={cn(
              "w-full transition-all duration-500",
              contentMaxWidthClass,
              "translate-y-0 opacity-100",
            )}
          >
            <div className="w-full max-w-[420px] border border-[#F8B800]/55 bg-[#0A0E1A]/58 p-4 backdrop-blur-sm">
              <div
                className="flex flex-wrap items-center gap-2"
                style={heroBodyFontStyle}
              >
                <span
                  className="inline-flex items-center border border-[#F8B800] px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] text-[#1A1614]"
                  style={{
                    ...heroBadgeFontStyle,
                    backgroundColor: "#F8B800",
                  }}
                >
                  {badgeText}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#F5EFE0]/72">
                  {String(activeSlide + 1).padStart(2, "0")} / {String(safeSlides.length).padStart(2, "0")}
                </span>
              </div>

              <p
                className="mt-3 text-[clamp(20px,3vw,28px)] uppercase leading-[1] tracking-[-0.03em] text-[#F5EFE0]"
                style={heroHeadingFontStyle}
              >
                {compactSlideTitle}
              </p>

              <p
                className="mt-2 max-w-[320px] text-xs leading-relaxed text-[#F5EFE0]/78"
                style={heroBodyFontStyle}
              >
                {description}
              </p>

              {renderBottomNote(true)}
            </div>
          </div>
        ) : null}
      </div>

      {showDots && safeSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center gap-2">
          {safeSlides.map((slide, index) => (
            <button
              key={`${slide.src}-dot-${index}`}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 border border-[#F8B800] transition",
                activeSlide === index ? "bg-[#F8B800]" : "bg-transparent",
              )}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={scrollToNextViewport}
        aria-label="Scroll down"
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-[#F8B800] transition-colors hover:text-[#F5EFE0]"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </button>
    </section>
  )
}
