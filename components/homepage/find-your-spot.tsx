"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageFallbackSpot,
} from "@/lib/homepage-content"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type FindYourSpotItem = HomepageFallbackSpot

function getVisibleSpots(
    spots: FindYourSpotItem[],
    fallbackSpots: FindYourSpotItem[],
) {
  const filled = [...spots]
  while (filled.length < 4) filled.push(fallbackSpots[filled.length])
  return filled.slice(0, 4)
}

/* ── Scattered entrance origins per card ── */
const SCATTER_FROM = [
  { x: -80, y: 60, rotate: -6 },
  { x: 40, y: 90, rotate: 4 },
  { x: -50, y: 70, rotate: 3 },
  { x: 70, y: 80, rotate: -5 },
]

export function FindYourSpot({
                               spots,
                               fallbackSpots = DEFAULT_HOMEPAGE_CONTENT.fallbackSpots,
                             }: {
  spots: FindYourSpotItem[]
  fallbackSpots?: FindYourSpotItem[]
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const visibleSpots = getVisibleSpots(spots, fallbackSpots)

  useGSAP(
      () => {
        const el = sectionRef.current
        if (!el) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const cards = gsap.utils.toArray<HTMLElement>("[data-spot-card]", el)
        if (!cards.length) return

        /* ── Section title: clip reveal + line expand ── */
        const title = el.querySelector<HTMLElement>("[data-spot-title]")
        const titleLine = el.querySelector<HTMLElement>("[data-spot-title-line]")
        const titleSub = el.querySelector<HTMLElement>("[data-spot-sub]")

        if (title) {
          gsap.fromTo(title,
              { opacity: 0, y: 60, skewY: 3 },
              { opacity: 1, y: 0, skewY: 0, duration: 1, ease: "power4.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          )
        }
        if (titleLine) {
          gsap.fromTo(titleLine,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: "power3.inOut", delay: 0.3,
                scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          )
        }
        if (titleSub) {
          gsap.fromTo(titleSub,
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.5,
                scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          )
        }

        /* ── Scattered card entrance ── */
        cards.forEach((card, i) => {
          const from = SCATTER_FROM[i % SCATTER_FROM.length]
          gsap.fromTo(card,
              { opacity: 0, x: from.x, y: from.y, rotate: from.rotate, scale: 0.88 },
              {
                opacity: 1, x: 0, y: 0, rotate: 0, scale: 1,
                duration: 1, ease: "power3.out", delay: 0.15 + i * 0.12,
                scrollTrigger: { trigger: el, start: "top 75%", once: true },
              },
          )
        })

        /* ── Per-card parallax on scroll ── */
        cards.forEach((card, i) => {
          const img = card.querySelector<HTMLElement>("[data-spot-img]")
          if (!img) return
          const speed = 20 + (i % 3) * 15
          gsap.fromTo(img,
              { y: -speed },
              { y: speed, ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 } },
          )
        })

        /* ── 3D tilt hover + GSAP effects ── */
        const cleanups = cards.map((card) => {
          const img = card.querySelector<HTMLElement>("[data-spot-img]")
          const name = card.querySelector<HTMLElement>("[data-spot-name]")
          const cta = card.querySelector<HTMLElement>("[data-spot-cta]")
          const info = card.querySelector<HTMLElement>("[data-spot-info]")
          const cornerTL = card.querySelector<HTMLElement>("[data-corner-tl]")
          const cornerBR = card.querySelector<HTMLElement>("[data-corner-br]")
          const cardInner = card.querySelector<HTMLElement>("[data-spot-inner]")

          /* 3D tilt on mouse move */
          const handleMove = (e: MouseEvent) => {
            if (!cardInner) return
            const rect = card.getBoundingClientRect()
            const xPct = (e.clientX - rect.left) / rect.width - 0.5
            const yPct = (e.clientY - rect.top) / rect.height - 0.5
            gsap.to(cardInner, {
              rotateY: xPct * 8,
              rotateX: yPct * -8,
              duration: 0.4,
              ease: "power2.out",
              overwrite: true,
            })
          }

          const enter = () => {
            if (img) gsap.to(img, { scale: 1.12, filter: "brightness(0.72) grayscale(0)", duration: 0.8, ease: "power2.out", overwrite: true })
            if (name) gsap.to(name, { color: "#EE3A24", letterSpacing: "0.04em", duration: 0.35, overwrite: true })
            if (info) gsap.to(info, { y: -28, duration: 0.4, ease: "power2.out", overwrite: true })
            if (cta) gsap.to(cta, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", overwrite: true })
            /* Corner brackets expand */
            if (cornerTL) gsap.to(cornerTL, { opacity: 1, width: 40, height: 40, duration: 0.4, ease: "power2.out", overwrite: true })
            if (cornerBR) gsap.to(cornerBR, { opacity: 1, width: 40, height: 40, duration: 0.4, ease: "power2.out", overwrite: true })
          }

          const leave = () => {
            if (img) gsap.to(img, { scale: 1, filter: "brightness(0.4) grayscale(1)", duration: 0.6, ease: "power3.out", overwrite: true })
            if (name) gsap.to(name, { color: "#ffffff", letterSpacing: "0em", duration: 0.3, overwrite: true })
            if (info) gsap.to(info, { y: 0, duration: 0.35, ease: "power3.out", overwrite: true })
            if (cta) gsap.to(cta, { y: 18, opacity: 0, duration: 0.25, overwrite: true })
            if (cornerTL) gsap.to(cornerTL, { opacity: 0, width: 32, height: 32, duration: 0.3, overwrite: true })
            if (cornerBR) gsap.to(cornerBR, { opacity: 0, width: 32, height: 32, duration: 0.3, overwrite: true })
            if (cardInner) gsap.to(cardInner, { rotateY: 0, rotateX: 0, duration: 0.5, ease: "power3.out", overwrite: true })
          }

          card.addEventListener("pointerenter", enter)
          card.addEventListener("pointerleave", leave)
          card.addEventListener("pointermove", handleMove)

          return () => {
            card.removeEventListener("pointerenter", enter)
            card.removeEventListener("pointerleave", leave)
            card.removeEventListener("pointermove", handleMove)
          }
        })

        return () => cleanups.forEach((fn) => fn())
      },
      { scope: sectionRef, dependencies: [visibleSpots] },
  )

  return (
      <section ref={sectionRef} className="bg-transparent px-6 py-28 md:px-12">
        <div className="mx-auto max-w-[1480px]">
          {/* ── New header layout: stacked with accent line ── */}
          <div className="mb-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p data-spot-sub className="goofy-mono mb-3 text-[10px] uppercase tracking-[0.4em] text-[#EE3A24]">
                  Vientiane Skate Spots
                </p>
                <h2
                    data-spot-title
                    className="text-6xl font-black uppercase italic leading-[0.85] text-black transition-colors duration-500 dark:text-white md:text-8xl"
                    style={{ fontFamily: "var(--font-ui-sans)" }}
                >
                  FIND YOUR<br />
                  <span className="text-[#EE3A24]">SPOT</span>
                </h2>
              </div>
              <Link
                  href="/skateparks"
                  className="w-fit font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/72 transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#EE3A24]"
              >
                View All Spots -{">"}
              </Link>
            </div>
            <div
                data-spot-title-line
                className="mt-6 h-[2px] w-full origin-left bg-gradient-to-r from-[#EE3A24] via-[#EE3A24]/40 to-transparent"
            />
          </div>

          {/* ── Asymmetric grid: 1 large + 3 small ── */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:grid-rows-2">
            {visibleSpots.map((spot, index) => {
              const gridClass =
                  index === 0
                      ? "md:col-span-7 md:row-span-2 h-[420px] md:h-full"
                      : "md:col-span-5 h-[220px] md:h-auto"

              return (
                  <article
                      key={spot.id}
                      data-spot-card
                      className={`relative ${gridClass}`}
                      style={{ perspective: "800px" }}
                  >
                    <a
                        href={spot.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-spot-inner
                        className="relative block h-full w-full overflow-hidden border border-black/10 bg-white/35 shadow-[0_16px_40px_rgba(5,5,5,0.08)] transition-colors duration-500 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
                        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                    >
                      {spot.image ? (
                          <div
                              data-spot-img
                              className="absolute inset-0"
                              style={{ willChange: "transform, filter" }}
                          >
                            <Image
                                src={spot.image}
                                alt={spot.name}
                                fill
                                sizes={index === 0 ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 42vw"}
                                className="object-cover brightness-[0.4] grayscale"
                            />
                          </div>
                      ) : (
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,#646464,#2b2b2b)] dark:bg-[linear-gradient(135deg,#2d2d2d,#111111)]" />
                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.05),rgba(5,5,5,0.36)_68%,rgba(5,5,5,0.82)_100%)]" />

                      {/* ── Card number badge ── */}
                      <div className="absolute right-5 top-5 z-10 goofy-mono text-[10px] tracking-[0.2em] text-white/40">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="absolute inset-0 flex items-end p-6">
                        <div data-spot-info className="space-y-3" style={{ willChange: "transform" }}>
                          <h3
                              data-spot-name
                              className={`max-w-[92%] font-black uppercase italic leading-none text-white ${
                                  index === 0 ? "text-5xl md:text-6xl" : "text-2xl md:text-3xl"
                              }`}
                              style={{ fontFamily: "var(--font-ui-sans)" }}
                          >
                            {spot.name}
                          </h3>

                          <div data-spot-cta className="translate-y-[18px] opacity-0">
                            <div className="inline-flex items-center rounded-sm bg-[#EE3A24] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                              VIEW ON MAPS -{">"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-corner-tl className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#EE3A24] opacity-0" />
                      <div data-corner-br className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#EE3A24] opacity-0" />
                    </a>
                  </article>
              )
            })}
          </div>
        </div>
      </section>
  )
}

export default FindYourSpot