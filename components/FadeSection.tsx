"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface ScrollMotionSectionProps {
    children: ReactNode
    className?: string
    distance?: number
    exitDistance?: number
    scaleFrom?: number
    scaleTo?: number
    pin?: boolean
    pinDuration?: string
    onTimeline?: (tl: gsap.core.Timeline, container: HTMLElement) => void
    scrub?: number | boolean
}

export function ScrollMotionSection({
                                        children,
                                        className,
                                        distance = 148,
                                        exitDistance = 64,
                                        scaleFrom = 0.97,
                                        scaleTo = 1,
                                        pin = false,
                                        pinDuration = "100%",
                                        onTimeline,
                                        scrub = 1.1,
                                    }: ScrollMotionSectionProps) {
    const ref = useRef<HTMLDivElement | null>(null)

    useGSAP(
        () => {
            const el = ref.current
            if (!el) return

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches
            if (prefersReducedMotion) return

            const scrubValue =
                typeof scrub === "boolean" ? (scrub ? 1 : 0) : scrub

            /* ── Pin mode: sticky section with scrubbed timeline ── */
            if (pin) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: "top top",
                        end: `+=${pinDuration}`,
                        scrub: scrubValue,
                        pin: true,
                        anticipatePin: 1,
                    },
                })

                onTimeline?.(tl, el)
                return
            }

            /* ── Strong scroll motion: Y + scale, no fade ── */
            const enterY = Math.min(Math.max(distance * 0.5, 48), 140)
            const exitY = Math.min(Math.max(exitDistance * 0.55, 24), 70)

            gsap.set(el, {
                force3D: true,
                transformOrigin: "center top",
            })

            /* ENTER: slide up + scale */
            gsap.fromTo(
                el,
                { y: enterY, scale: scaleFrom },
                {
                    y: 0,
                    scale: scaleTo,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 95%",
                        end: "top 40%",
                        scrub: scrubValue,
                    },
                },
            )

            /* EXIT: slide up + scale down */
            gsap.to(el, {
                y: -exitY,
                scale: 0.985,
                ease: "power2.in",
                scrollTrigger: {
                    trigger: el,
                    start: "bottom 55%",
                    end: "bottom 5%",
                    scrub: scrubValue,
                },
            })
        },
        {
            scope: ref,
            dependencies: [
                distance,
                exitDistance,
                scaleFrom,
                scaleTo,
                pin,
                pinDuration,
                scrub,
            ],
        },
    )

    return (
        <div
            ref={ref}
            className={className}
            style={{ willChange: "transform" }}
        >
            {children}
        </div>
    )
}