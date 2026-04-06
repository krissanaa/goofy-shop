"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import UseAnimations from "react-useanimations"
import activity from "react-useanimations/lib/activity"
import arrowUp from "react-useanimations/lib/arrowUp"
import explore from "react-useanimations/lib/explore"
import star from "react-useanimations/lib/star"
import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageHeroSlide,
} from "@/lib/homepage-content"
import { attachMagneticEffect } from "@/lib/gsap-magnetic"
import { supabase } from "@/lib/supabase"

type HeroSlide = {
  id: number
  tag: string
  leftLines: string[]
  leftHighlight: number
  leftOutline: number
  leftSub: string
  leftCTA: { label: string; href: string }
  leftMeta: string
  rightBg?: string
  rightTag: string
  rightTitle: string
  rightCTA: { label: string; href: string }
  rightCTAGold?: boolean
}

type BannerRow = {
  id?: number | string
  image_url?: string | null
  tag?: string | null
  title?: string | null
  cta_text?: string | null
  cta_link?: string | null
  order?: number | null
  active?: boolean | null
}

const SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "Vol.01 · Spring 2026 · Vientiane",
    leftLines: ["The", "Streets", "Are", "Ours"],
    leftHighlight: 3,
    leftOutline: 1,
    leftSub: "ຮ້ານສະເກັດທຳອິດໃນລາວ — Est. 2026",
    leftCTA: { label: "Explore Issue", href: "/shop" },
    leftMeta: "Vientiane · Laos / First Skate Shop",
    rightBg: undefined,
    rightTag: "Active Drop",
    rightTitle: "Spring Drop 001",
    rightCTA: { label: "Shop The Drop", href: "/drops/spring-001" },
  },
  {
    id: 2,
    tag: "New Arrivals · Spring 2026",
    leftLines: ["Fresh", "Decks", "Just", "Landed"],
    leftHighlight: 3,
    leftOutline: 1,
    leftSub: "Premium hardware — built for the street",
    leftCTA: { label: "Shop Decks", href: "/shop?category=deck" },
    leftMeta: "Decks · Trucks · Wheels",
    rightBg: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=900&q=80",
    rightTag: "New In",
    rightTitle: "Fresh Decks In",
    rightCTA: { label: "Shop Decks", href: "/shop?category=deck" },
  },
  {
    id: 3,
    tag: "Limited Collab Drop",
    leftLines: ["Goofy", "×", "Local", "Artist"],
    leftHighlight: 3,
    leftOutline: 1,
    leftSub: "Limited edition — Vientiane x Goofy",
    leftCTA: { label: "View Collab", href: "/shop?badge=COLLAB" },
    leftMeta: "Apparel · Limited Edition",
    rightBg: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=900&q=80",
    rightTag: "Collab",
    rightTitle: "Goofy × Local Artist",
    rightCTA: { label: "View Collab", href: "/shop?badge=COLLAB" },
    rightCTAGold: true,
  },
  {
    id: 4,
    tag: "Community · Vientiane",
    leftLines: ["Skate", "Every", "Damn", "Day"],
    leftHighlight: 3,
    leftOutline: 1,
    leftSub: "Join the community — Vientiane streets",
    leftCTA: { label: "Find Spots", href: "/parks" },
    leftMeta: "Parks · Videos · Community",
    rightBg: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=900&q=80",
    rightTag: "Community",
    rightTitle: "Vientiane Streets",
    rightCTA: { label: "Find Spots", href: "/parks" },
  },
]

const editorialEase = [0.16, 1, 0.3, 1] as const

gsap.registerPlugin(ScrollTrigger, useGSAP)

function splitTitleIntoLines(title: string) {
  const words = title
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)

  if (words.length >= 4) {
    return [words[0], words[1], words[2], words.slice(3).join(" ")]
  }

  if (words.length === 3) {
    return [words[0], words[1], words[2], words[2]]
  }

  if (words.length === 2) {
    return [words[0], words[1], words[0], words[1]]
  }

  if (words.length === 1) {
    return [words[0], words[0], words[0], words[0]]
  }

  return ["The", "Streets", "Are", "Ours"]
}

function mapHomepageSlideToHeroSlide(
  slide: HomepageHeroSlide,
  index: number,
): HeroSlide {
  const leftLines =
    slide.leftTitleLines.length > 0
      ? slide.leftTitleLines
      : splitTitleIntoLines(slide.rightTitle)

  return {
    id: index + 1,
    tag: slide.tag,
    leftLines,
    leftHighlight: Math.max(0, leftLines.length - 1),
    leftOutline: leftLines.length > 1 ? 1 : 0,
    leftSub: slide.leftSubtitle,
    leftCTA: {
      label: slide.leftCtaLabel,
      href: slide.leftCtaHref,
    },
    leftMeta: slide.leftMeta,
    rightBg: slide.rightImage ?? undefined,
    rightTag: slide.rightTag,
    rightTitle: slide.rightTitle,
    rightCTA: {
      label: slide.rightCtaLabel,
      href: slide.rightCtaHref,
    },
    rightCTAGold: slide.rightCtaGold,
  }
}

