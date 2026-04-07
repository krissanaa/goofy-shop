"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type HomeCategoryKey = "decks" | "trucks" | "wheels" | "shoes" | "apparel" | (string & {})
export type HomeCategoryVariant = "hero" | "stack" | "landscape" | "wide"

export type HomeCategoryProduct = {
  id: string; slug: string; name: string; category: string; categoryLabel: string
  image: string | null; price: number; stock: number; badge: string; edition: string; href: string
}

export type HomeCategoryData = {
  key: HomeCategoryKey; name: string; slug: string; href?: string
  layoutVariant?: HomeCategoryVariant; backgroundImage?: string | null; image?: string | null
  products: HomeCategoryProduct[]
}

const FALLBACK_IMAGES: Record<string, string> = {
  decks: "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=1200",
  trucks: "https://images.unsplash.com/photo-1620012253972-e1e3b62f43ce?auto=format&fit=crop&q=80&w=1200",
  wheels: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=1200",
  shoes: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200",
  apparel: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200",
}

function getCardLayout(category: HomeCategoryData, index: number) {
  if (category.key === "decks") return { gridClasses: "md:col-span-7 md:row-span-2 min-h-[340px] md:min-h-[420px]", titleSize: "text-6xl md:text-[7rem]" }
  if (category.key === "trucks") return { gridClasses: "md:col-span-5 md:row-span-1 min-h-[160px] md:min-h-[200px]", titleSize: "text-4xl md:text-5xl" }
  if (category.key === "wheels") return { gridClasses: "md:col-span-5 md:row-span-1 min-h-[160px] md:min-h-[200px]", titleSize: "text-4xl md:text-5xl" }
  if (category.key === "shoes") return { gridClasses: "md:col-span-4 md:row-span-1 min-h-[160px] md:min-h-[200px]", titleSize: "text-4xl md:text-5xl" }
  if (category.key === "apparel") return { gridClasses: "md:col-span-8 md:row-span-1 min-h-[160px] md:min-h-[200px]", titleSize: "text-4xl md:text-5xl" }
  if (category.layoutVariant === "hero") return { gridClasses: "md:col-span-7 md:row-span-2 min-h-[340px] md:min-h-[420px]", titleSize: "text-6xl md:text-[7rem]" }
  if (category.layoutVariant === "wide") return { gridClasses: "md:col-span-8 md:row-span-1 min-h-[160px] md:min-h-[200px]", titleSize: "text-4xl md:text-5xl" }
  return {
    gridClasses: index % 3 === 0 ? "md:col-span-6 md:row-span-1 min-h-[180px] md:min-h-[220px]" : "md:col-span-3 md:row-span-1 min-h-[160px] md:min-h-[200px]",
    titleSize: "text-4xl md:text-5xl",
  }
}

function getCardImage(c: HomeCategoryData) { return c.backgroundImage ?? c.image ?? c.products[0]?.image ?? FALLBACK_IMAGES[c.key] ?? FALLBACK_IMAGES.decks }
function getCardHref(c: HomeCategoryData) { return c.href ?? `/shop?category=${c.slug}` }

export function HomeCategoryShowcase({ categories }: { categories: HomeCategoryData[] }) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useGSAP(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const cards = gsap.utils.toArray<HTMLElement>("[data-category-card]", el)
    if (!cards.length) return

    /* ── Stagger reveal ── */
    gsap.set(cards, { opacity: 0, y: 56, scale: 0.94 })
    gsap.to(cards, {
      opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
    })

    /* ── Hover effects ── */
    const cleanups = cards.map((card) => {
      const image = card.querySelector<HTMLElement>("[data-card-bg]")
      const overlay = card.querySelector<HTMLElement>("[data-card-overlay]")
      const title = card.querySelector<HTMLElement>("[data-card-title]")
      const cta = card.querySelector<HTMLElement>("[data-card-cta]")

      const enter = () => {
        if (image) gsap.to(image, { scale: 1.12, filter: "brightness(0.9) grayscale(0)", duration: 0.8, ease: "power2.out", overwrite: true })
        if (overlay) gsap.to(overlay, { opacity: 0.18, duration: 0.5, overwrite: true })
        if (title) gsap.to(title, { skewX: -6, scaleX: 0.95, scaleY: 1.7, color: "transparent", webkitTextStroke: "2.5px #EE3A24", duration: 0.5, ease: "power2.out", overwrite: true })
        if (cta) gsap.to(cta, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.1, overwrite: true })
      }
      const leave = () => {
        if (image) gsap.to(image, { scale: 1, filter: "brightness(0.5) grayscale(1)", duration: 0.6, ease: "power3.out", overwrite: true })
        if (overlay) gsap.to(overlay, { opacity: 0.52, duration: 0.4, overwrite: true })
        if (title) gsap.to(title, { skewX: 0, scaleX: 1, scaleY: 1, color: "#ffffff", webkitTextStroke: "0px transparent", duration: 0.4, ease: "power3.out", overwrite: true })
        if (cta) gsap.to(cta, { y: 16, opacity: 0, duration: 0.3, ease: "power3.out", overwrite: true })
      }
      card.addEventListener("pointerenter", enter)
      card.addEventListener("pointerleave", leave)
      return () => { card.removeEventListener("pointerenter", enter); card.removeEventListener("pointerleave", leave) }
    })

    return () => cleanups.forEach((fn) => fn())
  }, { scope: sectionRef, dependencies: [categories] })

  if (!categories.length) return null

  return (
      <section ref={sectionRef} className="relative z-10 w-full bg-transparent px-4 py-24 text-white md:px-12">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-8 flex items-end justify-between gap-4 goofy-mono text-[10px] uppercase tracking-widest text-white/50">
            <span>Shop by Category</span>
            <Link href="/shop" className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-colors duration-300 hover:text-[#EE3A24]">
              View Full Shop -{">"}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-3">
            {categories.map((category, index) => {
              const { gridClasses, titleSize } = getCardLayout(category, index)
              return (
                  <div key={`${category.key}-${category.slug}-${index}`} data-category-card className={gridClasses}>
                    <Link href={getCardHref(category)} className="group relative block h-full w-full overflow-hidden rounded-md border border-white/10 bg-[#0A0A0C] p-5 shadow-none md:p-6">
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        <div data-card-bg className="absolute inset-0" style={{ willChange: "transform, filter" }}>
                          <Image src={getCardImage(category)} alt={category.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="origin-center object-cover brightness-50 grayscale" />
                        </div>
                        <div data-card-overlay className="absolute inset-0 bg-black/52" />
                      </div>
                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="self-end goofy-mono text-[10px] tracking-[0.2em] text-white/50">
                          {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
                        </div>
                        <div className="mt-auto flex flex-col items-start gap-4">
                          <h2 data-card-title className={`max-w-[92%] leading-none text-white ${titleSize} goofy-display uppercase tracking-tight`} style={{ willChange: "transform" }}>
                            {category.name}
                          </h2>
                          <span data-card-cta className="inline-flex translate-y-4 items-center gap-3 rounded-full border border-[#EE3A24]/30 bg-black/35 px-3 py-1.5 goofy-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#EE3A24] opacity-0 backdrop-blur-[2px] md:px-4 md:py-2 md:text-xs">
                        Browse Products -{">"}
                      </span>
                        </div>
                      </div>
                    </Link>
                  </div>
              )
            })}
          </div>
        </div>
      </section>
  )
}

export default HomeCategoryShowcase