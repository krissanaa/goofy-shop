"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function ScrollProgressBar() {
    const barRef = useRef<HTMLDivElement | null>(null)

    useGSAP(() => {
        const bar = barRef.current
        if (!bar) return

        gsap.to(bar, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,
            },
        })
    })

    return (
        <div className="fixed left-0 right-0 top-0 z-[100] h-[3px] bg-transparent">
            <div
                ref={barRef}
                className="h-full origin-left bg-[#EE3A24]"
                style={{ transform: "scaleX(0)", willChange: "transform" }}
            />
        </div>
    )
}