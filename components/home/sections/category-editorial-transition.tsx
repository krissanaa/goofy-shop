"use client"

import { useRef, type CSSProperties } from "react"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"

import { cleanupScrollTriggersFor, FC, FT } from "@/components/home/homepage-shared"

gsap.registerPlugin(ScrollTrigger)

const S4_EDITORIAL_CATEGORIES = [
    { key: "decks", title: "Decks", thai: "แผ่นสเก็ต", count: 24, icon: "/images/hardware/deck-scat.svg", left: "4%", top: "6%", width: "clamp(220px,19vw,280px)", height: "clamp(270px,24vw,340px)", rotation: -2, entryX: -40, entryY: 80, spin: 390 },
    { key: "trucks", title: "Trucks", thai: "ทรัค", count: 18, icon: "/images/hardware/trucks-scat.svg", left: "68%", top: "8%", width: "clamp(135px,11vw,160px)", height: "clamp(170px,14vw,200px)", rotation: 3, entryX: 70, entryY: -20, spin: 320 },
    { key: "wheels", title: "Wheels", thai: "ล้อ", count: 22, icon: "/images/hardware/wheels-scat.svg", left: "58%", top: "34%", width: "clamp(180px,15vw,220px)", height: "clamp(220px,18vw,260px)", rotation: -1, entryX: 60, entryY: 40, spin: 460 },
    { key: "bearings", title: "Bearings", thai: "ลูกปืน", count: 12, icon: "/images/hardware/bearing-stack.svg", left: "35%", top: "33%", width: "clamp(120px,10vw,140px)", height: "clamp(150px,12vw,170px)", rotation: 4, entryX: 30, entryY: 90, spin: 340 },
    { key: "hardware", title: "Hardware", thai: "น็อต ยางรอง", count: 16, icon: "/images/hardware/hardware-stack.svg", left: "9%", top: "58%", width: "clamp(110px,9vw,120px)", height: "clamp(135px,11vw,150px)", rotation: -3, entryX: -60, entryY: 40, spin: 420 },
    { key: "completes", title: "Completes", thai: "พร้อมเล่น", count: 8, icon: "/images/hardware/complete-stack.svg", left: "25%", top: "61%", width: "clamp(210px,18vw,260px)", height: "clamp(250px,21vw,300px)", rotation: 2, entryX: 0, entryY: 90, spin: 370 },
    { key: "apparel", title: "Apparel", thai: "เสื้อผ้า", count: 32, icon: "/images/hardware/apparel-stack.svg", left: "70%", top: "62%", width: "clamp(165px,14vw,200px)", height: "clamp(200px,17vw,240px)", rotation: -2, entryX: 80, entryY: 70, spin: 440 },
] as const

type EditorialCategory = (typeof S4_EDITORIAL_CATEGORIES)[number]

