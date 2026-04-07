"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageReadyToSkateContent,
} from "@/lib/homepage-content"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function ReadyToSkate({
                               content = DEFAULT_HOMEPAGE_CONTENT.readyToSkate,
                             }: {
  content?: HomepageReadyToSkateContent
}) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useGSAP(
      () => {
        const el = sectionRef.current
        if (!el) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const bg = el.querySelector<HTMLElement>("[data-rts-bg]")
        const overlay = el.querySelector<HTMLElement>("[data-rts-overlay]")
        const titleChars = gsap.utils.toArray<HTMLElement>("[data-rts-char]", el)
        const accentChars = gsap.utils.toArray<HTMLElement>("[data-rts-accent-char]", el)
        const subheading = el.querySelector<HTMLElement>("[data-rts-sub]")
        const cta = el.querySelector<HTMLElement>("[data-rts-cta]")
        const lineLeft = el.querySelector<HTMLElement>("[data-rts-line-l]")
        const lineRight = el.querySelector<HTMLElement>("[data-rts-line-r]")
        const topBorder = el.querySelector<HTMLElement>("[data-rts-border-top]")
        const bottomBorder = el.querySelector<HTMLElement>("[data-rts-border-bottom]")

        /* ── Background: scale 1.3 → 1 parallax ── */
        if (bg) {
          gsap.fromTo(bg,
              { scale: 1.35, y: -40 },
              { scale: 1.05, y: 40, ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 } },
          )
        }

        /* ── Overlay fade: reveal content zone ── */
        if (overlay) {
          gsap.fromTo(overlay,
              { opacity: 0.8 },
              { opacity: 0.35, ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: 1 } },
          )
        }

        /* ── Top/bottom decorative borders expand from center ── */
        if (topBorder) {
          gsap.fromTo(topBorder, { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: "power3.inOut",
                scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        }
        if (bottomBorder) {
          gsap.fromTo(bottomBorder, { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: "power3.inOut", delay: 0.1,
                scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        }

        /* ── Title chars: rotateX reveal with stagger ── */
        if (titleChars.length) {
          gsap.fromTo(titleChars,
              { opacity: 0, y: 50, rotateX: -80, transformOrigin: "bottom center" },
              { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: "power4.out", stagger: 0.03,
                scrollTrigger: { trigger: el, start: "top 70%", once: true }, delay: 0.2 },
          )
        }

        /* ── Accent chars: same but gold + slightly later ── */
        if (accentChars.length) {
          gsap.fromTo(accentChars,
              { opacity: 0, y: 50, rotateX: -80, transformOrigin: "bottom center" },
              { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: "power4.out", stagger: 0.03,
                scrollTrigger: { trigger: el, start: "top 70%", once: true }, delay: 0.5 },
          )
        }

        /* ── Center lines expand outward ── */
        if (lineLeft) {
          gsap.fromTo(lineLeft, { scaleX: 0 },
              { scaleX: 1, duration: 0.6, ease: "power3.out", delay: 0.7,
                scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        }
        if (lineRight) {
          gsap.fromTo(lineRight, { scaleX: 0 },
              { scaleX: 1, duration: 0.6, ease: "power3.out", delay: 0.7,
                scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        }

        /* ── Subheading fade up ── */
        if (subheading) {
          gsap.fromTo(subheading,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.8,
                scrollTrigger: { trigger: el, start: "top 70%", once: true } },
          )
        }

        /* ── CTA: scale up + glow pulse ── */
        if (cta) {
          gsap.fromTo(cta,
              { opacity: 0, scale: 0.85, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 1,
                scrollTrigger: { trigger: el, start: "top 70%", once: true } },
          )

          /* Subtle glow pulse loop */
          gsap.to(cta, {
            boxShadow: "0 0 40px rgba(240,180,41,0.35)",
            duration: 1.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.5,
          })
        }

        /* ── Scroll-driven opacity: fade out as you leave ── */
        const contentWrap = el.querySelector<HTMLElement>("[data-rts-content]")
        if (contentWrap) {
          gsap.fromTo(contentWrap,
              { opacity: 0 },
              { opacity: 1, ease: "none",
                scrollTrigger: { trigger: el, start: "top 80%", end: "top 40%", scrub: 1 } },
          )
          gsap.fromTo(contentWrap,
              { opacity: 1 },
              { opacity: 0, ease: "none",
                scrollTrigger: { trigger: el, start: "bottom 60%", end: "bottom 20%", scrub: 1 } },
          )
        }
      },
      { scope: sectionRef, dependencies: [content] },
  )

  /* Split title text for char animation */
  const leadingChars = (content.titleLeading || "").split("")
  const accentChars = (content.titleAccent || "").split("")

  return (
      <section
          ref={sectionRef}
          className="relative flex h-[60vh] w-full items-center justify-center overflow-hidden bg-transparent md:h-[70vh]"
      >
        {/* ── Background image with parallax ── */}
        <div data-rts-bg className="absolute inset-0 z-0" style={{ willChange: "transform" }}>
          <Image
              src={content.backgroundImage}
              alt="Goofy skate background"
              fill
              sizes="100vw"
              className="object-cover"
          />
        </div>

        {/* ── Dark overlay ── */}
        <div
            data-rts-overlay
            className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.6),rgba(5,5,5,0.2)_42%,rgba(5,5,5,0.7)_100%)]"
        />

        {/* ── Top/bottom decorative borders ── */}
        <div data-rts-border-top className="absolute top-0 z-10 h-[1px] w-full origin-center bg-gradient-to-r from-transparent via-[#EE3A24]/40 to-transparent" />
        <div data-rts-border-bottom className="absolute bottom-0 z-10 h-[1px] w-full origin-center bg-gradient-to-r from-transparent via-[#EE3A24]/40 to-transparent" />

        {/* ── Content ── */}
        <div data-rts-content className="relative z-10 px-6 text-center" style={{ perspective: "600px" }}>
          {/* Title with per-char reveal */}
          <h2
              className="text-7xl font-black uppercase italic leading-none text-white md:text-[8vw]"
              style={{ fontFamily: "var(--font-ui-sans)" }}
          >
            {leadingChars.map((char, i) => (
                <span key={`lead-${i}`} data-rts-char className="inline-block" style={{ willChange: "transform, opacity" }}>
              {char === " " ? "\u00A0" : char}
            </span>
            ))}
            {" "}
            {accentChars.map((char, i) => (
                <span key={`accent-${i}`} data-rts-accent-char className="inline-block text-[#EE3A24]" style={{ willChange: "transform, opacity" }}>
              {char === " " ? "\u00A0" : char}
            </span>
            ))}
          </h2>

          {/* Center decorative lines */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <div data-rts-line-l className="h-[1px] w-16 origin-right bg-[#EE3A24] md:w-24" />
            <div className="h-1.5 w-1.5 rotate-45 bg-[#EE3A24]" />
            <div data-rts-line-r className="h-[1px] w-16 origin-left bg-[#EE3A24] md:w-24" />
          </div>

          <p
              data-rts-sub
              className="mt-6 mb-10 font-mono text-sm font-bold uppercase tracking-[0.45em] text-white md:text-base"
          >
            {content.subheading}
          </p>

          <div data-rts-cta className="inline-block rounded-sm">
            <Link
                href={content.ctaHref}
                className="inline-flex bg-[#EE3A24] px-10 py-4 text-lg font-black uppercase italic text-black transition-colors hover:bg-white md:px-12 md:text-xl"
                style={{ fontFamily: "var(--font-ui-sans)" }}
            >
              {content.ctaLabel} {"->"}
            </Link>
          </div>
        </div>
      </section>
  )
}

export default ReadyToSkate