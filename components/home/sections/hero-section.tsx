"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { useGSAP } from "@gsap/react"
import { flushSync } from "react-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"

import { cleanupScrollTriggersFor, FC, FT } from "@/components/home/homepage-shared"
import type { GoofyHomepageProps } from "@/components/home/homepage-types"

gsap.registerPlugin(ScrollTrigger)

type HeroSectionProps = Pick<GoofyHomepageProps, "heroImage" | "heroSlides">

export function HeroSection({ heroImage, heroSlides }: HeroSectionProps) {
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
                width: Math.min(window.innerWidth - 24, Math.max(window.innerWidth * 0.76, 280)),
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
            for (const slide of heroSlides) {
                if (slide.rightImage) {
                    items.push({
                        image: slide.rightImage,
                        title: slide.rightTitle || slide.leftTitleLines?.join(" ") || "Goofy",
                        tag: slide.rightTag || "DROP",
                        href: slide.rightCtaHref || "/shop",
                    })
                }
            }
        }

        if (items.length === 0 && heroImage) {
            items.push({ image: heroImage, title: "Spring Drop", tag: "NEW", href: "/drops" })
        }

        if (items.length === 0) {
            items.push({ image: "", title: "Goofy Skate Shop", tag: "2026", href: "/shop" })
        }

        return items
    })()

    useEffect(() => {
        if (slides.length <= 1) return

        const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 3500)
        return () => clearInterval(timer)
    }, [slides.length])

    useLayoutEffect(() => {
        if (!sectionRef.current || !cardRef.current || !gooRef.current || !skateRef.current || !counterRef.current || !badgeRef.current || !infoRef.current) {
            return
        }

        const section = sectionRef.current
        const card = cardRef.current
        const goo = gooRef.current
        const skate = skateRef.current
        const counter = counterRef.current
        const badge = badgeRef.current
        const info = infoRef.current
        const stickerBurst = section.querySelector<HTMLElement>(".s1-sticker-burst")
        const heroOverlayItems = [goo, skate, counter, badge, info, ...(stickerBurst ? [stickerBurst] : [])]

        cleanupScrollTriggersFor(section, false)

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
                clipPath: "inset(0% 0% 0% 0% round 0px)",
            })
            gsap.set(heroOverlayItems, { opacity: 1, x: 0, y: 0 })
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
                clipPath: "inset(0% 0% 0% 0% round 0px)",
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
                left: "50%",
                top: "50%",
                xPercent: -50,
                yPercent: -50,
                width: () => window.innerWidth,
                height: () => window.innerHeight,
                borderRadius: 0,
                duration: 1,
            }, 0)
            tl.to(goo, { yPercent: -28, opacity: 0, duration: 0.45 }, 0)
            tl.to(skate, { yPercent: 28, opacity: 0, duration: 0.45 }, 0)
            tl.to([badge, info, counter, ...(stickerBurst ? [stickerBurst] : [])], { opacity: 0, duration: 0.28 }, 0)
            tl.to(section, { backgroundColor: "#0a0a0a", duration: 0.24 }, 0.76)
        }, section)

        return () => {
            ctx.revert()
            cleanupScrollTriggersFor(section)
        }
    }, [])

    const active = slides[current]

    return (
        <section ref={sectionRef} className="relative h-[100svh] w-full overflow-hidden bg-[#f5f2ed]">
            <LoopingStickerLogo />

            <div className="absolute left-3 top-[8vh] z-20 max-w-[calc(100vw-1.5rem)] overflow-hidden sm:left-6 md:left-[3vw] md:top-[9vh]">
                <h1 ref={gooRef} className="h-goo max-w-full text-[clamp(40px,14vw,80px)] uppercase leading-[0.82] text-[#EE3A24] md:text-[clamp(56px,20vw,320px)]" style={{ fontFamily: FT }}>
                    Goofy
                </h1>
            </div>

            <div className="absolute bottom-[9vh] right-3 z-20 max-w-[calc(100vw-1.5rem)] overflow-hidden text-right sm:right-6 md:bottom-[11vh] md:right-[3vw]">
                <h1 ref={skateRef} className="h-sk8 max-w-full text-[clamp(20px,6vw,40px)] uppercase leading-[0.82] text-[#EE3A24] md:text-[clamp(28px,9vw,160px)]" style={{ fontFamily: FT }}>
                    Skateboard
                </h1>
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div
                    ref={cardRef}
                    className="pointer-events-auto absolute overflow-hidden bg-black"
                    style={{
                        visibility: "hidden",
                        left: "50%",
                        top: "50%",
                        width: "min(46vw, 780px)",
                        height: "min(44vh, 480px)",
                        borderRadius: "18px",
                        willChange: "width, height, border-radius, transform",
                    }}
                >
                    {slides.map((slide, index) => (
                        <div key={index} className="absolute inset-0 transition-opacity duration-[1200ms] ease-out" style={{ opacity: index === current ? 1 : 0 }}>
                            {slide.image ? (
                                <Image src={slide.image} alt={slide.title} fill sizes="100vw" className="object-cover" priority={index === 0} />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#EE3A24]">
                                    <span className="text-[80px] text-white" style={{ fontFamily: FT }}>
                                        G
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute left-6 top-6 z-20 sm:left-8 sm:top-8 md:left-10 md:top-10">
                        <span className="inline-block bg-[#EE3A24] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white sm:text-[10px]" style={{ fontFamily: FC }}>
                            {active.tag}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-12">
                        <h3 className="max-w-2xl text-[clamp(24px,5vw,56px)] uppercase leading-[0.88] text-white" style={{ fontFamily: FT }}>
                            {active.title}
                        </h3>
                        <div className="mt-3 flex items-center gap-6 sm:mt-4">
                            <Link href={active.href} className="text-[10px] uppercase tracking-[0.15em] text-white/50 transition-colors duration-300 hover:text-white sm:text-[11px]" style={{ fontFamily: FC }}>
                                Shop now -&gt;
                            </Link>
                            {slides.length > 1 && (
                                <div className="flex gap-1.5">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setCurrent(index)}
                                            className="h-[3px] rounded-full transition-all duration-500"
                                            style={{
                                                width: index === current ? "24px" : "6px",
                                                backgroundColor: index === current ? "#EE3A24" : "rgba(255,255,255,0.2)",
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
                <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-black sm:text-[9px]" style={{ fontFamily: FC }}>
                    -- Scroll -- Scroll --
                </span>
            </div>

            <div ref={infoRef} className="h-info absolute bottom-4 right-4 z-30 text-right sm:bottom-7 sm:right-7">
                <p className="text-[8px] uppercase tracking-[0.18em] text-black/25 sm:text-[10px]" style={{ fontFamily: FC }}>
                    Skate Shop
                </p>
                <p className="text-[8px] uppercase tracking-[0.18em] text-black/25 sm:text-[10px]" style={{ fontFamily: FC }}>
                    Vientiane - Laos
                </p>
            </div>
        </section>
    )
}

function LoopingStickerLogo() {
    const ref = useRef<HTMLDivElement>(null)
    const stickerImages = [
        { src: "/images/s1-stickers/s1-1.png", className: "h-[78px] w-[78px] md:h-[104px] md:w-[104px]", sparks: ["bg-[#EE3A24]", "bg-black"] },
        { src: "/images/s1-stickers/s1-2.png", className: "h-[58px] w-[114px] md:h-[76px] md:w-[150px]", sparks: ["bg-white", "bg-[#d4f542]"] },
        { src: "/images/s1-stickers/s1-3.png", className: "h-[76px] w-[92px] md:h-[108px] md:w-[132px]", sparks: ["bg-[#EE3A24]", "bg-[#d4f542]"] },
        { src: "/images/s1-stickers/s1-4.png", className: "h-[72px] w-[116px] md:h-[96px] md:w-[154px]", sparks: ["bg-[#d4f542]", "bg-black"] },
        { src: "/images/s1-stickers/s1-5.png", className: "h-[42px] w-[42px] md:h-[56px] md:w-[56px]", sparks: ["bg-[#EE3A24]", "bg-[#d4f542]"] },
        { src: "/images/s1-stickers/s1-6.png", className: "h-[62px] w-[96px] md:h-[82px] md:w-[126px]", sparks: ["bg-[#17d5c3]", "bg-[#EE3A24]"] },
    ]
    const [stickerOrder, setStickerOrder] = useState([0, 1, 2, 3, 4, 5])
    const [visibleStickerCount, setVisibleStickerCount] = useState(6)
    const sparkOffsets = [
        [-46, -32], [-22, -54], [22, -52], [48, -28], [56, 10], [34, 42],
        [0, 56], [-36, 42], [-58, 10], [-52, -12], [18, 24], [-18, 18],
    ]

    const displayStickers = stickerOrder.map((index) => stickerImages[index])

    useGSAP(() => {
        if (!ref.current) return

        const root = ref.current
        const pieces = gsap.utils.toArray<HTMLElement>(".nav-sticker-piece", root)
        const sparks = gsap.utils.toArray<HTMLElement>(".nav-sticker-piece .nav-sticker-spark", root)
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
        const randomInRange = (min: number, max: number) => (min >= max ? min : min + Math.random() * (max - min))
        const shuffle = <T,>(items: T[]) => {
            const copy = [...items]
            for (let index = copy.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(Math.random() * (index + 1))
                ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
            }
            return copy
        }

        const setupCycle = () => {
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const visibleCount = Math.floor(randomInRange(2, 4))
            const nextStickerOrder = shuffle(stickerImages.map((_, index) => index))

            flushSync(() => {
                setVisibleStickerCount(visibleCount)
                setStickerOrder(nextStickerOrder)
            })

            const columns = viewportWidth < 768 ? 2 : 3
            const rows = Math.ceil(visibleCount / columns)
            const topSafeArea = viewportWidth < 768 ? 86 : 72
            const bottomSafeArea = viewportWidth < 768 ? 64 : 36
            const usableHeight = Math.max(260, viewportHeight - topSafeArea - bottomSafeArea)
            const cells = Array.from({ length: rows * columns }, (_, index) => {
                const column = index % columns
                const row = Math.floor(index / columns)
                const cellWidth = viewportWidth / columns
                const cellHeight = usableHeight / rows

                return {
                    minX: column * cellWidth,
                    maxX: (column + 1) * cellWidth,
                    minY: topSafeArea + row * cellHeight,
                    maxY: topSafeArea + (row + 1) * cellHeight,
                }
            })

            const orderedCells = shuffle(cells)
            const visiblePieces = pieces.slice(0, visibleCount)
            const hiddenPieces = pieces.slice(visibleCount)

            gsap.set(hiddenPieces, { autoAlpha: 0, scale: 0.32, y: 18 })

            visiblePieces.forEach((piece, index) => {
                const cell = orderedCells[index % orderedCells.length]
                const width = piece.offsetWidth || 120
                const height = piece.offsetHeight || 90
                const cellWidth = cell.maxX - cell.minX
                const cellHeight = cell.maxY - cell.minY
                const xPadding = Math.min(34, cellWidth * 0.16)
                const yPadding = Math.min(28, cellHeight * 0.18)
                const minLeft = cell.minX + xPadding
                const maxLeft = cell.maxX - width - xPadding
                const minTop = cell.minY + yPadding
                const maxTop = cell.maxY - height - yPadding

                gsap.set(piece, {
                    left: clamp(randomInRange(minLeft, maxLeft), 12, Math.max(12, viewportWidth - width - 14)),
                    top: clamp(randomInRange(minTop, maxTop), topSafeArea, Math.max(topSafeArea, viewportHeight - height - bottomSafeArea)),
                    x: 0,
                    y: 16,
                    transformOrigin: "50% 50%",
                })
            })

            return visiblePieces
        }

        if (prefersReducedMotion) {
            const visiblePieces = setupCycle()
            gsap.set(visiblePieces, {
                autoAlpha: 1,
                scale: 1,
                rotate: () => randomInRange(-9, 9),
                y: 0,
            })
            gsap.set(sparks, { autoAlpha: 0 })
            return
        }

        let cycleTl: gsap.core.Timeline | null = null
        let nextCycle: gsap.core.Tween | null = null

        const runCycle = () => {
            const visiblePieces = setupCycle()
            const stayDuration = randomInRange(1.5, 2.5)
            const pauseDuration = randomInRange(0.5, 1)

            cycleTl?.kill()
            cycleTl = gsap.timeline({
                onComplete: () => {
                    nextCycle = gsap.delayedCall(pauseDuration, runCycle)
                },
            })

            cycleTl
                .set(visiblePieces, {
                    autoAlpha: 0,
                    scale: 0.32,
                    rotate: () => randomInRange(-18, 18),
                    y: 18,
                })
                .set(sparks, { autoAlpha: 1, scale: 0.3, x: 0, y: 0 })
                .to(visiblePieces, {
                    autoAlpha: 1,
                    scale: () => randomInRange(0.92, 1.12),
                    rotate: () => randomInRange(-10, 10),
                    y: 0,
                    duration: 0.42,
                    stagger: 0.15,
                    ease: "back.out(2.1)",
                })
                .to(sparks, {
                    x: (index) => sparkOffsets[index % sparkOffsets.length][0],
                    y: (index) => sparkOffsets[index % sparkOffsets.length][1],
                    scale: (index) => (index % 3 === 0 ? 1.2 : 0.8),
                    autoAlpha: 0,
                    duration: 0.62,
                    stagger: { each: 0.006, from: "random" },
                    ease: "power2.out",
                }, "<0.03")
                .to(visiblePieces, {
                    y: () => randomInRange(-8, 8),
                    rotate: () => randomInRange(-8, 8),
                    duration: 0.65,
                    repeat: 1,
                    yoyo: true,
                    stagger: 0.04,
                    ease: "sine.inOut",
                }, 0.62)
                .to({}, { duration: stayDuration })
                .to(visiblePieces, {
                    autoAlpha: 0,
                    scale: 0.68,
                    rotate: () => randomInRange(-16, 16),
                    y: -24,
                    duration: 0.38,
                    stagger: 0.1,
                    ease: "back.in(1.5)",
                })
        }

        nextCycle = gsap.delayedCall(1.2, runCycle)

        return () => {
            cycleTl?.kill()
            nextCycle?.kill()
        }
    }, { scope: ref })

    return (
        <div ref={ref} className="s1-sticker-burst pointer-events-none absolute inset-0 z-[60]" aria-hidden="true">
            {displayStickers.map((sticker, stickerIndex) => (
                <div key={`sticker-slot-${stickerIndex}`} data-visible={stickerIndex < visibleStickerCount ? "true" : "false"} className={`nav-sticker-piece absolute opacity-0 will-change-transform ${sticker.className}`}>
                    {sparkOffsets.slice(0, 8).map((_, sparkIndex) => (
                        <span key={`s1-sticker-${stickerIndex}-spark-${sparkIndex}`} className={`nav-sticker-spark absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${sticker.sparks[sparkIndex % sticker.sparks.length]}`} />
                    ))}
                    <div className="relative h-full w-full">
                        <Image src={sticker.src} alt="" fill sizes="(max-width: 768px) 160px, 220px" className="object-contain drop-shadow-[8px_8px_0_rgba(0,0,0,0.14)]" draggable={false} />
                    </div>
                </div>
            ))}
            <div className="hidden">
                {sparkOffsets.slice(0, 8).map((_, index) => (
                    <span key={`nav-board-spark-${index}`} className={`nav-sticker-spark absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${index % 2 === 0 ? "bg-[#EE3A24]" : "bg-[#d4f542]"}`} />
                ))}
                <div className="flex h-[30px] w-[30px] items-center justify-center text-[20px] leading-none">🛹</div>
            </div>
            <div className="hidden">
                {sparkOffsets.slice(0, 8).map((_, index) => (
                    <span key={`nav-est-spark-${index}`} className={`nav-sticker-spark absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${index % 2 === 0 ? "bg-[#17d5c3]" : "bg-[#EE3A24]"}`} />
                ))}
                <div className="relative px-2 py-1">
                    <div className="relative z-10 flex -rotate-[1deg] flex-col items-center leading-none">
                        <span className="text-[13px] font-black uppercase tracking-[-0.02em] md:text-[18px]" style={{ fontFamily: FC, color: "#17d5c3", WebkitTextStroke: "0.35px #EE3A24", textShadow: "0.6px 0.6px 0 rgba(0,0,0,0.65)" }}>
                            EST.
                        </span>
                        <span className="mt-[-1px] text-[22px] font-black uppercase tracking-normal md:text-[30px]" style={{ fontFamily: FC, color: "#17d5c3", WebkitTextStroke: "0.35px #EE3A24", textShadow: "0.8px 0.8px 0 rgba(0,0,0,0.7)" }}>
                            2026
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CounterAnimation() {
    const [digits, setDigits] = useState([0, 0, 0, 0])

    useEffect(() => {
        const duration = 2200
        const start = performance.now()
        const target = [2, 0, 2, 6]

        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)

            if (progress < 1) {
                setDigits([
                    Math.floor(eased * 20) % 10,
                    Math.floor(eased * 30) % 10,
                    Math.floor(eased * 25) % 10,
                    Math.floor(eased * 35) % 10,
                ])
                requestAnimationFrame(animate)
            } else {
                setDigits(target)
            }
        }

        const raf = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <div className="flex gap-[2px] font-mono text-[9px] tabular-nums text-black/15 md:text-[14px]" style={{ fontFamily: FC }}>
            {digits.map((digit, index) => (
                <span key={index} className="inline-block w-[8px] text-center md:w-[12px]">
                    {digit}
                </span>
            ))}
        </div>
    )
}
