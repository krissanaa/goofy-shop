"use client"

import { useRef } from "react"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"

import { cleanupScrollTriggersFor, FC, FT } from "@/components/home/homepage-shared"

gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
    const ref = useRef<HTMLElement>(null)

    useGSAP(() => {
        if (!ref.current) return

        const section = ref.current
        cleanupScrollTriggersFor(section, false)

        const tween = gsap.from(".cta-p", {
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: ref.current, start: "top 65%" },
        })

        return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
            cleanupScrollTriggersFor(section)
        }
    }, { scope: ref })

    return (
        <section ref={ref} className="flex min-h-[40vh] items-center justify-center overflow-hidden bg-[#f5f2ed] px-5 py-16 md:min-h-[60vh] md:px-8 md:py-24">
            <div className="w-full max-w-[440px] text-center md:max-w-none">
                <p className="mb-4 text-[11px] tracking-[0.15em] text-black/40 md:mb-6 md:text-[12px]" style={{ fontFamily: FC }}>
                    Ready to ride?
                </p>
                <Link href="/shop" className="cta-p group relative block w-full overflow-hidden rounded-full border-[2.5px] border-black px-8 py-5 sm:px-16 sm:py-8 md:inline-block md:w-auto md:border-[3px] md:px-24 md:py-10">
                    <div className="absolute inset-0 bg-[#EE3A24] opacity-90" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)" }} />
                    <span className="relative z-10 text-[clamp(20px,5vw,32px)] uppercase text-white transition-transform duration-300 group-hover:scale-105 md:text-[clamp(22px,5vw,56px)]" style={{ fontFamily: FT }}>
                        Shop Now
                    </span>
                </Link>
            </div>
        </section>
    )
}
