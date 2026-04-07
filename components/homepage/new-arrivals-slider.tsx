"use client"

import Image from "next/image"
import Link from "next/link"
import { type MouseEvent, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useCart } from "@/hooks/use-cart"
import type { HomeCategoryProduct } from "@/components/homepage/category-showcase"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface NewArrivalsSliderProps {
  products: HomeCategoryProduct[]
}

/* ── Helpers (unchanged) ── */

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  DECKS: "linear-gradient(135deg, #20170A 0%, #080808 100%)",
  TRUCKS: "linear-gradient(135deg, #0B1220 0%, #080808 100%)",
  WHEELS: "linear-gradient(135deg, #130C1C 0%, #080808 100%)",
  SHOES: "linear-gradient(135deg, #091510 0%, #080808 100%)",
  APPAREL: "linear-gradient(135deg, #150D18 0%, #080808 100%)",
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getFallbackBackground(product: HomeCategoryProduct) {
  return (
      CATEGORY_BACKGROUNDS[product.categoryLabel] ??
      "linear-gradient(135deg, #141414 0%, #050505 100%)"
  )
}

function getRibbonLabel(product: HomeCategoryProduct) {
  const badge = product.badge.toUpperCase()
  if (badge === "NEW") return "JUST DROPPED"
  if (badge === "HOT") return "HOT PICK"
  if (badge === "SALE") return "PRICE CUT"
  if (badge === "DROP") return "LIMITED DROP"
  if (badge === "COLLAB") return "COLLAB ISSUE"
  return "FRESH STOCK"
}

function getSku(product: HomeCategoryProduct, index: number) {
  const parts = product.slug.split("-").filter(Boolean).slice(0, 3).map((p) => p.slice(0, 2).toUpperCase())
  const core = parts.length > 0 ? parts.join("") : "GF"
  return `GF-${core}-${String(index + 1).padStart(3, "0")}`
}

function getOptionLabels(product: HomeCategoryProduct) {
  const cat = product.categoryLabel.toUpperCase()
  if (cat.includes("DECK")) return ['8.0"', '8.25"', '8.5"', '8.75"']
  if (cat.includes("TRUCK")) return ["139", "144", "149", "159"]
  if (cat.includes("WHEEL")) return ["52MM", "54MM", "56MM", "58MM"]
  if (cat.includes("SHOE")) return ["US 8", "US 9", "US 10", "US 11"]
  if (cat.includes("APPAREL")) return ["S", "M", "L", "XL"]
  return ["STD", "PRO", "TEAM", "DLX"]
}

/* ── Main component ── */

