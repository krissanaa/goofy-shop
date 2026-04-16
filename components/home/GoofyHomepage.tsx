"use client"

import { useRef, useEffect, useLayoutEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import type { HomepageHeroSlide } from "@/lib/homepage-content"

gsap.registerPlugin(ScrollTrigger)

/* ─── Types ─── */
export interface GoofyProduct {
    id: string; slug: string; name: string; price: number
    image: string | null; category: string; badge?: string
}
export interface GoofyCategory {
    key: string; name: string; slug: string
    image: string | null; products: GoofyProduct[]
}
export interface GoofyStory {
    id: string; title: string; image: string | null
    href: string; category: string; date: string
}
export interface GoofySpot {
    id: string; name: string; image: string | null; mapUrl: string
}
export interface GoofyHomepageProps {
    products: GoofyProduct[]
    categories: GoofyCategory[]
    stories: GoofyStory[]
    spots: GoofySpot[]
    videoTitle: string
    videoDescription: string
    videoThumbnail: string | null
    videoUrl: string
    heroImage: string | null
    heroSlides?: HomepageHeroSlide[]
}

/* ─── Brand Fonts ─── */
const FT = "var(--font-title, 'Aerosoldier'), var(--font-noto-sans, sans-serif)"
const FC = "var(--font-content, 'Glancyr'), var(--font-noto-sans, sans-serif)"
const FL = "var(--font-lao), var(--font-noto-sans-lao), var(--font-noto-sans, sans-serif)"

/* ═══ MAIN ═══ */
export function GoofyHomepage({
                                  products, categories, stories, spots,
                                  videoTitle, videoDescription, videoThumbnail, videoUrl,
                                  heroImage, heroSlides,
                              }: GoofyHomepageProps) {
    useEffect(() => {
        let lenis: InstanceType<(typeof import("lenis"))["default"]> | null = null
        if (typeof window === "undefined") return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const init = async () => {
            try {
                const { default: Lenis } = await import("lenis")
                const instance = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
                lenis = instance
                instance.on("scroll", ScrollTrigger.update)
                gsap.ticker.add((t: number) => instance.raf(t * 1000))
                gsap.ticker.lagSmoothing(0)
            } catch {}
        }
        init()
        return () => { if (lenis) { lenis.destroy() } }
    }, [])

    return (
        <div style={{ fontFamily: FC, background: "#f5f2ed" }}>
            <StickyNav />
            <S1Hero heroImage={heroImage} heroSlides={heroSlides} />
            <S2FeaturedHorizontal products={products} />
            <S4CategoriesAccordion />
            <S5Categories categories={categories.slice(0, 5)} />
            <S7VideoExpand title={videoTitle} thumbnail={videoThumbnail} url={videoUrl} description={videoDescription} />
            <S8CTA />
            <S9Footer />
        </div>
    )
}

/* ═══ STICKY NAV ═══ */
function StickyNav() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 mix-blend-difference md:px-10 md:py-5">
            <Link href="/" className="text-[16px] uppercase text-white md:text-[18px]" style={{ fontFamily: FT }}>Goofy</Link>
            <div className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.15em] text-white/60 md:flex" style={{ fontFamily: FC }}>
                <span>First skate shop in Laos.</span>
                <span>Vientiane</span>
            </div>
            <button className="text-[12px] font-bold uppercase tracking-[0.1em] text-white md:text-[13px]" style={{ fontFamily: FC }}>Menu +</button>
        </header>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   S1: HERO — matvoyce.tv EXACT approach

   HOW IT WORKS:
   • Card is a div covering the ENTIRE viewport (absolute inset-0)
   • clip-path: inset() masks it to show only a small rectangle in center
   • On scroll, clip-path animates from inset(28% 25%) → inset(0% 0%)
   • This creates perfectly smooth center-to-fullscreen expansion
   • Content inside card never changes size — only the visible area grows
   • GOOFY top-left and SKATEBOARD bottom-right sit ABOVE the card (z-20)
   • They fade out as the card expands
   ═══════════════════════════════════════════════════════════════════ */

