"use client"

import { useRef, type CSSProperties } from "react"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"

import { cleanupScrollTriggersFor, FC, FG, FT } from "@/components/home/homepage-shared"
import type { GoofyProduct } from "@/components/home/homepage-types"

gsap.registerPlugin(ScrollTrigger)

interface FeaturedHorizontalSectionProps {
    products: GoofyProduct[]
}

type FeaturedBadge = "NEW" | "HOT" | "SALE"

interface ProductGroup {
    key: FeaturedBadge
    thai: string
    eyebrow: string
    products: GoofyProduct[]
    accent: string
    shadow: string
}

export function FeaturedHorizontalSection({ products }: FeaturedHorizontalSectionProps) {
    const sectionRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    const dummyProducts: GoofyProduct[] = [
        { id: "d1", slug: "deck-baker-brand", name: "Baker Brand Logo Deck", price: 1850000, image: null, category: "Decks", badge: "NEW" },
        { id: "d2", slug: "grip-mob", name: "MOB Grip Tape", price: 350000, image: null, category: "Hardware", badge: "NEW" },
        { id: "d3", slug: "deck-girl-rick", name: "Girl Rick Howard Deck", price: 1950000, image: null, category: "Decks", badge: "NEW" },
        { id: "d4", slug: "trucks-indy-139", name: "Independent 139 Stage 11", price: 1650000, image: null, category: "Trucks", badge: "NEW" },
        { id: "d5", slug: "wheels-spitfire", name: "Spitfire Formula Four 52mm", price: 980000, image: null, category: "Wheels", badge: "HOT" },
        { id: "d6", slug: "complete-santa-cruz", name: "Santa Cruz Complete 8.0", price: 3500000, image: null, category: "Completes", badge: "HOT" },
        { id: "d7", slug: "trucks-thunder-148", name: "Thunder 148 Hollow", price: 1750000, image: null, category: "Trucks", badge: "HOT" },
        { id: "d8", slug: "deck-element-section", name: "Element Section 8.25", price: 1650000, image: null, category: "Decks", badge: "HOT" },
        { id: "d9", slug: "deck-zero-skull", name: "Zero Single Skull Deck", price: 1450000, image: null, category: "Decks", badge: "SALE" },
        { id: "d10", slug: "wheels-ricta-cloud", name: "Ricta Clouds 78a", price: 780000, image: null, category: "Wheels", badge: "SALE" },
        { id: "d11", slug: "hardware-diamond", name: "Diamond Supply 7/8 Bolts", price: 180000, image: null, category: "Hardware", badge: "SALE" },
        { id: "d12", slug: "tee-thrasher", name: "Thrasher Flame Tee", price: 850000, image: null, category: "Apparel", badge: "SALE" },
    ]

    const displayProducts = products.length > 0 ? products : dummyProducts

    const badgeBuckets = {
        NEW: displayProducts.filter((product) => product.badge?.toUpperCase() === "NEW"),
        HOT: displayProducts.filter((product) => product.badge?.toUpperCase() === "HOT"),
        SALE: displayProducts.filter((product) => product.badge?.toUpperCase() === "SALE"),
    }

    const priceLabel = (price: number) => `฿${Math.round(price / 1000).toLocaleString()}`

    const buildGroupProducts = (badge: FeaturedBadge, fallbackStart: number) => {
        const grouped = badgeBuckets[badge].slice(0, 4)
        const usedIds = new Set(grouped.map((product) => product.id))
        const fallbackSource = [...displayProducts.slice(fallbackStart, fallbackStart + 8), ...displayProducts, ...dummyProducts]

        for (const product of fallbackSource) {
            if (grouped.length >= 4) break
            if (usedIds.has(product.id)) continue
            grouped.push({ ...product, badge: product.badge ?? badge })
            usedIds.add(product.id)
        }

        return grouped.slice(0, 4)
    }

    const productGroups: ProductGroup[] = [
        {
            key: "NEW",
            thai: "สินค้าใหม่",
            eyebrow: "Fresh Drop",
            accent: "#151515",
            shadow: "#151515",
            products: buildGroupProducts("NEW", 0),
        },
        {
            key: "HOT",
            thai: "ยอดนิยม",
            eyebrow: "Most Wanted",
            accent: "#151515",
            shadow: "#151515",
            products: buildGroupProducts("HOT", 4),
        },
        {
            key: "SALE",
            thai: "ลดราคา",
            eyebrow: "Last Chance",
            accent: "#151515",
            shadow: "#151515",
            products: buildGroupProducts("SALE", 8),
        },
    ]

    const productLayouts: Array<CSSProperties> = [
        {
            left: "8vw",
            top: "12vh",
            width: "clamp(176px, 14.5vw, 278px)",
            height: "clamp(236px, 19vw, 360px)",
            transform: "rotate(-7deg)",
        },
        {
            right: "11vw",
            top: "13vh",
            width: "clamp(128px, 10.5vw, 205px)",
            height: "clamp(172px, 14vw, 272px)",
            transform: "rotate(6deg)",
        },
        {
            left: "23vw",
            bottom: "11vh",
            width: "clamp(150px, 12vw, 232px)",
            height: "clamp(198px, 16vw, 308px)",
            transform: "rotate(5deg)",
        },
        {
            right: "17vw",
            bottom: "8vh",
            width: "clamp(210px, 16.5vw, 322px)",
            height: "clamp(274px, 21vw, 414px)",
            transform: "rotate(-5deg)",
        },
    ]

    const scrollFeaturedBy = (direction: -1 | 1) => {
        if (typeof window === "undefined") return

        const trigger = ScrollTrigger.getAll().find((item) => item.trigger === sectionRef.current)
        if (!trigger) return

        const start = Number(trigger.start ?? window.scrollY)
        const end = Number(trigger.end ?? window.scrollY)
        const range = Math.max(end - start, 0)
        const step = Math.max(range * 0.18, window.innerWidth * 0.78)
        const next = Math.min(end, Math.max(start, window.scrollY + step * direction))

        window.scrollTo({ top: next, behavior: "smooth" })
    }

    useGSAP(() => {
        if (!sectionRef.current || !trackRef.current) return

        const section = sectionRef.current
        const track = trackRef.current
        const mm = gsap.matchMedia()

        cleanupScrollTriggersFor(section, false)

        mm.add("(min-width: 768px)", () => {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            const introItems = gsap.utils.toArray<HTMLElement>(".s2-video-intro-item", section)
            const introStickers = gsap.utils.toArray<HTMLElement>(".s2-video-intro-sticker", section)
            const introShop = section.querySelector<HTMLElement>(".s2-video-intro-shop")
            const panels = gsap.utils.toArray<HTMLElement>(".s2-video-panel", section)
            const allCards = gsap.utils.toArray<HTMLElement>(".s2-video-card", section)
            const allLabels = gsap.utils.toArray<HTMLElement>(".s2-video-label", section)
            const allEyebrows = gsap.utils.toArray<HTMLElement>(".s2-video-eyebrow", section)
            const allCaptions = gsap.utils.toArray<HTMLElement>(".s2-video-caption", section)
            const allButtons = gsap.utils.toArray<HTMLElement>(".s2-video-button", section)
            const allStickers = gsap.utils.toArray<HTMLElement>(".s2-video-sticker", section)

            const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth)
            const getScrollDuration = () => Math.max(getScrollAmount() * 1.18, window.innerHeight * 1.7)

            gsap.set(track, { x: 0 })

            if (prefersReducedMotion || getScrollAmount() <= 0) {
                gsap.set([...introItems, ...introStickers, ...(introShop ? [introShop] : []), ...allCards, ...allLabels, ...allEyebrows, ...allCaptions, ...allButtons, ...allStickers], {
                    autoAlpha: 1,
                    clearProps: "transform,filter,color",
                })
                ScrollTrigger.refresh()
                return () => cleanupScrollTriggersFor(section, false)
            }

            gsap.set(introItems, { y: 0, autoAlpha: 1 })
            gsap.set(introStickers, { x: 0, y: 0, scale: 1, autoAlpha: 1, transformOrigin: "50% 50%" })
            gsap.set(introShop ? [introShop] : [], { x: 0, y: 0, scale: 1, rotate: -4, autoAlpha: 1, transformOrigin: "50% 50%" })

            gsap.set(allCards, {
                autoAlpha: 0.12,
                filter: "blur(1.15px)",
                transformOrigin: "50% 50%",
            })
            gsap.set(allLabels, {
                x: () => window.innerWidth * 0.62,
                scale: 1,
                autoAlpha: 1,
                color: "#151515",
                transformOrigin: "50% 50%",
            })
            gsap.set([...allEyebrows, ...allCaptions, ...allButtons], { y: 20, autoAlpha: 0 })
            gsap.set(allStickers, { scale: 0.18, autoAlpha: 0, transformOrigin: "50% 50%" })

            const stickerIdle = gsap.to(allStickers, {
                y: (index) => (index % 2 === 0 ? -8 : 8),
                rotate: (index) => (index % 2 === 0 ? "+=3" : "-=3"),
                duration: 1.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.08,
            })

            let shopIdle: gsap.core.Timeline | null = null
            if (introShop) {
                shopIdle = gsap.timeline({ repeat: -1, yoyo: true })
                    .to([introShop], { y: -10, rotate: -7, scale: 1.05, duration: 0.55, ease: "sine.inOut" })
                    .to([introShop], { y: 0, rotate: -4, scale: 1, duration: 0.55, ease: "sine.inOut" })
            }

            const horizontalTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${getScrollDuration()}`,
                    pin: true,
                    scrub: 1.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    fastScrollEnd: true,
                    onUpdate: (self) => {
                        if (self.progress > 0.02) shopIdle?.pause()
                        else shopIdle?.play()
                    },
                },
            })

            horizontalTl
                .to(introItems, { y: -34, autoAlpha: 0, duration: 0.13, ease: "power2.out", stagger: 0.01 }, 0.02)
                .to(introStickers, {
                    y: (index) => (index === 0 ? -118 : index === 1 ? 116 : 94),
                    x: (index) => (index === 0 ? 188 : index === 1 ? -154 : 168),
                    rotate: (index) => (index === 0 ? 18 : index === 1 ? -18 : 14),
                    scale: 0.56,
                    autoAlpha: 0,
                    duration: 0.14,
                    ease: "power2.out",
                    overwrite: "auto",
                }, 0.02)
                .to(introShop ? [introShop] : [], {
                    x: 140,
                    y: -78,
                    rotate: 12,
                    scale: 0.68,
                    autoAlpha: 0,
                    duration: 0.13,
                    ease: "power2.out",
                    overwrite: "auto",
                }, 0.02)
                .to(track, { x: () => -getScrollAmount(), duration: 1, ease: "none" }, 0)

            panels.forEach((panel) => {
                const label = panel.querySelector<HTMLElement>(".s2-video-label")
                const cards = gsap.utils.toArray<HTMLElement>(".s2-video-card", panel)
                const stickers = gsap.utils.toArray<HTMLElement>(".s2-video-sticker", panel)
                const eyebrow = panel.querySelector<HTMLElement>(".s2-video-eyebrow")
                const caption = panel.querySelector<HTMLElement>(".s2-video-caption")
                const button = panel.querySelector<HTMLElement>(".s2-video-button")

                if (label) {
                    gsap.fromTo(label,
                        {
                            x: () => window.innerWidth * 1.06,
                            scale: 1,
                            autoAlpha: 1,
                            color: "#151515",
                        },
                        {
                            x: () => -window.innerWidth * 1.08,
                            scale: 1,
                            autoAlpha: 1,
                            color: "#151515",
                            ease: "none",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: horizontalTl,
                                start: "left 106%",
                                end: "left -24%",
                                scrub: 1.5,
                            },
                        },
                    )
                }

                gsap.fromTo([eyebrow, caption, button].filter(Boolean),
                    { y: 20, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        ease: "none",
                        stagger: 0.03,
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: horizontalTl,
                            start: "left 74%",
                            end: "left 42%",
                            scrub: 1.5,
                        },
                    },
                )

                cards.forEach((card, index) => {
                    const baseRotation = Number(card.dataset.rotation ?? 0)
                    const finalLeft = card.offsetLeft
                    const finalTop = card.offsetTop
                    const finalWidth = card.offsetWidth
                    const finalHeight = card.offsetHeight
                    const startWidth = Math.max(finalWidth * 0.12, 18)
                    const startHeight = Math.max(finalHeight * 0.12, 24)

                    gsap.set(card, {
                        left: finalLeft,
                        top: finalTop,
                        right: "auto",
                        bottom: "auto",
                        width: finalWidth,
                        height: finalHeight,
                    })

                    gsap.fromTo(card,
                        {
                            left: "50%",
                            top: "50%",
                            xPercent: -50,
                            yPercent: -50,
                            x: 0,
                            y: 0,
                            width: startWidth,
                            height: startHeight,
                            rotate: 0,
                            autoAlpha: 0.12,
                            filter: "blur(1.15px)",
                        },
                        {
                            left: finalLeft,
                            top: finalTop,
                            xPercent: 0,
                            yPercent: 0,
                            width: finalWidth,
                            height: finalHeight,
                            rotate: baseRotation,
                            autoAlpha: 1,
                            filter: "blur(0px)",
                            ease: "none",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: horizontalTl,
                                start: "left 100%",
                                end: "left 0%",
                                scrub: 1.5,
                                invalidateOnRefresh: true,
                            },
                        },
                    )

                    gsap.fromTo(card,
                        {
                            x: 0,
                            y: 0,
                            scale: 1,
                            rotate: baseRotation,
                            autoAlpha: 1,
                            filter: "blur(0px)",
                        },
                        {
                            x: index === 0 ? -22 : index === 1 ? 18 : index === 2 ? -14 : 24,
                            y: index === 0 ? -14 : index === 1 ? -10 : index === 2 ? 10 : 12,
                            scale: index === 3 ? 0.96 : 0.92,
                            rotate: baseRotation + (index % 2 === 0 ? -4 : 4),
                            autoAlpha: 0.84,
                            filter: "blur(0.18px)",
                            ease: "none",
                            immediateRender: false,
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: horizontalTl,
                                start: "left -10%",
                                end: "left -38%",
                                scrub: 1.5,
                                invalidateOnRefresh: true,
                            },
                        },
                    )
                })

                stickers.forEach((sticker, index) => {
                    gsap.fromTo(sticker,
                        {
                            x: index % 2 === 0 ? 40 : -40,
                            y: index % 2 === 0 ? -22 : 22,
                            scale: 0.18,
                            rotate: index % 2 === 0 ? -24 : 24,
                            autoAlpha: 0,
                        },
                        {
                            x: 0,
                            y: 0,
                            scale: index === 0 ? 1 : 0.82,
                            rotate: index % 2 === 0 ? 8 : -8,
                            autoAlpha: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: horizontalTl,
                                start: "left 88%",
                                end: "left 60%",
                                scrub: true,
                            },
                        },
                    )
                })
            })

            const refreshOnLoad = () => ScrollTrigger.refresh(true)
            window.addEventListener("load", refreshOnLoad)
            const refreshRaf = window.requestAnimationFrame(refreshOnLoad)
            ScrollTrigger.refresh()

            return () => {
                window.removeEventListener("load", refreshOnLoad)
                window.cancelAnimationFrame(refreshRaf)
                stickerIdle.kill()
                shopIdle?.kill()
                horizontalTl.scrollTrigger?.kill()
                horizontalTl.kill()
                cleanupScrollTriggersFor(section, false)
            }
        })

        mm.add("(max-width: 767px)", () => {
            const mobileGroups = gsap.utils.toArray<HTMLElement>(".s2-video-mobile-group", section)
            const mobileCards = gsap.utils.toArray<HTMLElement>(".s2-video-mobile-card", section)
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

            if (prefersReducedMotion) {
                gsap.set([...mobileGroups, ...mobileCards], { y: 0, autoAlpha: 1 })
                return () => cleanupScrollTriggersFor(section, false)
            }

            const groupTweens = mobileGroups.map((group) => gsap.fromTo(group, { y: 26, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.55,
                ease: "power3.out",
                scrollTrigger: { trigger: group, start: "top 78%" },
            }))

            const cardTweens = mobileCards.map((card) => gsap.fromTo(card, { y: 22, scale: 0.94, autoAlpha: 0 }, {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.45,
                ease: "power3.out",
                scrollTrigger: { trigger: card, start: "top 84%" },
            }))

            return () => {
                ;[...groupTweens, ...cardTweens].forEach((tween) => {
                    tween.scrollTrigger?.kill()
                    tween.kill()
                })
                cleanupScrollTriggersFor(section, false)
            }
        })

        return () => {
            mm.revert()
            cleanupScrollTriggersFor(section)
        }
    }, { scope: sectionRef, dependencies: [products.length], revertOnUpdate: true })

    const ProductMiniCard = ({ product, groupKey, index }: { product: GoofyProduct; groupKey: FeaturedBadge; index: number }) => {
        const layout = productLayouts[index % productLayouts.length]
        const rotation = String(layout.transform ?? "rotate(0deg)").match(/-?\d+/)?.[0] ?? "0"
        const badgeColor = groupKey === "HOT" ? "#ee3a24" : groupKey === "SALE" ? "#d4f542" : "#151515"
        const badgeText = groupKey === "SALE" ? "#151515" : "#ffffff"

        return (
            <Link
                href={`/product/${product.slug}`}
                className="s2-video-card group absolute z-30 overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_16px_52px_rgba(0,0,0,0.14)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={layout}
                data-rotation={rotation}
            >
                <div className="relative h-[71%] w-full overflow-hidden bg-[#ebe4d9]">
                    {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#ece8df,#d9d4c9)]">
                            <span className="text-[52px] text-black/10" style={{ fontFamily: FG }}>
                                G
                            </span>
                        </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] shadow-sm" style={{ fontFamily: FC, backgroundColor: badgeColor, color: badgeText }}>
                        {groupKey}
                    </span>
                </div>

                <div className="relative flex h-[29%] flex-col justify-center bg-white px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.18em] text-black/35" style={{ fontFamily: FC }}>
                        {product.category}
                    </p>
                    <h3 className="mt-1 line-clamp-1 text-[12px] font-black leading-tight text-black transition-colors duration-300 group-hover:text-[#ee3a24]" style={{ fontFamily: FC }}>
                        {product.name}
                    </h3>
                    <p className="mt-1 text-[12px] font-black text-[#ee3a24]" style={{ fontFamily: FC }}>
                        {priceLabel(product.price)}
                    </p>
                </div>
            </Link>
        )
    }

    return (
        <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#f5f2ed] md:h-screen">
            <div ref={trackRef} className="hidden h-full w-max items-center md:flex">
                <article className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden px-12 lg:px-20">
                    <div className="relative z-10 w-full max-w-7xl">
                        <div className="relative max-w-[980px]">
                            <p className="s2-video-intro-item mb-5 text-[11px] uppercase tracking-[0.22em] text-black/40" style={{ fontFamily: FC }}>
                                Goofy skate shop
                            </p>
                            <h2 className="uppercase leading-[0.82] text-black" style={{ fontFamily: FT }}>
                                <span className="s2-video-intro-item block text-[clamp(78px,11vw,168px)]">Featured</span>
                                <span className="relative block">
                                    <span className="s2-video-intro-item block text-[clamp(78px,11vw,168px)] text-[#ee3a24]">Products</span>
                                    <button
                                        type="button"
                                        className="s2-video-intro-shop absolute -right-[clamp(80px,10vw,150px)] top-1/2 hidden -translate-y-1/2 rotate-[-4deg] rounded-[8px] border-[3px] border-black bg-[#d4f542] px-6 py-3 text-[clamp(34px,5vw,76px)] uppercase leading-none text-black shadow-[8px_8px_0_rgba(0,0,0,0.12)] transition-transform hover:translate-x-1 hover:-translate-y-1/2 lg:inline-block"
                                        style={{ fontFamily: FG }}
                                        onClick={() => scrollFeaturedBy(1)}
                                        aria-label="Slide to featured products"
                                    >
                                        Shop
                                    </button>
                                </span>
                            </h2>

                            <div className="s2-video-intro-sticker pointer-events-none absolute right-[25%] top-[-5%] z-[15] hidden -rotate-[12deg] lg:block">
                                <Image
                                    src="/images/s2-stickers/new.png"
                                    alt=""
                                    aria-hidden="true"
                                    width={1754}
                                    height={486}
                                    className="h-auto w-[clamp(100px,12vw,180px)]"
                                />
                            </div>
                            <div className="s2-video-intro-sticker pointer-events-none absolute bottom-[25%] left-[2%] z-[15] hidden rotate-[6deg] xl:block">
                                <Image
                                    src="/images/s2-stickers/hot.png"
                                    alt=""
                                    aria-hidden="true"
                                    width={1536}
                                    height={1024}
                                    className="h-auto w-[clamp(78px,8vw,126px)]"
                                />
                            </div>
                            <div className="s2-video-intro-sticker pointer-events-none absolute bottom-[20%] right-[20%] z-[15] hidden -rotate-[5deg] xl:block">
                                <Image
                                    src="/images/s2-stickers/sale.png"
                                    alt=""
                                    aria-hidden="true"
                                    width={1536}
                                    height={1024}
                                    className="h-auto w-[clamp(92px,10vw,150px)]"
                                />
                            </div>

                            <div className="s2-video-intro-item mt-7 flex max-w-xl items-start gap-5">
                                <span className="mt-2 h-[3px] w-16 shrink-0 bg-[#ee3a24]" />
                                <div>
                                    <p className="text-[12px] uppercase tracking-[0.18em] text-black/55" style={{ fontFamily: FC }}>
                                        New drops, hot picks, and sale gear.
                                    </p>
                                    <p className="mt-3 max-w-md text-[13px] leading-relaxed text-black/40" style={{ fontFamily: FC }}>
                                        Product boxes start tiny like shadows, then grow while the title slides from right to left.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {productGroups.map((group) => (
                    <article key={group.key} className="s2-video-panel relative h-full w-screen shrink-0 overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle,#151515 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

                        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-screen -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="s2-video-eyebrow mb-3 text-[11px] uppercase tracking-[0.32em] text-black/35" style={{ fontFamily: FC }}>
                                {group.eyebrow} · Goofy Skate Shop
                            </p>
                            <h2
                                className="s2-video-label uppercase italic leading-[0.74]"
                                style={{
                                    fontFamily: FG,
                                    fontSize: "clamp(118px, 17vw, 270px)",
                                    color: "#151515",
                                    textShadow: "none",
                                    letterSpacing: "-0.06em",
                                }}
                            >
                                {group.key}
                            </h2>
                            <p
                                className="s2-video-caption mt-4 inline-flex items-center justify-center rounded-full border border-black/10 bg-white/92 px-5 py-2 text-[12px] font-black tracking-[0.12em] text-black/60 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm"
                                style={{ fontFamily: FC }}
                            >
                                {group.thai} · 4 products
                            </p>
                        </div>

                        {group.products.map((product, index) => (
                            <ProductMiniCard key={`${group.key}-${product.id}-${index}`} product={product} groupKey={group.key} index={index} />
                        ))}

                        <Link
                            href={`/shop?badge=${group.key.toLowerCase()}`}
                            className="s2-video-button absolute bottom-[13vh] left-1/2 z-50 -translate-x-1/2 rounded-full border-[3px] border-black bg-[#ee3a24] px-7 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[6px_7px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1"
                            style={{ fontFamily: FC }}
                        >
                            View {group.key} products →
                        </Link>
                    </article>
                ))}

                <article className="relative flex h-full w-[70vw] shrink-0 items-center justify-center px-10">
                    <div className="text-center">
                        <h2 className="uppercase italic leading-[0.82]" style={{ fontFamily: FG, fontSize: "clamp(72px, 9vw, 150px)" }}>
                            <span className="block text-black">More</span>
                            <span className="block text-[#ee3a24]">Gear</span>
                        </h2>
                        <Link href="/shop" className="mt-8 inline-block rounded-full border-[3px] border-black bg-[#ee3a24] px-8 py-4 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-[6px_7px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1" style={{ fontFamily: FC }}>
                            Shop all →
                        </Link>
                    </div>
                </article>
            </div>

            <div className="px-4 py-12 md:hidden">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/40" style={{ fontFamily: FC }}>
                    Goofy skate shop
                </p>
                <h2 className="mt-3 uppercase leading-[0.82] text-black" style={{ fontFamily: FT }}>
                    <span className="block text-[clamp(44px,14vw,72px)]">Featured</span>
                    <span className="block text-[clamp(44px,14vw,72px)] text-[#ee3a24]">Products</span>
                </h2>

                <div className="mt-10 space-y-12">
                    {productGroups.map((group) => (
                        <div key={`mobile-${group.key}`} className="s2-video-mobile-group">
                            <div className="mb-5 flex items-end justify-between border-t border-black/10 pt-5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-black/35" style={{ fontFamily: FC }}>
                                        {group.eyebrow}
                                    </p>
                                    <h3 className="mt-1 uppercase italic leading-[0.8]" style={{ fontFamily: FG, fontSize: "clamp(52px, 18vw, 94px)", color: "#151515", textShadow: "none" }}>
                                        {group.key}
                                    </h3>
                                </div>
                                <p className="pb-2 text-[11px] text-[#ee3a24]" style={{ fontFamily: FC }}>
                                    {group.thai}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {group.products.map((product, index) => (
                                    <Link key={`mobile-${group.key}-${product.id}-${index}`} href={`/product/${product.slug}`} className="s2-video-mobile-card group overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                                        <div className="relative aspect-[4/5] bg-[#ebe4d9]">
                                            {product.image ? (
                                                <Image src={product.image} alt={product.name} fill sizes="50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#ece8df,#d9d4c9)]">
                                                    <span className="text-[46px] text-black/10" style={{ fontFamily: FG }}>
                                                        G
                                                    </span>
                                                </div>
                                            )}
                                            <span className="absolute left-2 top-2 rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-white" style={{ fontFamily: FC, backgroundColor: group.key === "SALE" ? "#d4f542" : group.key === "HOT" ? "#ee3a24" : "#151515", color: group.key === "SALE" ? "#151515" : "#ffffff" }}>
                                                {group.key}
                                            </span>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[8px] uppercase tracking-[0.16em] text-black/35" style={{ fontFamily: FC }}>
                                                {product.category}
                                            </p>
                                            <h4 className="mt-1 line-clamp-2 text-[12px] font-black leading-tight text-black transition-colors duration-300 group-hover:text-[#ee3a24]" style={{ fontFamily: FC }}>
                                                {product.name}
                                            </h4>
                                            <p className="mt-2 text-[12px] font-black text-[#ee3a24]" style={{ fontFamily: FC }}>
                                                {priceLabel(product.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