const DEFAULT_SLIDES = DEFAULT_HOMEPAGE_CONTENT.heroSlides.map(mapHomepageSlideToHeroSlide)

function mapBannerToSlide(row: BannerRow, index: number): HeroSlide {
  const title = row.title?.trim() || `Banner ${index + 1}`
  const ctaLabel = row.cta_text?.trim() || "Explore Issue"
  const ctaHref = row.cta_link?.trim() || "/shop"

  return {
    id: Number(row.id ?? index + 1),
    tag: row.tag?.trim() || title,
    leftLines: splitTitleIntoLines(title),
    leftHighlight: 3,
    leftOutline: 1,
    leftSub: "Goofy Street Culture — Vientiane",
    leftCTA: {
      label: ctaLabel,
      href: ctaHref,
    },
    leftMeta: "Goofy Homepage Banner",
    rightBg: row.image_url?.trim() || undefined,
    rightTag: row.tag?.trim() || "Featured",
    rightTitle: title,
    rightCTA: {
      label: ctaLabel,
      href: ctaHref,
    },
  }
}

function getOutlineStyle(isOutline: boolean): CSSProperties | undefined {
  if (!isOutline) return undefined

  return {
    WebkitTextStroke: "1.5px var(--hero-outline-color, var(--white))",
    color: "transparent",
  }
}

function getTagIcon(slideId: number): ReactNode {
  if (slideId === 1) {
    return <UseAnimations animation={activity} size={16} strokeColor="#F0B429" loop autoplay />
  }

  if (slideId === 3) {
    return (
      <UseAnimations
        animation={star}
        size={16}
        strokeColor="#F0B429"
        fillColor="#F0B429"
        loop
        autoplay
      />
    )
  }

  if (slideId === 4) {
    return <UseAnimations animation={explore} size={16} strokeColor="#F0B429" loop autoplay />
  }

  return null
}

function ChevronIcon({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <span className={mirrored ? "inline-flex rotate-180" : "inline-flex"}>
      <UseAnimations animation={arrowUp} size={20} strokeColor="#F4F0EB" />
    </span>
  )
}

function NudgeArrow() {
  return (
    <motion.span
      aria-hidden="true"
      className="inline-flex"
      animate={{ x: [0, 12, 0] }}
      transition={{ duration: 1.15, ease: "easeInOut", repeat: Infinity }}
      style={{ willChange: "transform" }}
    >
      <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
    </motion.span>
  )
}

