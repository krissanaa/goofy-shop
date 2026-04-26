"use client"

import { useRef } from "react"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"

import { cleanupScrollTriggersFor, FC, FT } from "@/components/home/homepage-shared"

gsap.registerPlugin(ScrollTrigger)

interface VideoExpandSectionProps {
    title: string
    thumbnail: string | null
    url: string
    description: string
}

export function VideoExpandSection({ title, thumbnail, url, description }: VideoExpandSectionProps) {
    const ref = useRef<HTMLElement>(null)
    const frameRef = useRef<HTMLDivElement>(null)
    const txtRef = useRef<HTMLDivElement>(null)

    let ytId = ""
    try {
        const parsed = new URL(url)
        ytId = parsed.searchParams.get("v") || parsed.pathname.replace("/", "").split("/").pop() || ""
    } catch {}

    const thumb = thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null)

    useGSAP(() => {
        if (!ref.current || !frameRef.current) return

        const section = ref.current
        cleanupScrollTriggersFor(section, false)

        const mm = gsap.matchMedia()

        mm.add("(min-width: 768px)", () => {
            gsap.set(frameRef.current, { scale: 0.5, borderRadius: "20px", opacity: 0.7 })
            if (txtRef.current) gsap.set(txtRef.current, { y: 60, opacity: 0 })

            const tl = gsap.timeline({
                scrollTrigger: { trigger: section, start: "top top", end: "+=200%", pin: true, scrub: 1 },
            })

            tl.to(frameRef.current, { scale: 1, borderRadius: "0px", opacity: 1, duration: 5, ease: "power2.inOut" }, 0)
            if (txtRef.current) tl.to(txtRef.current, { y: 0, opacity: 1, duration: 2, ease: "power3.out" }, 3)
            tl.to(frameRef.current, { scale: 0.85, borderRadius: "12px", duration: 3 }, 7)
            if (txtRef.current) tl.to(txtRef.current, { y: -30, opacity: 0, duration: 2 }, 8)

            return () => {
                tl.scrollTrigger?.kill()
                tl.kill()
                cleanupScrollTriggersFor(section, false)
            }
        })

        mm.add("(max-width: 767px)", () => {
            gsap.set(frameRef.current, { scale: 1, borderRadius: "0px", opacity: 1 })
            if (txtRef.current) gsap.set(txtRef.current, { y: 0, opacity: 1 })

            return () => cleanupScrollTriggersFor(section, false)
        })

        return () => {
            mm.revert()
            cleanupScrollTriggersFor(section)
        }
    }, { scope: ref })

    return (
        <section ref={ref} className="relative min-h-[68svh] w-full overflow-hidden bg-black md:h-[100svh]">
            <div ref={frameRef} className="absolute inset-0 overflow-hidden">
                {thumb ? (
                    <Image src={thumb} alt={title} fill sizes="100vw" className="object-cover" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
                )}
                <div className="absolute inset-0 bg-black/40" />
                {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EE3A24] transition-transform duration-300 hover:scale-110 md:h-20 md:w-20">
                            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-5 w-5 md:h-8 md:w-8">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        </div>
                    </a>
                )}
            </div>
            <div ref={txtRef} className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8 md:p-16">
                <p className="text-[8px] uppercase tracking-[0.25em] text-[#EE3A24] sm:text-[9px]" style={{ fontFamily: FC }}>
                    Featured Video
                </p>
                <h2 className="mt-2 text-[clamp(24px,6vw,40px)] uppercase leading-[0.85] text-white md:mt-3 md:text-[clamp(24px,5vw,72px)]" style={{ fontFamily: FT }}>
                    {title}
                </h2>
                <p className="mt-3 max-w-md line-clamp-3 text-[12px] leading-relaxed text-white/40 md:mt-4 md:text-[13px]" style={{ fontFamily: FC }}>
                    {description}
                </p>
            </div>
        </section>
    )
}
