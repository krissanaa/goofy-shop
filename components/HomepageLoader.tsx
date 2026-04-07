"use client"

import { useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

export function HomepageLoader({ children }: { children: React.ReactNode }) {
    const loaderRef = useRef<HTMLDivElement | null>(null)
    const [done, setDone] = useState(false)

    useGSAP(
        () => {
            const el = loaderRef.current
            if (!el) return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                setDone(true)
                return
            }

            /* Check if already shown this session */
            try {
                if (sessionStorage.getItem("goofy-loaded")) {
                    setDone(true)
                    return
                }
            } catch { /* ignore */ }

            const tl = gsap.timeline({
                onComplete: () => {
                    setDone(true)
                    try { sessionStorage.setItem("goofy-loaded", "1") } catch { /* ignore */ }
                },
            })

            const logoChars = gsap.utils.toArray<HTMLElement>("[data-loader-char]", el)
            const tagline = el.querySelector<HTMLElement>("[data-loader-tagline]")
            const curtainL = el.querySelector<HTMLElement>("[data-curtain-l]")
            const curtainR = el.querySelector<HTMLElement>("[data-curtain-r]")
            const progressBar = el.querySelector<HTMLElement>("[data-loader-progress]")
            const overlay = el.querySelector<HTMLElement>("[data-loader-overlay]")

            /* Phase 1: Progress bar fills */
            if (progressBar) {
                tl.fromTo(progressBar,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
                    0,
                )
            }

            /* Phase 2: Logo chars reveal one by one */
            if (logoChars.length) {
                tl.fromTo(logoChars,
                    { opacity: 0, y: 80, rotateX: -90, transformOrigin: "bottom center" },
                    { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: "power4.out", stagger: 0.06 },
                    0.3,
                )
            }

            /* Phase 3: Tagline fade in */
            if (tagline) {
                tl.fromTo(tagline,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
                    0.9,
                )
            }

            /* Phase 4: Hold */
            tl.to({}, { duration: 0.3 })

            /* Phase 5: Curtain split */
            if (curtainL && curtainR) {
                tl.to(curtainL, { xPercent: -100, duration: 0.7, ease: "power3.inOut" }, "+=0")
                tl.to(curtainR, { xPercent: 100, duration: 0.7, ease: "power3.inOut" }, "<")
            }

            /* Phase 6: Overlay fade out */
            if (overlay) {
                tl.to(overlay, { opacity: 0, duration: 0.3, ease: "power2.out" }, "-=0.2")
            }
        },
        { scope: loaderRef },
    )

    return (
        <div ref={loaderRef} className="relative">
            {children}

            {/* ── Loader overlay ── */}
            {!done && (
                <div
                    data-loader-overlay
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ pointerEvents: done ? "none" : "all" }}
                >
                    {/* Split curtains */}
                    <div
                        data-curtain-l
                        className="absolute left-0 top-0 h-full w-1/2 bg-[#050505]"
                    />
                    <div
                        data-curtain-r
                        className="absolute right-0 top-0 h-full w-1/2 bg-[#050505]"
                    />

                    {/* Center content */}
                    <div className="relative z-10 text-center" style={{ perspective: "600px" }}>
                        {/* Logo text */}
                        <div className="flex items-center justify-center gap-0">
                            {"GOOFY".split("").map((char, i) => (
                                <span
                                    key={i}
                                    data-loader-char
                                    className="inline-block text-[clamp(60px,12vw,140px)] font-black uppercase italic leading-none text-white"
                                    style={{
                                        fontFamily: "var(--font-display, sans-serif)",
                                        willChange: "transform, opacity",
                                    }}
                                >
                  {char}
                </span>
                            ))}
                        </div>

                        {/* Tagline */}
                        <p
                            data-loader-tagline
                            className="mt-4 font-mono text-[10px] uppercase tracking-[0.5em] text-white/40"
                        >
                            Vientiane Street Culture
                        </p>

                        {/* Progress bar */}
                        <div className="mx-auto mt-8 h-[2px] w-32 overflow-hidden bg-white/10">
                            <div
                                data-loader-progress
                                className="h-full origin-left bg-[#EE3A24]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}