export function NewArrivalsSlider({ products }: NewArrivalsSliderProps) {
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const handleAddToCart = (
      event: MouseEvent<HTMLButtonElement>,
      product: HomeCategoryProduct,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (product.stock <= 0) return
    setAddingId(product.id)
    addItem({
      productId: product.slug,
      name: product.name,
      category: product.categoryLabel,
      image: product.image || "/placeholder.jpg",
      price: product.price,
      quantity: 1,
      maxStock: Math.max(product.stock, 1),
    })
    window.setTimeout(() => {
      setAddingId((c) => (c === product.id ? null : c))
    }, 900)
  }

  useGSAP(
      () => {
        const el = sectionRef.current
        const track = trackRef.current
        if (!el || !track) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const cards = gsap.utils.toArray<HTMLElement>("[data-arrival-card]", el)
        if (!cards.length) return

        /* ── Section header reveal ── */
        const header = el.querySelector<HTMLElement>("[data-arrivals-header]")
        if (header) {
          gsap.fromTo(header,
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          )
        }

        /* ── 3D card stack entrance: each card fans in from stacked position ── */
        cards.forEach((card, i) => {
          const startRotate = -12 + i * 4
          const startX = -60 + i * 20
          gsap.fromTo(card,
              { opacity: 0, rotateZ: startRotate, x: startX, y: 80, scale: 0.85 },
              {
                opacity: 1, rotateZ: 0, x: 0, y: 0, scale: 1,
                duration: 0.9, ease: "power3.out", delay: 0.1 + i * 0.1,
                scrollTrigger: { trigger: el, start: "top 75%", once: true },
              },
          )
        })

        /* ── Horizontal scroll scrub (desktop only) ── */
        const mm = gsap.matchMedia()
        mm.add("(min-width: 768px)", () => {
          const totalScroll = track.scrollWidth - track.clientWidth
          if (totalScroll <= 0) return

          gsap.to(track, {
            scrollLeft: totalScroll,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 20%",
              end: () => `+=${totalScroll}`,
              scrub: 1.5,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
        })

        /* ── Magnetic hover per card ── */
        const cleanups = cards.map((card) => {
          const inner = card.querySelector<HTMLElement>("[data-card-inner]")

          const handleMove = (e: PointerEvent) => {
            if (!inner) return
            const rect = card.getBoundingClientRect()
            const xPct = (e.clientX - rect.left) / rect.width - 0.5
            const yPct = (e.clientY - rect.top) / rect.height - 0.5
            gsap.to(inner, {
              rotateY: xPct * 6,
              rotateX: yPct * -6,
              scale: 1.04,
              boxShadow: `${xPct * -20}px ${yPct * 20}px 40px rgba(240,180,41,0.15)`,
              duration: 0.4, ease: "power2.out", overwrite: true,
            })
          }

          const handleLeave = () => {
            if (!inner) return
            gsap.to(inner, {
              rotateY: 0, rotateX: 0, scale: 1,
              boxShadow: "-8px 8px 0px #EE3A24",
              duration: 0.5, ease: "power3.out", overwrite: true,
            })
          }

          card.addEventListener("pointermove", handleMove)
          card.addEventListener("pointerleave", handleLeave)
          return () => {
            card.removeEventListener("pointermove", handleMove)
            card.removeEventListener("pointerleave", handleLeave)
          }
        })

        /* ── Shimmer on ribbons ── */
        const ribbons = gsap.utils.toArray<HTMLElement>("[data-ribbon]", el)
        ribbons.forEach((ribbon) => {
          gsap.fromTo(ribbon,
              { backgroundPosition: "-200% 0" },
              {
                backgroundPosition: "200% 0", duration: 3, ease: "none",
                repeat: -1, repeatDelay: 2,
              },
          )
        })

        return () => cleanups.forEach((fn) => fn())
      },
      { scope: sectionRef, dependencies: [products] },
  )

  return (
      <section ref={sectionRef} className="relative overflow-hidden bg-transparent px-4 py-28 text-black transition-colors duration-500 dark:text-white md:px-12">
        {/* ── Background textures ── */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(245,245,245,0)_100%)] transition-colors duration-500 dark:bg-[linear-gradient(180deg,#050505_0%,#0a0a0c_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.8)_0.6px,transparent_0.8px)] [background-size:9px_9px] dark:[background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9)_0.6px,transparent_0.8px)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.14),transparent_62%)]" />

        <div className="mx-auto max-w-[1480px]">
          {/* ── Header ── */}
          <div data-arrivals-header className="relative z-10 mb-14 flex items-end justify-between gap-5">
            <div className="space-y-3">
              <p className="goofy-mono text-[10px] uppercase tracking-[0.3em] text-[#C42D1A] dark:text-[#EE3A24]">
                JUST LANDED // FRESH WOOD
              </p>
              <h2 className="goofy-display text-[clamp(42px,6vw,80px)] italic leading-[0.84] text-black dark:text-white">
                New Arrivals
              </h2>
              <div className="h-[2px] w-24 bg-gradient-to-r from-[#EE3A24] to-transparent" />
            </div>
            <Link
                href="/shop"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/68 transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#EE3A24]"
            >
              Shop All -{">"}
            </Link>
          </div>

          {/* ── Horizontal track ── */}
          <div
              ref={trackRef}
              className="relative z-10 flex snap-x gap-8 overflow-x-auto px-2 py-6 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
          >
            {products.map((product, index) => (
                <article
                    key={product.id}
                    data-arrival-card
                    className="w-[306px] shrink-0 snap-start md:w-[328px]"
                    style={{ perspective: "1200px" }}
                >
                  <div className="group/card">
                    <div
                        data-card-inner
                        className="relative h-[440px] w-full overflow-hidden rounded-[4px] border-2 border-[#050505] bg-[#F4F0EB] shadow-[-8px_8px_0px_#EE3A24] transition-shadow duration-500"
                        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                    >
                      <Link href={product.href} aria-label={product.name} className="absolute inset-0 z-10" />

                      {/* ── Shimmer ribbon ── */}
                      <div
                          data-ribbon
                          className="absolute left-[-36px] top-[18px] z-20 rotate-[-45deg] border border-dashed border-black/20 px-10 py-1 goofy-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black"
                          style={{
                            background: "linear-gradient(90deg, #EE3A24 0%, #EE3A24 40%, #ff8a7a 50%, #EE3A24 60%, #EE3A24 100%)",
                            backgroundSize: "200% 100%",
                          }}
                      >
                        {getRibbonLabel(product)}
                      </div>

                      <div className="flex h-full flex-col justify-between">
                        {/* ── Product image ── */}
                        <div className="relative h-[260px] overflow-hidden border-b-2 border-[#050505] bg-white">
                          {product.image ? (
                              <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 306px, 328px"
                                  className="object-cover transition duration-700 group-hover/card:scale-[1.06]"
                              />
                          ) : (
                              <div className="absolute inset-0" style={{ background: getFallbackBackground(product) }} />
                          )}
                        </div>

                        {/* ── Product info ── */}
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="goofy-mono text-[10px] uppercase tracking-[0.12em] text-black/60">
                              SKU: {getSku(product, index)}
                            </p>
                            <h3 className="mt-1 text-[24px] leading-none text-[#050505] goofy-display italic uppercase">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <p className="goofy-mono text-[20px] font-bold text-[#050505]">
                              {formatPrice(product.price)}
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] text-[#050505] transition-colors duration-300 group-hover/card:bg-[#050505] group-hover/card:text-[#F4F0EB]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                          </svg>
                        </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Quick-add overlay (slides up on hover) ── */}
                      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full border-t-2 border-[#050505] bg-[#EE3A24] p-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:translate-y-0">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="goofy-mono text-[9px] uppercase tracking-[0.14em] text-black/60">
                              {product.categoryLabel} · {product.stock > 0 ? `${product.stock} left` : "sold out"}
                            </p>
                            <p className="goofy-display mt-0.5 text-lg italic uppercase text-[#050505]">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <button
                              type="button"
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={product.stock <= 0}
                              className="relative z-30 bg-[#050505] px-5 py-3 goofy-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4F0EB] transition-colors hover:bg-white hover:text-[#050505] disabled:cursor-not-allowed disabled:bg-black/35 disabled:text-black/40"
                          >
                            {product.stock <= 0
                                ? "Sold Out"
                                : addingId === product.id
                                    ? "Added ✓"
                                    : "Add +"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
            ))}
          </div>

          {/* ── Scroll hint ── */}
          <div className="relative z-10 mt-6 flex items-center justify-center gap-3 md:hidden">
            <div className="h-[1px] w-8 bg-black/20 dark:bg-white/20" />
            <p className="goofy-mono text-[9px] uppercase tracking-[0.3em] text-black/40 dark:text-white/30">
              Swipe to explore
            </p>
            <div className="h-[1px] w-8 bg-black/20 dark:bg-white/20" />
          </div>
        </div>
      </section>
  )
}