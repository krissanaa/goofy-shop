"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * LenisProvider
 * ─────────────
 * Wraps children with Lenis smooth scrolling.
 * Syncs Lenis with GSAP ScrollTrigger on every frame.
 *
 * Install: npm install lenis
 *
 * Usage in layout.tsx or page wrapper:
 *   <LenisProvider>
 *     <HomepageMotionShell>...</HomepageMotionShell>
 *   </LenisProvider>
 */
export function LenisProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<any>(null)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        /* ── Dynamically import Lenis (avoids SSR issues) ── */
        let cancelled = false

        async function init() {
            try {
                const LenisModule = await import("lenis")
                if (cancelled) return

                const Lenis = LenisModule.default || LenisModule.Lenis

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

                /* ── Sync Lenis scroll position with GSAP ScrollTrigger ── */
                lenis.on("scroll", ScrollTrigger.update)

                /* ── Use GSAP ticker for Lenis RAF (perfect sync) ── */
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000)
                })
                gsap.ticker.lagSmoothing(0)

                /* ── Refresh ScrollTrigger after Lenis is ready ── */
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh()
                })
            } catch (err) {
                /* Lenis not installed — fall back to native scroll */
                console.warn(
                    "[LenisProvider] Lenis not found. Install with: npm install lenis\n",
                    "Falling back to native scroll.",
                )
            }
        }

        /* Skip if reduced motion preferred */
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return
        }

        void init()

        return () => {
            cancelled = true
            if (lenisRef.current) {
                gsap.ticker.remove(lenisRef.current.raf)
                lenisRef.current.destroy()
                lenisRef.current = null
            }
        }
    }, [])

    return <>{children}</>
}