export function HeroSlider({
  fallbackSlides = DEFAULT_HOMEPAGE_CONTENT.heroSlides,
}: {
  fallbackSlides?: HomepageHeroSlide[]
}) {
  const router = useRouter()
  const timer = useRef<NodeJS.Timeout | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const resolvedFallbackSlides = useMemo(
    () =>
      (fallbackSlides.length > 0 ? fallbackSlides : DEFAULT_HOMEPAGE_CONTENT.heroSlides).map(
        mapHomepageSlideToHeroSlide,
      ),
    [fallbackSlides],
  )
  const [slides, setSlides] = useState<HeroSlide[]>(resolvedFallbackSlides.length > 0 ? resolvedFallbackSlides : SLIDES)
  const [current, setCurrent] = useState(0)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const heroCopy = section.querySelector<HTMLElement>("[data-hero-copy]")
      const heroMedia = section.querySelector<HTMLElement>("[data-hero-media]")
      const heroBackground = section.querySelector<HTMLElement>("[data-hero-background]")
      const heroGhost = section.querySelector<HTMLElement>("[data-hero-ghost]")
      const magneticTargets = gsap.utils.toArray<HTMLElement>("[data-magnetic]", section)

      const magneticCleanups = magneticTargets.map((element) =>
        attachMagneticEffect(element, { strength: 0.18, duration: 0.28 }),
      )

      gsap.set(
        [heroCopy, heroMedia, heroBackground, heroGhost].filter(Boolean),
        { force3D: true },
      )

      if (heroCopy) {
        gsap.fromTo(
          heroCopy,
          { y: 0, opacity: 1 },
          {
            y: -220,
            opacity: 0.36,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1.8,
            },
          },
        )
      }

      if (heroGhost) {
        gsap.fromTo(
          heroGhost,
          { y: 0, scale: 1, rotate: 0 },
          {
            y: 120,
            scale: 1.12,
            rotate: -3,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1.8,
            },
          },
        )
      }

      if (heroBackground) {
        gsap.fromTo(
          heroBackground,
          { y: 0, scale: 1.06 },
          {
            y: 140,
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1.8,
            },
          },
        )
      }

      if (heroMedia) {
        gsap.fromTo(
          heroMedia,
          { y: 0, rotate: 0 },
          {
            y: -84,
            rotate: -1.2,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1.8,
            },
          },
        )
      }

      ScrollTrigger.refresh()

      return () => {
        magneticCleanups.forEach((cleanup) => cleanup())
      }
    },
    { scope: sectionRef, dependencies: [current] },
  )

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()

    if (slides.length <= 1) return

    timer.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
  }, [clearTimer, slides.length])

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(() => {
        clearTimer()
        return ((idx % slides.length) + slides.length) % slides.length
      })

      startTimer()
    },
    [clearTimer, slides.length, startTimer],
  )

  useEffect(() => {
    setSlides(resolvedFallbackSlides)
    setCurrent(0)
  }, [resolvedFallbackSlides])

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [clearTimer, startTimer])

  useEffect(() => {
    if (!slides.length) return
    setCurrent((prev) => prev % slides.length)
  }, [slides.length])

  useEffect(() => {
    let cancelled = false

    async function loadBanners() {
      const { data, error } = await supabase
        .from("banners")
        .select("id, image_url, tag, title, cta_text, cta_link, order, active")
        .eq("active", true)
        .order("order", { ascending: true })

      if (cancelled || error || !data?.length) {
        return
      }

      const mappedSlides = (data as BannerRow[]).map(mapBannerToSlide)
      if (mappedSlides.length > 0) {
        setSlides(mappedSlides)
        setCurrent(0)
      }
    }

    void loadBanners()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const activeSlide = useMemo(
    () => slides[current] ?? resolvedFallbackSlides[0] ?? SLIDES[0] ?? DEFAULT_SLIDES[0],
    [current, resolvedFallbackSlides, slides],
  )
  const isCollabSlide = activeSlide.id === 3

  return (
    <motion.section
      ref={sectionRef}
      className="group relative overflow-hidden bg-transparent text-black [--hero-outline-color:#050505] transition-colors duration-500 dark:text-[var(--white)] dark:[--hero-outline-color:var(--white)]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: editorialEase }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="grid min-h-[calc(100vh-76px)] lg:grid-cols-2">
        <motion.div
          className="relative overflow-hidden border-r border-[var(--bordw)]"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: editorialEase, delay: 0.1 }}
          style={{ willChange: "transform, opacity" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              data-hero-copy
              className="absolute inset-0 flex flex-col justify-between px-5 py-8 md:px-10 lg:py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ willChange: "transform, opacity" }}
            >
              <div
                data-hero-ghost
                className="pointer-events-none absolute right-[-8%] top-1/2 hidden -translate-y-1/2 select-none goofy-display text-[clamp(7rem,19vw,18rem)] leading-none tracking-[-0.08em] text-black/[0.07] transition-colors duration-500 dark:text-white/[0.045] lg:block"
              >
                GOOFY
              </div>

              <div className="space-y-8">
                <motion.div
                  className="goofy-mono inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.55, ease: editorialEase, delay: 0.08 }}
                >
                  <span className="h-px w-8 bg-[var(--gold)]" />
                  {getTagIcon(activeSlide.id)}
                  <span>{activeSlide.tag}</span>
                </motion.div>

                <div className="space-y-0">
                  {activeSlide.leftLines.map((line, index) => {
                    const isOutline = index === activeSlide.leftOutline
                    const isHighlight = index === activeSlide.leftHighlight

                    return (
                      <motion.h1
                        key={`${activeSlide.id}-${index}-${line}`}
                        className={`goofy-display text-[clamp(64px,9vw,140px)] leading-[0.83] ${
                          isHighlight
                            ? "text-[var(--gold)]"
                            : "text-black transition-colors duration-500 dark:text-[var(--white)]"
                        }`}
                        style={getOutlineStyle(isOutline)}
                        initial={{ opacity: 0, y: 88, skewY: 4 }}
                        animate={{ opacity: 1, y: 0, skewY: 0 }}
                        exit={{ opacity: 0, y: -28 }}
                        transition={{
                          duration: 0.72,
                          ease: editorialEase,
                          delay: 0.12 + index * 0.09,
                        }}
                      >
                        {line || "\u00A0"}
                      </motion.h1>
                    )
                  })}
                </div>

                <motion.p
                  className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-black/42 transition-colors duration-500 dark:text-white/12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.38 }}
                >
                  {activeSlide.leftSub}
                </motion.p>
              </div>

              <motion.div
                className="mt-10 flex flex-col gap-5 border-t border-[var(--bordw)] pt-6 md:flex-row md:items-end md:justify-between"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.42 }}
              >
                <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-black/62 transition-colors duration-500 dark:text-white/38">
                  {activeSlide.leftMeta}
                </p>

                <Link href={activeSlide.leftCTA.href}>
                  <motion.span
                    data-magnetic
                    className={`goofy-btn inline-flex ${
                      isCollabSlide
                        ? "bg-[var(--gold)] text-[var(--black)] hover:bg-[var(--white)]"
                        : "bg-black text-white hover:bg-[var(--gold)] hover:text-[var(--black)] dark:bg-[var(--white)] dark:text-[var(--black)] dark:hover:bg-[var(--gold)]"
                    }`}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>{activeSlide.leftCTA.label}</span>
                      <NudgeArrow />
                    </span>
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          data-hero-media
          className="relative hidden overflow-hidden lg:block"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: editorialEase, delay: 0.2 }}
          style={{ willChange: "transform, opacity" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`right-${activeSlide.id}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => router.push(activeSlide.rightCTA.href)}
            >
              {activeSlide.rightBg ? (
                <>
                  <motion.div
                    data-hero-background
                    className="homepage-media-fade absolute inset-0"
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    style={{ willChange: "transform, opacity" }}
                  >
                    <Image
                      src={activeSlide.rightBg}
                      alt={activeSlide.rightTitle}
                      fill
                      priority
                      sizes="50vw"
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ willChange: "opacity" }}
                  />
                </>
              ) : (
                <div
                  data-hero-background
                  className="homepage-media-fade absolute inset-0 bg-[linear-gradient(135deg,#1a1208,#080808)]"
                  style={{ willChange: "transform" }}
                >
                  <motion.div
                    className="goofy-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(100px,18vw,260px)] leading-none text-black/[0.08] transition-colors duration-500 dark:text-white/[0.025]"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: editorialEase }}
                  >
                    GOOFY
                  </motion.div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 z-10 p-7 pb-11">
                <motion.div
                  className="goofy-mono inline-flex items-center gap-2 bg-[var(--gold)] px-2.5 py-1 text-[7px] uppercase tracking-[0.18em] text-[var(--black)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                >
                  {activeSlide.id === 1 ? (
                    <UseAnimations animation={activity} size={14} strokeColor="#0A0A0A" loop autoplay />
                  ) : null}
                  <span>{activeSlide.rightTag}</span>
                </motion.div>

                <motion.h2
                  className="goofy-display mt-3 text-[clamp(32px,4vw,58px)] leading-[0.86] text-[var(--white)]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.45, ease: editorialEase, delay: 0.28 }}
                >
                  {activeSlide.rightTitle}
                </motion.h2>

                <motion.button
                  type="button"
                  data-magnetic
                  className={`goofy-btn mt-5 inline-flex ${
                    activeSlide.rightCTAGold
                      ? "bg-[var(--gold)] text-[var(--black)] hover:bg-[var(--white)]"
                      : "bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gold)]"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, delay: 0.38 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={(event) => {
                    event.stopPropagation()
                    router.push(activeSlide.rightCTA.href)
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{activeSlide.rightCTA.label}</span>
                    <NudgeArrow />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => {
          const isActive = index === current

          return (
            <motion.button
              key={slide.id}
              type="button"
              className="relative h-[2px] w-7 cursor-pointer overflow-hidden rounded-sm bg-black/24 transition-colors duration-500 dark:bg-white/20"
              style={{ transformOrigin: "center" }}
              whileHover={{ scaleY: 2 }}
              transition={{ duration: 0.2 }}
              onClick={() => goTo(index)}
            >
              {isActive ? (
                <motion.div
                  key={`dot-${slide.id}-${current}`}
                  className="h-full bg-[var(--gold)]"
                  initial={{ width: "0%" }}
                  animate={{
                    width: "100%",
                    boxShadow: ["0 0 0px #F0B429", "0 0 8px #F0B429", "0 0 0px #F0B429"],
                  }}
                  transition={{
                    width: { duration: 5, ease: "linear" },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              ) : (
                <div className="h-full w-0 bg-[var(--gold)]" />
              )}
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        data-magnetic
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-black/10 bg-white/78 text-black/55 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black dark:border-white/10 dark:bg-white/[0.07] dark:text-white/55 dark:hover:bg-white/15 dark:hover:text-white"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.18 }}
        onClick={() => goTo(current - 1)}
      >
        <ChevronIcon mirrored />
      </motion.button>

      <motion.button
        type="button"
        data-magnetic
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm border border-black/10 bg-white/78 text-black/55 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black dark:border-white/10 dark:bg-white/[0.07] dark:text-white/55 dark:hover:bg-white/15 dark:hover:text-white"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.18 }}
        onClick={() => goTo(current + 1)}
      >
        <ChevronIcon />
      </motion.button>
    </motion.section>
  )
}