export function CategoryEditorialTransitionSection() {
    const wrapperRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)

    const prefersReducedMotion = () => {
        if (typeof window === "undefined") return true
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }

    useGSAP(() => {
        if (!wrapperRef.current || !trackRef.current) return

        const wrapper = wrapperRef.current
        const track = trackRef.current
        const mm = gsap.matchMedia()

        cleanupScrollTriggersFor(wrapper, false)

        mm.add("(min-width: 768px)", () => {
            const editorialTitleLines = gsap.utils.toArray<HTMLElement>(".editorial-title-line", wrapper)
            const editorialKicker = wrapper.querySelector<HTMLElement>(".editorial-kicker")
            const shopButton = wrapper.querySelector<HTMLElement>(".editorial-shop-button")
            const editorialCards = gsap.utils.toArray<HTMLElement>(".editorial-card", wrapper)
            const transitionWheel = wrapper.querySelector<HTMLElement>(".transition-wheel")
            const wheelBob = wrapper.querySelector<HTMLElement>(".transition-wheel-bob")
            const wheelSpin = wrapper.querySelector<HTMLElement>(".transition-wheel-spin")
            const wheelTarget = wrapper.querySelector<HTMLElement>(".spots-wheel-target")
            const staticWheel = wrapper.querySelector<HTMLElement>(".spots-static-wheel")
            const s5Subtitle = wrapper.querySelector<HTMLElement>(".spots-subtitle")
            const s5Details = gsap.utils.toArray<HTMLElement>(".spots-detail", wrapper)
            const s5Cards = gsap.utils.toArray<HTMLElement>(".spots-card", wrapper)
            const motionTrails = gsap.utils.toArray<HTMLElement>(".wheel-trail", wrapper)

            if (!editorialTitleLines.length || !editorialKicker || !shopButton || !editorialCards.length || !transitionWheel || !wheelBob || !wheelSpin || !wheelTarget || !s5Subtitle) return

            const getWheelLanding = () => {
                const wheelRect = transitionWheel.getBoundingClientRect()
                const targetRect = wheelTarget.getBoundingClientRect()
                const finalCenterX = targetRect.left - window.innerWidth + targetRect.width / 2
                const finalCenterY = targetRect.top + targetRect.height / 2
                const wheelCenterX = wheelRect.left + wheelRect.width / 2
                const wheelCenterY = wheelRect.top + wheelRect.height / 2

                return {
                    x: finalCenterX - wheelCenterX,
                    y: finalCenterY - wheelCenterY,
                    scale: targetRect.height / Math.max(transitionWheel.offsetHeight, 1),
                }
            }

            const hideTransitionAssets = () => {
                gsap.set(transitionWheel, { x: 0, y: 0, scale: 0, autoAlpha: 0, willChange: "transform" })
                gsap.set(wheelBob, { y: 0 })
                gsap.set(wheelSpin, { rotation: 0, transformOrigin: "50% 50%" })
                gsap.set([s5Subtitle, ...s5Details, ...s5Cards], { y: 40, autoAlpha: 0 })
                gsap.set(motionTrails, { x: -20, scale: 0.5, autoAlpha: 0 })
            }

            const setEntryInitialState = () => {
                gsap.set(wrapper, { clearProps: "height,overflow" })
                gsap.set(track, { clearProps: "display,width" })
                gsap.set(track, { x: 0 })
                gsap.set(editorialTitleLines, { y: 60, autoAlpha: 0 })
                gsap.set(editorialKicker, { y: 24, autoAlpha: 0 })
                gsap.set(shopButton, { y: 26, scale: 0.85, autoAlpha: 0 })
                editorialCards.forEach((card) => {
                    gsap.set(card, {
                        x: Number(card.dataset.entryX ?? 0),
                        y: Number(card.dataset.entryY ?? 80),
                        scale: 0.8,
                        autoAlpha: 0,
                        rotation: 0,
                        transformOrigin: "50% 50%",
                    })
                })
                hideTransitionAssets()
            }

            const setReducedState = () => {
                gsap.set(wrapper, { height: "auto", overflow: "visible" })
                gsap.set(track, { display: "block", width: "100%", x: 0 })
                gsap.set([...editorialTitleLines, editorialKicker, shopButton, ...editorialCards, s5Subtitle, ...s5Details, ...s5Cards], { autoAlpha: 1, x: 0, y: 0, scale: 1 })
                editorialCards.forEach((card) => gsap.set(card, { rotation: Number(card.dataset.rotation ?? 0) }))
                gsap.set(transitionWheel, { autoAlpha: 0, scale: 0 })
                if (staticWheel) gsap.set(staticWheel, { display: "block" })
            }

            if (prefersReducedMotion()) {
                setReducedState()
                return
            }

            setEntryInitialState()

            const entryTl = gsap.timeline({
                scrollTrigger: { trigger: wrapper, start: "top 75%", once: true },
            })

            entryTl.to(editorialTitleLines, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }, 0)
            entryTl.to(editorialKicker, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, 0.35)
            entryTl.to(editorialCards, {
                x: 0,
                y: 0,
                scale: 1,
                autoAlpha: 1,
                rotation: (_index, card) => Number((card as HTMLElement).dataset.rotation ?? 0),
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
            }, 0.45)
            entryTl.to(shopButton, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" }, 1.05)

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: "top top",
                    end: "+=200%",
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            })

            tl.fromTo(editorialTitleLines, { y: 0, autoAlpha: 1 }, {
                y: -40,
                autoAlpha: 0,
                duration: 1.2,
                stagger: 0.06,
                ease: "power2.inOut",
                immediateRender: false,
            }, 0)
            tl.fromTo([editorialKicker, shopButton], { y: 0, scale: 1, autoAlpha: 1 }, {
                autoAlpha: 0,
                scale: 0.8,
                y: -18,
                duration: 1.1,
                ease: "power2.inOut",
                immediateRender: false,
            }, 0)
            tl.fromTo(editorialCards, {
                x: 0,
                y: 0,
                scale: 1,
                autoAlpha: 1,
                rotation: (_index, card) => Number((card as HTMLElement).dataset.rotation ?? 0),
            }, {
                x: (_index, card) => {
                    const rect = (card as HTMLElement).getBoundingClientRect()
                    return window.innerWidth / 2 - (rect.left + rect.width / 2)
                },
                y: (_index, card) => {
                    const rect = (card as HTMLElement).getBoundingClientRect()
                    return window.innerHeight / 2 - (rect.top + rect.height / 2)
                },
                scale: 0,
                autoAlpha: 0,
                duration: 4,
                rotation: (_index, card) => `+=${Number((card as HTMLElement).dataset.spin ?? 360)}`,
                ease: "power3.inOut",
                immediateRender: false,
            }, 0)
            tl.to(transitionWheel, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "back.out(1.5)" }, 3.4)
            tl.to(wheelSpin, { rotation: "+=720", duration: 1, ease: "none", transformOrigin: "50% 50%" }, 3.4)
            tl.to(track, { x: "-100vw", duration: 4.5, ease: "power2.inOut" }, 4)
            tl.to(transitionWheel, {
                x: () => getWheelLanding().x,
                y: () => getWheelLanding().y,
                scale: () => getWheelLanding().scale,
                duration: 4.5,
                ease: "power2.inOut",
            }, 4)
            tl.to(wheelSpin, { rotation: "+=1440", duration: 4.5, ease: "none", transformOrigin: "50% 50%" }, 4)
            tl.to(wheelBob, { y: "-=6", duration: 0.35, repeat: 9, yoyo: true, ease: "sine.inOut" }, 4.05)
            tl.to(motionTrails, { autoAlpha: 0.45, x: 16, scale: 1, duration: 0.5, stagger: 0.08, ease: "none" }, 4.5)
            tl.to(motionTrails, { autoAlpha: 0, x: 44, duration: 0.8, stagger: 0.08, ease: "none" }, 5.2)
            tl.to(wheelSpin, { rotation: "+=220", duration: 1.5, ease: "power3.out", transformOrigin: "50% 50%" }, 8.5)
            tl.to(wheelBob, { y: 0, duration: 0.6, ease: "power2.out" }, 8.5)
            tl.to([s5Subtitle, ...s5Details], { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 8.7)
            tl.to(s5Cards, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power2.out" }, 9)

            return () => {
                entryTl.scrollTrigger?.kill()
                entryTl.kill()
                tl.scrollTrigger?.kill()
                tl.kill()
            }
        })

        mm.add("(max-width: 767px)", () => {
            const sections = gsap.utils.toArray<HTMLElement>(".s4s5-mobile-fade", wrapper)

            if (prefersReducedMotion()) {
                gsap.set(sections, { y: 0, autoAlpha: 1 })
                return
            }

            const tweens = sections.map((section) => gsap.fromTo(section, { y: 30, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 78%" },
            }))

            return () => {
                tweens.forEach((tween) => {
                    tween.scrollTrigger?.kill()
                    tween.kill()
                })
            }
        })

        return () => {
            mm.revert()
            cleanupScrollTriggersFor(wrapper)
        }
    }, { scope: wrapperRef })

    return (
        <section ref={wrapperRef} className="relative overflow-hidden bg-[#f5f2ed] md:h-[100svh] md:overflow-hidden">
            <div ref={trackRef} className="flex w-full flex-col md:h-full md:w-[200vw] md:flex-row">
                <CategoryEditorialSection />
                <SkateparkLocationsSection />
            </div>

            <div className="transition-wheel pointer-events-none absolute left-1/2 top-1/2 z-50 hidden aspect-square w-[100px] -translate-x-1/2 -translate-y-1/2 opacity-0 md:block">
                <div className="transition-wheel-bob relative h-full w-full">
                    <span className="wheel-trail absolute -left-10 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-black/10" />
                    <span className="wheel-trail absolute -left-6 top-[42%] h-3 w-3 rounded-full bg-[#EE3A24]/20" />
                    <span className="wheel-trail absolute -left-3 top-[58%] h-2.5 w-2.5 rounded-full bg-black/10" />
                    <Image src="/images/hardware/wheels-scat.svg" alt="" width={100} height={100} className="transition-wheel-spin h-full w-full object-contain" />
                </div>
            </div>
        </section>
    )
}

