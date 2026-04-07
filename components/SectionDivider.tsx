"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SectionDividerProps {
    variant?: "line" | "diamond" | "fade"
    className?: string
}

export function SectionDivider({ variant = "line", className = "" }: SectionDividerProps) {
    const ref = useRef<HTMLDivElement | null>(null)

    useGSAP(
        () => {
            const el = ref.current
            if (!el) return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

            const line = el.querySelector<HTMLElement>("[data-divider-line]")
            const diamondEl = el.querySelector<HTMLElement>("[data-divider-diamond]")
            const fadeL = el.querySelector<HTMLElement>("[data-fade-l]")
            const fadeR = el.querySelector<HTMLElement>("[data-fade-r]")

            if (line) {
                gsap.fromTo(line,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 1, ease: "power3.inOut",
                        scrollTrigger: { trigger: el, start: "top 85%", once: true } },
                )
            }

            if (diamondEl) {
                gsap.fromTo(diamondEl,
                    { scale: 0, rotate: 0 },
                    { scale: 1, rotate: 45, duration: 0.5, ease: "back.out(2)", delay: 0.4,
                        scrollTrigger: { trigger: el, start: "top 85%", once: true } },
                )
            }

            if (fadeL && fadeR) {
                gsap.fromTo(fadeL,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: "power3.out",
                        scrollTrigger: { trigger: el, start: "top 85%", once: true } },
                )
                gsap.fromTo(fadeR,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: "power3.out", delay: 0.1,
                        scrollTrigger: { trigger: el, start: "top 85%", once: true } },
                )
            }
        },
        { scope: ref },
    )

    if (variant === "diamond") {
        return (
            <div ref={ref} className={`flex items-center justify-center gap-4 py-8 ${className}`}>
                <div data-fade-l className="h-[1px] w-16 origin-right bg-gradient-to-l from-[#EE3A24]/40 to-transparent md:w-24" />
                <div data-divider-diamond className="h-2 w-2 bg-[#EE3A24]" />
                <div data-fade-r className="h-[1px] w-16 origin-left bg-gradient-to-r from-[#EE3A24]/40 to-transparent md:w-24" />
            </div>
        )
    }

    if (variant === "fade") {
        return (
            <div ref={ref} className={`py-6 ${className}`}>
                <div data-divider-line className="mx-auto h-[1px] w-full max-w-[1480px] origin-center bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        )
    }

    return (
        <div ref={ref} className={`px-6 py-6 md:px-12 ${className}`}>
            <div data-divider-line className="mx-auto h-[1px] w-full max-w-[1480px] origin-center bg-gradient-to-r from-transparent via-[#EE3A24]/30 to-transparent" />
        </div>
    )
}