"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type LenisLike = {
    on: (event: string, callback: () => void) => void
    raf: (time: number) => void
    destroy: () => void
}

type LenisCtor = new (options: {
    duration: number
    easing: (t: number) => number
    orientation: "vertical"
    gestureOrientation: "vertical"
    smoothWheel: boolean
    wheelMultiplier: number
    touchMultiplier: number
}) => LenisLike

function resolveLenis(module: unknown): LenisCtor | null {
    const candidate = (module as { default?: unknown; Lenis?: unknown }).default
        ?? (module as { default?: unknown; Lenis?: unknown }).Lenis

    return typeof candidate === "function" ? (candidate as LenisCtor) : null
}

export function LenisProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<LenisLike | null>(null)
    const tickerRef = useRef<((time: number) => void) | null>(null)

    useEffect(() => {
        let cancelled = false

        async function init() {
            try {
                const LenisModule = await import("lenis")
                if (cancelled) return

                const Lenis = resolveLenis(LenisModule)
                if (!Lenis) return

                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    orientation: "vertical",
                    gestureOrientation: "vertical",
                    smoothWheel: true,
                    wheelMultiplier: 1,
                    touchMultiplier: 2,
                })

                lenisRef.current = lenis
                lenis.on("scroll", ScrollTrigger.update)

                const tick = (time: number) => {
                    lenis.raf(time * 1000)
                }

                tickerRef.current = tick
                gsap.ticker.add(tick)
                gsap.ticker.lagSmoothing(0)

                requestAnimationFrame(() => {
                    ScrollTrigger.refresh()
                })
            } catch {
                console.warn(
                    "[LenisProvider] Lenis not found. Install with: npm install lenis\n",
                    "Falling back to native scroll.",
                )
            }
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return
        }

        void init()

        return () => {
            cancelled = true
            if (tickerRef.current) {
                gsap.ticker.remove(tickerRef.current)
                tickerRef.current = null
            }
            if (lenisRef.current) {
                lenisRef.current.destroy()
                lenisRef.current = null
            }
        }
    }, [])

    return <>{children}</>
}