function S1Hero({ heroImage, heroSlides }: {
    heroImage: string | null
    heroSlides?: HomepageHeroSlide[]
}) {
    const sectionRef = useRef<HTMLElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const gooRef = useRef<HTMLHeadingElement>(null)
    const skateRef = useRef<HTMLHeadingElement>(null)
    const counterRef = useRef<HTMLDivElement>(null)
    const badgeRef = useRef<HTMLDivElement>(null)
    const infoRef = useRef<HTMLDivElement>(null)
    const [current, setCurrent] = useState(0)

    const getStartFrame = () => {
        if (typeof window === "undefined") {
            return { width: 920, height: 620, radius: 18, end: "+=250%" }
        }

        const mobile = window.matchMedia("(max-width: 767px)").matches
        if (mobile) {
            return {
                width: Math.min(window.innerWidth - 24, Math.max(window.innerWidth * 0.72, 280)),
                height: Math.min(window.innerHeight - 180, Math.max(window.innerHeight * 0.42, 240)),
                radius: 16,
                end: "+=200%",
            }
        }

        return {
            width: Math.min(window.innerWidth * 0.46, 780),
            height: Math.min(window.innerHeight * 0.44, 480),
            radius: 18,
            end: "+=250%",
        }
    }

    const slides = (() => {
        const items: Array<{ image: string; title: string; tag: string; href: string }> = []
        if (heroSlides) {
            for (const hs of heroSlides) {
                if (hs.rightImage) {
                    items.push({
                        image: hs.rightImage,
                        title: hs.rightTitle || hs.leftTitleLines?.join(" ") || "Goofy",
                        tag: hs.rightTag || "DROP",
                        href: hs.rightCtaHref || "/shop",
                    })
                }
            }
        }
        if (items.length === 0 && heroImage) items.push({ image: heroImage, title: "Spring Drop", tag: "NEW", href: "/drops" })
        if (items.length === 0) items.push({ image: "", title: "Goofy Skate Shop", tag: "2026", href: "/shop" })
        return items
    })()

    useEffect(() => {
        if (slides.length <= 1) return
        const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 3500)
        return () => clearInterval(timer)
    }, [slides.length])

    useLayoutEffect(() => {
        if (
            !sectionRef.current ||
            !cardRef.current ||
            !gooRef.current ||
            !skateRef.current ||
            !counterRef.current ||
            !badgeRef.current ||
            !infoRef.current
        ) {
            return
        }

        const section = sectionRef.current
        const card = cardRef.current
        const goo = gooRef.current
        const skate = skateRef.current
        const counter = counterRef.current
        const badge = badgeRef.current
        const info = infoRef.current

        const syncStartState = () => {
            const frame = getStartFrame()
            gsap.set(card, {
                visibility: "visible",
                left: "50%",
                top: "50%",
                xPercent: -50,
                yPercent: -50,
                width: frame.width,
                height: frame.height,
                borderRadius: frame.radius,
            })
            gsap.set([goo, skate, counter, badge, info], { opacity: 1, x: 0, y: 0 })
            gsap.set(section, { backgroundColor: "#f5f2ed" })
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(card, {
                visibility: "visible",
                left: "50%",
                top: "50%",
                xPercent: -50,
                yPercent: -50,
                width: window.innerWidth,
                height: window.innerHeight,
                borderRadius: 0,
            })
            return
        }

        const ctx = gsap.context(() => {
            syncStartState()

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => getStartFrame().end,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    onRefreshInit: syncStartState,
                },
            })

            tl.to(card, {
                width: () => window.innerWidth,
                height: () => window.innerHeight,
                borderRadius: 0,
                duration: 1,
            }, 0)
            tl.to(goo, { yPercent: -28, opacity: 0, duration: 0.45 }, 0)
            tl.to(skate, { yPercent: 28, opacity: 0, duration: 0.45 }, 0)
            tl.to([badge, info, counter], { opacity: 0, duration: 0.28 }, 0)
            tl.to(section, { backgroundColor: "#0a0a0a", duration: 0.24 }, 0.76)
        }, section)

        return () => ctx.revert()
    }, [])

    const active = slides[current]

    return (
        <section ref={sectionRef} className="relative h-[100svh] overflow-hidden bg-[#f5f2ed]">
            <div className="absolute left-3 top-[8vh] z-20 overflow-hidden sm:left-6 md:left-[3vw] md:top-[9vh]">
                <h1
                    ref={gooRef}
                    className="h-goo text-[clamp(56px,20vw,320px)] uppercase leading-[0.82] text-[#EE3A24]"
                    style={{ fontFamily: FT }}
                >
                    Goofy
                </h1>
            </div>

            <div className="absolute bottom-[9vh] right-3 z-20 overflow-hidden sm:right-6 md:bottom-[11vh] md:right-[3vw]">
                <h1
                    ref={skateRef}
                    className="h-sk8 text-[clamp(28px,9vw,160px)] uppercase leading-[0.82] text-[#EE3A24]"
                    style={{ fontFamily: FT }}
                >
                    Skateboard
                </h1>
            </div>

            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div
                    ref={cardRef}
                    className="absolute overflow-hidden bg-black pointer-events-auto"
                    style={{
                        visibility: "hidden",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "min(46vw, 780px)",
                        height: "min(44vh, 480px)",
                        borderRadius: "18px",
                        willChange: "width, height, border-radius, transform",
                    }}
                >
                    {slides.map((slide, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
                            style={{ opacity: i === current ? 1 : 0 }}
                        >
                            {slide.image ? (
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    priority={i === 0}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#EE3A24]">
                                    <span className="text-[80px] text-white" style={{ fontFamily: FT }}>G</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute left-6 top-6 z-20 sm:left-8 sm:top-8 md:left-10 md:top-10">
                        <span
                            className="inline-block bg-[#EE3A24] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white sm:text-[10px]"
                            style={{ fontFamily: FC }}
                        >
                            {active.tag}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-12">
                        <h3
                            className="max-w-2xl text-[clamp(24px,5vw,56px)] uppercase leading-[0.88] text-white"
                            style={{ fontFamily: FT }}
                        >
                            {active.title}
                        </h3>
                        <div className="mt-3 flex items-center gap-6 sm:mt-4">
                            <Link
                                href={active.href}
                                className="text-[10px] uppercase tracking-[0.15em] text-white/50 transition-colors duration-300 hover:text-white sm:text-[11px]"
                                style={{ fontFamily: FC }}
                            >
                                Shop now -&gt;
                            </Link>
                            {slides.length > 1 && (
                                <div className="flex gap-1.5">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setCurrent(i)}
                                            className="h-[3px] rounded-full transition-all duration-500"
                                            style={{
                                                width: i === current ? "24px" : "6px",
                                                backgroundColor: i === current ? "#EE3A24" : "rgba(255,255,255,0.2)",
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={counterRef} className="h-counter absolute left-1/2 top-[3vh] z-30 -translate-x-1/2 md:top-[4vh]">
                <CounterAnimation />
            </div>

            <div ref={badgeRef} className="h-badge absolute bottom-4 left-4 z-30 flex items-center rounded-full border-[1.5px] border-black/20 bg-[#d4f542] px-3 py-1.5 sm:bottom-7 sm:left-7 sm:px-5 sm:py-2.5">
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-black sm:text-[9px]" style={{ fontFamily: FC }}>
                    -- Scroll -- Scroll --
                </span>
            </div>

            <div ref={infoRef} className="h-info absolute bottom-4 right-4 z-30 text-right sm:bottom-7 sm:right-7">
                <p className="text-[9px] uppercase tracking-[0.22em] text-black/25 sm:text-[10px]" style={{ fontFamily: FC }}>Skate Shop</p>
                <p className="text-[9px] uppercase tracking-[0.22em] text-black/25 sm:text-[10px]" style={{ fontFamily: FC }}>Vientiane - Laos</p>
            </div>

        </section>
    )
}

/* Counter Animation */
function CounterAnimation() {
    const [digits, setDigits] = useState([0, 0, 0, 0])
    useEffect(() => {
        const dur = 2200, start = performance.now(), target = [2, 0, 2, 6]
        const animate = (now: number) => {
            const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 4)
            if (p < 1) {
                setDigits([Math.floor(e * 20) % 10, Math.floor(e * 30) % 10, Math.floor(e * 25) % 10, Math.floor(e * 35) % 10])
                requestAnimationFrame(animate)
            } else setDigits(target)
        }
        const raf = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(raf)
    }, [])
    return (
        <div className="flex gap-[2px] font-mono text-[11px] tabular-nums text-black/15 md:text-[14px]" style={{ fontFamily: FC }}>
            {digits.map((d, i) => <span key={i} className="inline-block w-[10px] text-center md:w-[12px]">{d}</span>)}
        </div>
    )
}


/* ═══════════════════════════════════════════════════════════════════
   S2–S9: ALL OTHER SECTIONS (unchanged)
   ═══════════════════════════════════════════════════════════════════ */

function S2FeaturedHorizontal({ products }: { products: GoofyProduct[] }) {
    const sectionRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const filters = ["ALL", "NEW", "HOT", "SALE"] as const
    type FeaturedFilter = (typeof filters)[number]
    const [activeFilter, setActiveFilter] = useState<FeaturedFilter>("ALL")

    const filteredProducts = products.filter((product) => {
        if (activeFilter === "ALL") return true
        return product.badge?.toUpperCase() === activeFilter
    })

    useGSAP(() => {
        if (!sectionRef.current || !trackRef.current) return

        const track = trackRef.current
        const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth)

        gsap.set(track, { x: 0 })

        if (getScrollAmount() <= 0) {
            ScrollTrigger.refresh()
            return
        }

        const tween = gsap.to(track, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            },
        })

        ScrollTrigger.refresh()

        return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
        }
    }, { scope: sectionRef, dependencies: [activeFilter], revertOnUpdate: true })

    return (
        <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[#f5f2ed]">
            <div className="absolute left-1/2 top-6 z-50 flex -translate-x-1/2 gap-2 rounded-full border-[2px] border-black bg-white/80 p-1 backdrop-blur-md md:top-10 md:gap-4 md:p-2">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 md:text-[12px] ${
                            activeFilter === filter
                                ? "bg-[#EE3A24] text-white"
                                : "bg-transparent text-black/60 hover:text-black"
                        }`}
                        style={{ fontFamily: FC }}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div ref={trackRef} className="flex h-full w-max flex-nowrap items-center">
                <div className="relative flex h-full w-screen shrink-0 flex-col items-center justify-center overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-[0.04]">
                        <span className="text-[clamp(50px,14vw,200px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>
                            {activeFilter === "ALL" ? "Gear" : activeFilter}
                        </span>
                        <span className="text-[clamp(50px,14vw,200px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>
                            Products
                        </span>
                    </div>
                    <div className="relative z-10 text-center">
                        <p className="mb-4 text-[11px] tracking-[0.15em] text-black/40 md:text-[12px]" style={{ fontFamily: FC }}>Explore our</p>
                        <h2 className="text-[clamp(48px,12vw,160px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>
                            {activeFilter === "ALL" ? "Featured" : activeFilter}
                        </h2>
                        <h2 className="text-[clamp(48px,12vw,160px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>Products</h2>
                    </div>
                </div>

                <div className="flex h-full items-center gap-6 px-12 md:gap-16 md:px-24">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Link key={product.id} href={`/product/${product.slug}`} className="group relative w-[280px] shrink-0 sm:w-[360px] md:w-[440px]">
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white shadow-xl">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 360px, 440px"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-[#EE3A24]">
                                            <span className="text-[64px] text-white" style={{ fontFamily: FT }}>G</span>
                                        </div>
                                    )}
                                    {product.badge && (
                                        <span
                                            className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${
                                                product.badge.toUpperCase() === "HOT"
                                                    ? "bg-[#EE3A24] text-white"
                                                    : product.badge.toUpperCase() === "SALE"
                                                        ? "bg-[#d4f542] text-black"
                                                        : "bg-black text-white"
                                            }`}
                                            style={{ fontFamily: FC }}
                                        >
                                            {product.badge}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-8 text-center">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/40" style={{ fontFamily: FC }}>{product.category}</p>
                                    <h3 className="mt-2 text-[clamp(24px,3vw,36px)] uppercase leading-[0.9] text-black transition-colors group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>
                                        {product.name}
                                    </h3>
                                    <p className="mt-3 text-[14px] font-bold text-[#EE3A24]" style={{ fontFamily: FC }}>
                                        {"\u0E3F"}{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex w-[50vw] items-center justify-center">
                            <p className="text-[20px] uppercase text-black/40" style={{ fontFamily: FT }}>
                                No {activeFilter} items right now.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex h-full w-[80vw] shrink-0 flex-col items-center justify-center md:w-[60vw]">
                    <p className="text-[20px] uppercase text-[#EE3A24]" style={{ fontFamily: FT }}>
                        More
                    </p>
                    <Link
                        href={`/shop${activeFilter !== "ALL" ? `?filter=${activeFilter.toLowerCase()}` : ""}`}
                        className="mt-5 rounded-full border border-black px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-black hover:text-white"
                        style={{ fontFamily: FC }}
                    >
                        Shop all -&gt;
                    </Link>
                </div>
            </div>
        </section>
    )
}

function S3Projects({ products, stories }: { products: GoofyProduct[]; stories: GoofyStory[] }) {
    const ref = useRef<HTMLElement>(null)
    const items = [
        ...products.map(p => ({ id: p.id, title: p.name, image: p.image, href: `/product/${p.slug}`, sub: p.category })),
        ...stories.map(s => ({ id: s.id, title: s.title, image: s.image, href: s.href, sub: s.category })),
    ].slice(0, 3)
    useGSAP(() => {
        if (!ref.current) return
        gsap.utils.toArray<HTMLElement>(".pj-card", ref.current).forEach((card) => {
            const img = card.querySelector<HTMLElement>(".pj-img")
            const txt = card.querySelector<HTMLElement>(".pj-txt")
            if (txt) gsap.from(txt, { x: 60, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 75%" } })
            if (img) {
                gsap.to(img, { y: -60, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.5 } })
                gsap.from(img, { scale: 0.9, opacity: 0, rotate: -5, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 80%" } })
            }
        })
    }, { scope: ref })
    return (
        <section ref={ref} className="bg-[#f5f2ed] px-5 py-12 sm:px-8 md:px-16 md:py-16 lg:px-24">
            {items.map((item, i) => {
                const flip = i % 2 !== 0
                return (
                    <Link key={item.id} href={item.href}
                          className={`pj-card group relative flex min-h-[40vh] flex-col items-center gap-6 py-10 md:min-h-[50vh] md:flex-row md:gap-8 md:py-16 ${flip ? "md:flex-row-reverse" : ""}`}>
                        <div className={`pj-img relative shrink-0 ${flip ? "md:mr-[5vw]" : "md:ml-[5vw]"}`}>
                            <div className="relative h-[180px] w-[260px] overflow-hidden rounded-lg shadow-xl sm:h-[200px] sm:w-[280px] md:h-[280px] md:w-[380px]">
                                {item.image ? <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 260px, 380px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    : <div className="flex h-full items-center justify-center bg-[#EE3A24]"><span className="text-[48px] text-white" style={{ fontFamily: FT }}>G</span></div>}
                            </div>
                            {item.image && (
                                <div className="absolute -right-3 -top-3 hidden h-[50px] w-[50px] overflow-hidden rounded border border-black/10 shadow-md md:block md:h-[65px] md:w-[65px]">
                                    <Image src={item.image} alt="" fill sizes="65px" className="object-cover opacity-70" />
                                </div>
                            )}
                        </div>
                        <div className="pj-txt flex-1 text-center md:text-left">
                            <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-black/30 md:text-[10px]" style={{ fontFamily: FC }}>{item.sub}</p>
                            <h3 className="text-[clamp(28px,6vw,100px)] uppercase leading-[0.85] text-black transition-colors duration-300 group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>{item.title}</h3>
                            <span className="mt-3 inline-block text-[9px] uppercase tracking-[0.2em] text-black/30 transition-colors group-hover:text-[#EE3A24] md:mt-4 md:text-[10px]" style={{ fontFamily: FC }}>View project →</span>
                        </div>
                    </Link>
                )
            })}
        </section>
    )
}

function S4CategoriesAccordion() {
    const sectionRef = useRef<HTMLElement>(null)

    const categories = [
        { title: "Decks", sub: "\u0E41\u0E1C\u0E48\u0E19\u0E2A\u0E40\u0E01\u0E47\u0E15", img: "/images/hardware/deck-scat.svg", slug: "decks" },
        { title: "Trucks", sub: "\u0E17\u0E23\u0E31\u0E04/\u0E10\u0E32\u0E19\u0E25\u0E49\u0E2D", img: "/images/hardware/trucks-scat.svg", slug: "trucks" },
        { title: "Wheels", sub: "\u0E25\u0E49\u0E2D", img: "/images/hardware/wheels-scat.svg", slug: "wheels" },
        { title: "Bearings", sub: "\u0E25\u0E39\u0E01\u0E1B\u0E37\u0E19", img: "/images/hardware/bearing-stack.svg", slug: "bearings" },
        { title: "Hardware", sub: "\u0E19\u0E47\u0E2D\u0E15 \u0E22\u0E32\u0E07\u0E23\u0E2D\u0E07 \u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D", img: "/images/hardware/hardware-stack.svg", slug: "hardware" },
        { title: "Completes", sub: "\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E25\u0E48\u0E19", img: "/images/hardware/complete-stack.svg", slug: "completes" },
        { title: "Apparel", sub: "\u0E40\u0E2A\u0E37\u0E49\u0E2D\u0E1C\u0E49\u0E32 \u0E23\u0E2D\u0E07\u0E40\u0E17\u0E49\u0E32 \u0E2B\u0E21\u0E27\u0E01", img: "/images/hardware/apparel-stack.svg", slug: "apparel" },
    ] as const

    useGSAP(() => {
        if (!sectionRef.current) return

        const mm = gsap.matchMedia()

        mm.add("(min-width: 768px)", () => {
            const cards = gsap.utils.toArray<HTMLElement>(".acc-card", sectionRef.current)
            const cleanups: Array<() => void> = []

            cards.forEach((card) => {
                const img = card.querySelector<HTMLElement>(".acc-img")
                const content = card.querySelector<HTMLElement>(".acc-content")
                const svgChars = card.querySelectorAll<SVGTextElement>(".svg-char text")
                const revealItems = card.querySelectorAll<HTMLElement>(".acc-reveal-item")
                let hoverTimeline: gsap.core.Timeline | null = null

                gsap.set(card, { flexGrow: 1, willChange: "flex-grow" })
                if (img) {
                    gsap.set(img, {
                        scale: 1,
                        rotation: 0,
                        filter: "grayscale(100%)",
                        opacity: 0.4,
                        transformOrigin: "center center",
                        willChange: "transform, filter, opacity",
                    })
                }
                if (content) gsap.set(content, { autoAlpha: 0 })
                if (revealItems.length) gsap.set(revealItems, { y: 20, autoAlpha: 0 })
                if (svgChars.length) {
                    gsap.set(svgChars, {
                        fill: "transparent",
                        stroke: "rgba(0,0,0,0.2)",
                        strokeWidth: "1.5px",
                        strokeDasharray: 400,
                        strokeDashoffset: 400,
                    })
                }

                const hoverIn = () => {
                    hoverTimeline?.kill()
                    hoverTimeline = gsap.timeline({ overwrite: "auto" })

                    hoverTimeline.to(card, {
                        flexGrow: 5,
                        duration: 0.8,
                        ease: "power3.out",
                        overwrite: "auto",
                    }, 0)

                    if (img) {
                        hoverTimeline.to(img, {
                            scale: 1.15,
                            rotation: 3,
                            filter: "grayscale(0%)",
                            opacity: 1,
                            duration: 0.8,
                            ease: "power3.out",
                            overwrite: "auto",
                        }, 0)
                    }

                    if (svgChars.length) {
                        hoverTimeline.to(svgChars, {
                            strokeDashoffset: 0,
                            stroke: "#EE3A24",
                            duration: 0.5,
                            ease: "power2.inOut",
                            overwrite: "auto",
                        }, 0)

                        hoverTimeline.to(svgChars, {
                            fill: "black",
                            stroke: "black",
                            duration: 0.3,
                            ease: "power1.inOut",
                            overwrite: "auto",
                        }, "-=0.2")
                    }

                    if (content) hoverTimeline.set(content, { autoAlpha: 1 }, 0)
                    if (revealItems.length) {
                        hoverTimeline.fromTo(revealItems, {
                            y: 40,
                            autoAlpha: 0,
                        }, {
                            y: 0,
                            autoAlpha: 1,
                            duration: 0.6,
                            stagger: 0.08,
                            ease: "back.out(1.2)",
                            overwrite: "auto",
                        }, "-=0.1")
                    }
                }

                const hoverOut = () => {
                    hoverTimeline?.kill()

                    gsap.to(card, {
                        flexGrow: 1,
                        duration: 0.6,
                        ease: "power3.out",
                        overwrite: "auto",
                    })

                    if (img) {
                        gsap.to(img, {
                            scale: 1,
                            rotation: 0,
                            filter: "grayscale(100%)",
                            opacity: 0.4,
                            duration: 0.6,
                            ease: "power3.out",
                            overwrite: "auto",
                        })
                    }

                    if (svgChars.length) {
                        gsap.to(svgChars, {
                            fill: "transparent",
                            duration: 0.2,
                            overwrite: "auto",
                        })
                        gsap.to(svgChars, {
                            strokeDashoffset: 400,
                            stroke: "rgba(0,0,0,0.2)",
                            duration: 0.4,
                            delay: 0.1,
                            overwrite: "auto",
                        })
                    }

                    if (revealItems.length) {
                        gsap.to(revealItems, {
                            y: 20,
                            autoAlpha: 0,
                            duration: 0.3,
                            overwrite: "auto",
                        })
                    }

                    if (content) {
                        gsap.to(content, {
                            autoAlpha: 0,
                            duration: 0.3,
                            delay: 0.1,
                            overwrite: "auto",
                        })
                    }
                }

                card.addEventListener("mouseenter", hoverIn)
                card.addEventListener("mouseleave", hoverOut)
                cleanups.push(() => {
                    hoverTimeline?.kill()
                    card.removeEventListener("mouseenter", hoverIn)
                    card.removeEventListener("mouseleave", hoverOut)
                })
            })

            return () => {
                cleanups.forEach((cleanup) => cleanup())
            }
        })

        mm.add("(max-width: 767px)", () => {
            const cards = gsap.utils.toArray<HTMLElement>(".acc-card", sectionRef.current)

            cards.forEach((card) => {
                const img = card.querySelector<HTMLElement>(".acc-img")
                const content = card.querySelector<HTMLElement>(".acc-content")
                const svgChars = card.querySelectorAll<SVGTextElement>(".svg-char text")
                const revealItems = card.querySelectorAll<HTMLElement>(".acc-reveal-item")

                if (img) gsap.set(img, { clearProps: "filter,opacity,transform" })
                if (content) gsap.set(content, { autoAlpha: 1 })
                if (revealItems.length) gsap.set(revealItems, { clearProps: "all" })
                if (svgChars.length) gsap.set(svgChars, { clearProps: "all" })
            })
        })

        return () => {
            mm.revert()
        }
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} className="flex h-[85vh] w-full flex-col overflow-hidden border-y-[2px] border-black bg-[#f5f2ed] md:h-[90vh] md:flex-row">
            {categories.map((cat) => (
                <Link
                    href={`/shop?category=${cat.slug}`}
                    key={cat.slug}
                    className="acc-card group relative flex flex-1 cursor-pointer items-center justify-center overflow-hidden border-b-[1px] border-black/10 transition-colors hover:bg-black/5 md:border-b-0 md:border-r-[1px] md:border-black/20"
                >
                    <div className="absolute inset-0 z-0 p-4 opacity-40 mix-blend-multiply md:opacity-100">
                        <div className="acc-img relative h-full w-full will-change-transform">
                            <Image src={cat.img} alt={cat.title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 30vw" />
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
                        <div className="hidden h-full w-full flex-col items-center justify-center gap-1 md:flex">
                            {cat.title.split("").map((char, index) => (
                                <svg key={`${cat.slug}-${index}`} viewBox="0 0 100 100" className="svg-char h-[clamp(30px,3vw,50px)] w-[clamp(30px,3vw,50px)] overflow-visible">
                                    <text
                                        x="50%"
                                        y="55%"
                                        dominantBaseline="middle"
                                        textAnchor="middle"
                                        className="font-bold uppercase"
                                        style={{ fontFamily: FT }}
                                    >
                                        {char}
                                    </text>
                                </svg>
                            ))}
                        </div>

                        <h3 className="text-[24px] uppercase tracking-wider text-black md:hidden" style={{ fontFamily: FT }}>
                            {cat.title}
                        </h3>
                    </div>

                    <div className="acc-content pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-[#f5f2ed] via-[#f5f2ed]/90 to-transparent p-6 opacity-0 md:p-10">
                        <p className="acc-reveal-item mb-1 text-[12px] font-bold tracking-[0.1em] text-[#EE3A24] md:text-[14px]" style={{ fontFamily: FL }}>
                            {cat.sub}
                        </p>
                        <h2 className="acc-reveal-item mb-2 text-[clamp(40px,6vw,80px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>
                            {cat.title}
                        </h2>
                    </div>
                </Link>
            ))}
        </section>
    )
}

function S5Categories({ categories }: { categories: GoofyCategory[] }) {
    const ref = useRef<HTMLElement>(null)
    useGSAP(() => {
        if (!ref.current) return
        gsap.from(".cr", { y: 40, opacity: 0, stagger: 0.15, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 60%" } })
    }, { scope: ref })
    return (
        <section ref={ref} className="bg-[#f5f2ed] px-5 py-16 sm:px-8 md:px-16 md:py-20 lg:px-24">
            {categories.map((c) => (
                <div key={c.key} className="cr border-t border-black/[0.08] py-6 md:py-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                        <Link href={`/shop?category=${c.slug}`} className="group shrink-0 md:w-[300px]">
                            <h3 className="text-[clamp(24px,5vw,56px)] uppercase leading-[0.9] text-black transition-colors duration-300 group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>{c.name}</h3>
                        </Link>
                        <div className="flex gap-2 overflow-x-auto sm:gap-3 md:gap-4">
                            {c.products.slice(0, 3).map((p) => (
                                <Link key={p.id} href={`/product/${p.slug}`}
                                      className="group/i relative aspect-square w-[80px] shrink-0 overflow-hidden rounded-md bg-white shadow-sm sm:w-[100px] md:w-[140px] lg:w-[180px]">
                                    {p.image ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 180px" className="object-cover transition-transform duration-500 group-hover/i:scale-110" />
                                        : <div className="flex h-full items-center justify-center bg-[#eee]"><span className="text-[20px] text-black/10" style={{ fontFamily: FT }}>G</span></div>}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

function S6HorizontalScroll({ products }: { products: GoofyProduct[] }) {
    const ref = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    useGSAP(() => {
        if (!ref.current || !trackRef.current) return
        const mm = gsap.matchMedia()
        mm.add("(min-width: 768px)", () => {
            const total = trackRef.current!.scrollWidth - window.innerWidth
            if (total > 0) {
                gsap.to(trackRef.current, { x: -total, ease: "none",
                    scrollTrigger: { trigger: ref.current, start: "top top", end: `+=${total}`, pin: true, scrub: 1, anticipatePin: 1 } })
            }
        })
        return () => mm.revert()
    }, { scope: ref })
    return (
        <section ref={ref} className="overflow-hidden bg-[#f5f2ed] md:h-screen">
            <div className="px-5 pb-3 pt-10 sm:px-8 md:px-16 md:pb-4 md:pt-12">
                <p className="text-[11px] tracking-[0.15em] text-black/40 md:text-[12px]" style={{ fontFamily: FC }}>Shop all products</p>
                <h2 className="mt-1 text-[clamp(20px,4vw,48px)] uppercase text-black" style={{ fontFamily: FT }}>Browse →</h2>
            </div>
            <div ref={trackRef} className="flex gap-3 overflow-x-auto px-5 pb-12 sm:px-8 md:flex-nowrap md:gap-6 md:overflow-visible md:px-16 md:pb-16">
                {products.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`}
                          className="group relative w-[200px] shrink-0 overflow-hidden rounded-lg bg-white shadow-sm sm:w-[220px] md:w-[280px]">
                        <div className="relative aspect-square overflow-hidden">
                            {p.image ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 200px, 280px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                : <div className="flex h-full items-center justify-center bg-[#f0ece4]"><span className="text-[32px] text-black/5" style={{ fontFamily: FT }}>G</span></div>}
                            {p.badge && <span className="absolute left-2 top-2 rounded-full bg-[#EE3A24] px-2 py-0.5 text-[7px] font-bold uppercase text-white sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[9px]" style={{ fontFamily: FC }}>{p.badge}</span>}
                        </div>
                        <div className="p-3 sm:p-4">
                            <p className="text-[8px] uppercase tracking-[0.15em] text-black/30 sm:text-[9px]" style={{ fontFamily: FC }}>{p.category}</p>
                            <h4 className="mt-1 text-[13px] font-bold text-black sm:text-[15px]" style={{ fontFamily: FC }}>{p.name}</h4>
                            <span className="mt-1 block text-[12px] font-bold text-[#EE3A24] sm:text-[14px]" style={{ fontFamily: FC }}>₭{p.price.toLocaleString()}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

function S7VideoExpand({ title, thumbnail, url, description }: { title: string; thumbnail: string | null; url: string; description: string }) {
    const ref = useRef<HTMLElement>(null)
    const frameRef = useRef<HTMLDivElement>(null)
    const txtRef = useRef<HTMLDivElement>(null)
    let ytId = ""
    try { const u = new URL(url); ytId = u.searchParams.get("v") || u.pathname.replace("/", "").split("/").pop() || "" } catch {}
    const thumb = thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null)
    useGSAP(() => {
        if (!ref.current || !frameRef.current) return
        const mm = gsap.matchMedia()
        mm.add("(min-width: 768px)", () => {
            gsap.set(frameRef.current, { scale: 0.5, borderRadius: "20px", opacity: 0.7 })
            if (txtRef.current) gsap.set(txtRef.current, { y: 60, opacity: 0 })
            const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "+=200%", pin: true, scrub: 1 } })
            tl.to(frameRef.current, { scale: 1, borderRadius: "0px", opacity: 1, duration: 5, ease: "power2.inOut" }, 0)
            if (txtRef.current) tl.to(txtRef.current, { y: 0, opacity: 1, duration: 2, ease: "power3.out" }, 3)
            tl.to(frameRef.current, { scale: 0.85, borderRadius: "12px", duration: 3 }, 7)
            if (txtRef.current) tl.to(txtRef.current, { y: -30, opacity: 0, duration: 2 }, 8)
        })
        return () => mm.revert()
    }, { scope: ref })
    return (
        <section ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-black">
            <div ref={frameRef} className="absolute inset-0 overflow-hidden">
                {thumb ? <Image src={thumb} alt={title} fill sizes="100vw" className="object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />}
                <div className="absolute inset-0 bg-black/40" />
                {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EE3A24] transition-transform duration-300 hover:scale-110 md:h-20 md:w-20">
                            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6 md:h-8 md:w-8"><polygon points="5,3 19,12 5,21" /></svg>
                        </div>
                    </a>
                )}
            </div>
            <div ref={txtRef} className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8 md:p-16">
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#EE3A24] sm:text-[9px]" style={{ fontFamily: FC }}>Featured Video</p>
                <h2 className="mt-2 text-[clamp(24px,5vw,72px)] uppercase leading-[0.85] text-white md:mt-3" style={{ fontFamily: FT }}>{title}</h2>
                <p className="mt-3 max-w-md text-[12px] leading-relaxed text-white/40 md:mt-4 md:text-[13px]" style={{ fontFamily: FC }}>{description}</p>
            </div>
        </section>
    )
}

function S8CTA() {
    const ref = useRef<HTMLElement>(null)
    useGSAP(() => {
        if (!ref.current) return
        gsap.from(".cta-p", { scale: 0.8, opacity: 0, duration: 0.8, ease: "back.out(1.4)",
            scrollTrigger: { trigger: ref.current, start: "top 65%" } })
    }, { scope: ref })
    return (
        <section ref={ref} className="flex min-h-[50vh] items-center justify-center bg-[#f5f2ed] px-5 py-16 md:min-h-[60vh] md:px-8 md:py-24">
            <div className="text-center">
                <p className="mb-4 text-[11px] tracking-[0.15em] text-black/40 md:mb-6 md:text-[12px]" style={{ fontFamily: FC }}>Ready to ride?</p>
                <Link href="/shop" className="cta-p group relative inline-block overflow-hidden rounded-full border-[2.5px] border-black px-10 py-6 sm:px-16 sm:py-8 md:border-[3px] md:px-24 md:py-10">
                    <div className="absolute inset-0 bg-[#EE3A24] opacity-90" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)" }} />
                    <span className="relative z-10 text-[clamp(22px,5vw,56px)] uppercase text-white transition-transform duration-300 group-hover:scale-105" style={{ fontFamily: FT }}>Shop Now</span>
                </Link>
            </div>
        </section>
    )
}

function S9Footer() {
    const ref = useRef<HTMLElement>(null)
    useGSAP(() => {
        if (!ref.current) return
        gsap.from(".ftr > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 75%" } })
    }, { scope: ref })
    return (
        <footer ref={ref} className="bg-[#EE3A24] px-5 py-12 text-white sm:px-8 md:px-16 md:py-16 lg:px-24">
            <div className="ftr mx-auto max-w-6xl">
                <div className="mb-10 text-center md:mb-16">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/50 md:text-[11px]" style={{ fontFamily: FC }}>First Skate Shop in Laos</p>
                    <h2 className="text-[clamp(48px,12vw,140px)] uppercase leading-none text-white" style={{ fontFamily: FT }}>Goofy</h2>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40 md:text-[11px]" style={{ fontFamily: FC }}>Est. 2026 · Vientiane</p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8 md:grid-cols-3 md:gap-12 md:pt-10">
                    <div>
                        <p className="mb-2 text-[8px] uppercase tracking-[0.25em] text-white/40 md:mb-3 md:text-[9px]" style={{ fontFamily: FC }}>Explore</p>
                        {["Shop","Drops","Videos","Skateparks","About"].map(l => (
                            <Link key={l} href={`/${l.toLowerCase()}`} className="block text-[clamp(14px,2vw,24px)] uppercase text-white transition-opacity duration-300 hover:opacity-60" style={{ fontFamily: FT }}>{l}</Link>
                        ))}
                    </div>
                    <div className="hidden items-center justify-center md:flex">
                        <span className="text-[80px] text-white/20" style={{ fontFamily: FT }}>G</span>
                    </div>
                    <div className="text-right">
                        <p className="mb-2 text-[8px] uppercase tracking-[0.25em] text-white/40 md:mb-3 md:text-[9px]" style={{ fontFamily: FC }}>Follow Goofy</p>
                        {["Instagram","Facebook","TikTok","YouTube"].map(l => (
                            <a key={l} href={`https://${l.toLowerCase()}.com/goofyskateshop`} target="_blank" rel="noopener noreferrer"
                               className="block text-[clamp(14px,2vw,24px)] uppercase text-white transition-opacity duration-300 hover:opacity-60" style={{ fontFamily: FT }}>{l}</a>
                        ))}
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/20 pt-4 text-[9px] text-white/30 sm:flex-row md:mt-12 md:pt-6 md:text-[10px]" style={{ fontFamily: FC }}>
                    <span>contact@goofyskateshop.la</span><span>© 2026 Goofy Skate Shop</span>
                </div>
            </div>
        </footer>
    )
}