function CategoryEditorialSection() {
    return (
        <section className="s4s5-mobile-fade relative min-h-[100svh] w-full shrink-0 overflow-hidden bg-[#f5f2ed] px-5 py-14 md:h-[100svh] md:w-screen md:overflow-hidden md:px-10 md:py-0 lg:px-16">
            <div className="mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl flex-col gap-8 md:h-full md:min-h-0 md:flex-row md:items-center md:gap-0">
                <div className="relative z-20 flex flex-col items-start md:w-[40%]">
                    <h2 className="uppercase leading-[0.9] text-black" style={{ fontFamily: FT }}>
                        <span className="editorial-title-line block text-[clamp(32px,8vw,56px)] md:text-[clamp(60px,10vw,140px)]">Build Your</span>
                        <span className="editorial-title-line block text-[clamp(32px,8vw,56px)] md:text-[clamp(60px,10vw,140px)]">Setup</span>
                    </h2>
                    <p className="editorial-kicker mt-5 hidden text-[11px] uppercase tracking-[0.15em] text-black/40 md:block" style={{ fontFamily: FC }}>
                        Hover to explore
                    </p>
                    <p className="editorial-kicker mt-5 text-[11px] uppercase tracking-[0.15em] text-black/40 md:hidden" style={{ fontFamily: FC }}>
                        Tap to explore
                    </p>
                    <Link href="/shop" className="editorial-shop-button mt-7 block w-full rounded-lg border-2 border-black bg-[#EE3A24] px-5 py-4 text-center text-[14px] uppercase tracking-[0.08em] text-white transition-transform duration-300 hover:scale-105 md:inline-block md:w-auto md:rounded-full md:px-8 md:py-3" style={{ fontFamily: FT }}>
                        Shop All Gear -&gt;
                    </Link>
                </div>

                <div className="relative min-h-0 md:h-full md:w-[60%]">
                    <div className="hidden h-full md:block">
                        {S4_EDITORIAL_CATEGORIES.map((category) => (
                            <EditorialCategoryCard key={category.key} category={category} scatter />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:hidden">
                        {S4_EDITORIAL_CATEGORIES.map((category) => (
                            <EditorialCategoryCard key={category.key} category={category} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function EditorialCategoryCard({ category, scatter = false }: { category: EditorialCategory; scatter?: boolean }) {
    const style = scatter ? {
        left: category.left,
        top: category.top,
        width: category.width,
        height: category.height,
        transform: `rotate(${category.rotation}deg)`,
    } as CSSProperties : undefined

    return (
        <Link href={`/shop?category=${category.key}`} className={`${scatter ? "editorial-card absolute" : "block"} group will-change-transform`} data-rotation={category.rotation} data-entry-x={category.entryX} data-entry-y={category.entryY} data-spin={category.spin} style={style}>
            <article className="relative aspect-[3/4] h-full min-h-0 overflow-hidden rounded-xl bg-[#f0ece4] shadow-lg transition duration-300 group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:shadow-2xl md:aspect-auto md:min-h-0">
                <Image src={category.icon} alt="" fill sizes={scatter ? "280px" : "(max-width: 767px) 50vw, 280px"} className="object-contain p-4 transition-transform duration-500 group-hover:scale-110 md:p-6" />
                <span className="pointer-events-none absolute inset-0 bg-[#EE3A24]/0 transition-colors duration-300 group-hover:bg-[#EE3A24]/[0.08]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-[clamp(14px,4vw,18px)] uppercase leading-none text-white md:text-[clamp(16px,2vw,28px)]" style={{ fontFamily: FT }}>
                        {category.title}
                    </h3>
                    <p className="mt-1.5 text-[12px] text-white/70 md:text-[10px]" style={{ fontFamily: FC }}>
                        {category.thai}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50 md:text-[9px]" style={{ fontFamily: FC }}>
                        {category.count} items
                    </p>
                </div>
            </article>
        </Link>
    )
}

function SkateparkLocationsSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const wheelTargetRef = useRef<HTMLSpanElement>(null)

    const spots = [
        { name: "That Luang Park", location: "North Vientiane", distance: "~2.5 km" },
        { name: "Chao Anouvong Park", location: "Riverfront", distance: "~1.1 km" },
        { name: "COPE Center", location: "Central District", distance: "~3.2 km" },
        { name: "Nam Phu Square", location: "Downtown", distance: "~0.8 km" },
    ]

    const concreteBackground: CSSProperties = {
        backgroundColor: "#e8e4de",
        backgroundImage: [
            "repeating-linear-gradient(0deg, transparent, transparent 199px, rgba(0,0,0,0.04) 199px, rgba(0,0,0,0.04) 200px)",
            "repeating-linear-gradient(90deg, transparent, transparent 199px, rgba(0,0,0,0.04) 199px, rgba(0,0,0,0.04) 200px)",
        ].join(", "),
    }
    const grainTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

    useGSAP(() => {
        if (!sectionRef.current) return

        const section = sectionRef.current
        const mm = gsap.matchMedia()
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        cleanupScrollTriggersFor(section, false)

        mm.add("(min-width: 768px)", () => {
            const decor = gsap.utils.toArray<HTMLElement>(".skatepark-decor", section)
            const cardDepth = gsap.utils.toArray<HTMLElement>(".spot-card-depth", section)

            if (reducedMotion) {
                gsap.set([...decor, ...cardDepth], { y: 0 })
                return () => cleanupScrollTriggersFor(section, false)
            }

            const decorTween = gsap.to(decor, {
                y: -40,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 2 },
            })
            const cardTween = gsap.to(cardDepth, {
                y: -20,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.5 },
            })

            return () => {
                decorTween.scrollTrigger?.kill()
                decorTween.kill()
                cardTween.scrollTrigger?.kill()
                cardTween.kill()
                cleanupScrollTriggersFor(section, false)
            }
        })

        mm.add("(max-width: 767px)", () => {
            const cards = gsap.utils.toArray<HTMLElement>(".spots-card", section)

            if (reducedMotion) {
                gsap.set(cards, { y: 0, autoAlpha: 1 })
                return () => cleanupScrollTriggersFor(section, false)
            }

            const entryTween = gsap.fromTo(cards, { y: 50, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: { trigger: section, start: "top 70%", once: true },
            })

            return () => {
                entryTween.scrollTrigger?.kill()
                entryTween.kill()
                cleanupScrollTriggersFor(section, false)
            }
        })

        return () => {
            mm.revert()
            cleanupScrollTriggersFor(section)
        }
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} className="s4s5-mobile-fade relative z-0 min-h-[100svh] w-full shrink-0 overflow-hidden px-5 pb-14 pt-[15vh] text-black sm:px-8 md:h-[100svh] md:w-screen md:px-10 md:pb-0 md:pt-[15vh] lg:px-16" style={concreteBackground}>
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: grainTexture }} />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(232,228,222,0)_0%,rgba(232,228,222,0.5)_50%,rgba(215,210,200,0.8)_100%)]" />
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-[2] h-[6px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            <svg className="skatepark-decor pointer-events-none absolute right-[8%] top-[15%] z-0 hidden rotate-[3deg] opacity-[0.07] will-change-transform md:block" width="320" height="24" viewBox="0 0 320 24" aria-hidden="true">
                <rect x="0" y="4" width="320" height="3" rx="1.5" fill="#1a1a1a" />
                <rect x="0" y="17" width="320" height="3" rx="1.5" fill="#1a1a1a" />
                <rect x="20" y="0" width="3" height="24" rx="1" fill="#1a1a1a" />
                <rect x="160" y="0" width="3" height="24" rx="1" fill="#1a1a1a" />
                <rect x="300" y="0" width="3" height="24" rx="1" fill="#1a1a1a" />
            </svg>
            <svg className="skatepark-decor pointer-events-none absolute bottom-0 left-0 z-0 hidden opacity-[0.04] will-change-transform md:block" width="280" height="280" viewBox="0 0 280 280" aria-hidden="true">
                <path d="M0 280 Q0 0 280 0 L280 20 Q20 20 20 280 Z" fill="#1a1a1a" />
            </svg>
            <svg className="skatepark-decor pointer-events-none absolute left-[15%] top-[40%] z-0 rotate-[-8deg] opacity-[0.05] will-change-transform" width="180" height="40" viewBox="0 0 180 40" aria-hidden="true">
                <path d="M0 20 Q45 5 90 22 Q135 38 180 15" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
            <svg className="skatepark-decor pointer-events-none absolute bottom-[25%] right-[20%] z-0 rotate-[12deg] opacity-[0.04] will-change-transform" width="140" height="30" viewBox="0 0 140 30" aria-hidden="true">
                <path d="M0 15 Q35 2 70 18 Q105 30 140 10" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <span className="skatepark-decor pointer-events-none absolute left-[20%] top-[18%] z-0 rotate-[-12deg] text-[36px] uppercase text-black opacity-[0.08] will-change-transform" style={{ fontFamily: FT }}>G</span>
            <span className="skatepark-decor pointer-events-none absolute bottom-[30%] right-[11%] z-0 flex h-9 w-9 rotate-[-15deg] items-center justify-center rounded-full border border-black text-[6px] font-bold uppercase tracking-[0.08em] text-black opacity-[0.08] will-change-transform" style={{ fontFamily: FC }}>Goofy</span>
            <svg className="skatepark-decor pointer-events-none absolute right-[18%] top-[46%] z-0 rotate-[20deg] opacity-[0.09] will-change-transform" width="34" height="14" viewBox="0 0 60 20" aria-hidden="true">
                <rect x="5" y="2" width="50" height="6" rx="3" fill="#1a1a1a" />
                <circle cx="16" cy="16" r="4" fill="#1a1a1a" />
                <circle cx="44" cy="16" r="4" fill="#1a1a1a" />
            </svg>
            <svg className="skatepark-decor pointer-events-none absolute left-[34%] top-[25%] z-0 opacity-[0.08] will-change-transform" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                <path d="M13 0 L15.8 9.2 L25 13 L15.8 16.8 L13 26 L10.2 16.8 L1 13 L10.2 9.2 Z" fill="#1a1a1a" />
            </svg>

            <div className="relative z-20 mx-auto flex min-h-[calc(100svh-15vh-3.5rem)] max-w-6xl flex-col md:h-full md:min-h-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="text-left">
                        <h2 className="spots-title hidden items-center justify-start whitespace-nowrap text-[clamp(40px,8vw,100px)] uppercase leading-[0.85] text-black md:flex" style={{ fontFamily: FT }}>
                            <span>SKATE SP</span>
                            <span ref={wheelTargetRef} className="spots-wheel-target inline-block h-[0.74em] w-[1em]" aria-hidden="true">
                                <Image src="/images/hardware/wheels-scat.svg" alt="" width={120} height={120} className="spots-static-wheel hidden h-full w-full object-contain motion-reduce:block" />
                            </span>
                            <span>TS</span>
                        </h2>
                        <h2 className="text-[clamp(32px,8vw,56px)] uppercase leading-[0.85] text-black md:hidden" style={{ fontFamily: FT }}>
                            SKATE SPOTS
                        </h2>
                        <p className="spots-subtitle mt-3 text-[14px] text-[#EE3A24]" style={{ fontFamily: FC }}>จุดสเก็ต</p>
                        <p className="spots-detail mt-2 text-[11px] uppercase tracking-[0.12em] text-black/40" style={{ fontFamily: FC }}>
                            Our favorite spots in Vientiane
                        </p>
                    </div>
                    <Link href="/skateparks" className="spots-detail text-[11px] uppercase tracking-[0.15em] text-black/40 transition-colors hover:text-black" style={{ fontFamily: FC }}>
                        View all spots -&gt;
                    </Link>
                </div>

                <div className="mt-10 grid gap-4 md:mt-16 md:w-[min(86vw,900px)] md:grid-cols-2 md:gap-8">
                    {spots.map((spot, index) => (
                        <div key={spot.name} className="spots-card relative pt-4">
                            <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2" style={{ animation: "pin-bounce 2s ease-in-out infinite", animationDelay: `${index * 0.5}s` }}>
                                <div className="relative">
                                    <div className="h-[14px] w-[14px] rounded-full border-[2px] border-white bg-[#EE3A24] shadow-md" />
                                    <div className="mx-auto h-2 w-[2px] bg-[#EE3A24]" />
                                </div>
                            </div>
                            <article className="spot-card-depth overflow-hidden rounded-xl border-t-[3px] border-[#EE3A24] bg-white shadow-lg transition duration-300 will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
                                <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#d4d0c8_0%,#c8c4bc_40%,#bdb9b1_100%)]">
                                    <svg className="pointer-events-none absolute left-[8%] top-[38%] opacity-[0.06]" width="260" height="54" viewBox="0 0 260 54" aria-hidden="true">
                                        <path d="M0 30 Q65 0 130 32 Q195 62 260 18" stroke="#1a1a1a" strokeWidth="4" fill="none" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="relative p-4 md:p-5">
                                    <span className="absolute right-4 top-4 text-[9px] uppercase tracking-[0.14em] text-black/30 md:right-5 md:top-5" style={{ fontFamily: FC }}>
                                        {spot.distance}
                                    </span>
                                    <h3 className="pr-16 text-[clamp(18px,2.5vw,26px)] uppercase leading-none text-black" style={{ fontFamily: FT }}>
                                        {spot.name}
                                    </h3>
                                    <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-black/50" style={{ fontFamily: FC }}>
                                        <span className="mr-1 text-[#EE3A24]">●</span>
                                        {spot.location}
                                    </p>
                                    <Link href="/spots" className="mt-4 inline-block text-[10px] uppercase tracking-[0.16em] text-[#EE3A24] hover:underline" style={{ fontFamily: FC }}>
                                        View on map -&gt;
                                    </Link>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
