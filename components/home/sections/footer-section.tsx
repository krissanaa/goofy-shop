"use client"

import { useRef } from "react"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"

import { cleanupScrollTriggersFor, FC, FT } from "@/components/home/homepage-shared"

gsap.registerPlugin(ScrollTrigger)

export function FooterSection() {
    const ref = useRef<HTMLElement>(null)

    useGSAP(() => {
        if (!ref.current) return

        const section = ref.current
        cleanupScrollTriggersFor(section, false)

        const tween = gsap.from(".ftr > *", {
            y: 30,
            opacity: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 75%" },
        })

        return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
            cleanupScrollTriggersFor(section)
        }
    }, { scope: ref })

    return (
        <footer ref={ref} className="overflow-hidden bg-[#EE3A24] px-4 py-10 text-white sm:px-8 md:px-16 md:py-16 lg:px-24">
            <div className="ftr mx-auto max-w-6xl">
                <div className="mb-10 text-center md:mb-16">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/50 md:text-[11px]" style={{ fontFamily: FC }}>
                        First Skate Shop in Laos
                    </p>
                    <h2 className="text-[clamp(48px,12vw,140px)] uppercase leading-none text-white" style={{ fontFamily: FT }}>
                        Goofy
                    </h2>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40 md:text-[11px]" style={{ fontFamily: FC }}>
                        Est. 2026 · Vientiane
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8 md:grid-cols-3 md:gap-12 md:pt-10">
                    <div>
                        <p className="mb-2 text-[8px] uppercase tracking-[0.25em] text-white/40 md:mb-3 md:text-[9px]" style={{ fontFamily: FC }}>
                            Explore
                        </p>
                        {["Shop", "Drops", "Videos", "Skateparks", "About"].map((label) => (
                            <Link key={label} href={`/${label.toLowerCase()}`} className="block text-[clamp(12px,4vw,18px)] uppercase text-white transition-opacity duration-300 hover:opacity-60 md:text-[clamp(14px,2vw,24px)]" style={{ fontFamily: FT }}>
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="hidden items-center justify-center md:flex">
                        <span className="text-[80px] text-white/20" style={{ fontFamily: FT }}>
                            G
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="mb-2 text-[8px] uppercase tracking-[0.25em] text-white/40 md:mb-3 md:text-[9px]" style={{ fontFamily: FC }}>
                            Follow Goofy
                        </p>
                        {["Instagram", "Facebook", "TikTok", "YouTube"].map((label) => (
                            <a key={label} href={`https://${label.toLowerCase()}.com/goofyskateshop`} target="_blank" rel="noopener noreferrer" className="block text-[clamp(12px,4vw,18px)] uppercase text-white transition-opacity duration-300 hover:opacity-60 md:text-[clamp(14px,2vw,24px)]" style={{ fontFamily: FT }}>
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/20 pt-4 text-[9px] text-white/30 sm:flex-row md:mt-12 md:pt-6 md:text-[10px]" style={{ fontFamily: FC }}>
                    <span>contact@goofyskateshop.la</span>
                    <span>© 2026 Goofy Skate Shop</span>
                </div>
            </div>
        </footer>
    )
}
