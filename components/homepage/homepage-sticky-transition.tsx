"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { motion } from "framer-motion"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface HomepageStickyTransitionProps {
  headline?: string
  image?: string | null
}

export function HomepageStickyTransition({
  headline = "SKATE EVERY DAMN DAY",
  image,
}: HomepageStickyTransitionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const primaryRef = useRef<HTMLDivElement | null>(null)
  const secondaryRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const kickerRef = useRef<HTMLParagraphElement | null>(null)

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !primaryRef.current ||
        !secondaryRef.current ||
        !headlineRef.current ||
        !kickerRef.current
      ) {
        return
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=90%",
          scrub: 1.8,
          pin: true,
          anticipatePin: 1,
        },
      })

      timeline
        .fromTo(
          primaryRef.current,
          {
            scale: 1,
            filter: "grayscale(0.95)",
          },
          {
            scale: 1.14,
            yPercent: -6,
            filter: "grayscale(0.15)",
            ease: "none",
          },
          0,
        )
        .fromTo(
          secondaryRef.current,
          {
            autoAlpha: 0,
            scale: 1.08,
          },
          {
            autoAlpha: 1,
            scale: 1,
            ease: "none",
          },
          0.14,
        )
        .to(
          headlineRef.current,
          {
            yPercent: -10,
            scale: 0.94,
            opacity: 0.62,
            ease: "none",
          },
          0,
        )
        .to(
          kickerRef.current,
          {
            yPercent: -45,
            opacity: 0,
            ease: "none",
          },
          0,
        )
    },
    { scope: sectionRef, dependencies: [image] },
  )

  return (
    <section
      ref={sectionRef}
      className="relative h-[125vh] overflow-hidden bg-transparent md:h-[135vh]"
    >
      <div className="relative h-screen overflow-hidden">
        <div
          ref={primaryRef}
          className="homepage-media-fade absolute inset-0 bg-cover bg-center"
          style={
            image
              ? {
                  backgroundImage: `url(${image})`,
                }
              : {
                  background:
                    "linear-gradient(135deg, rgba(18,18,18,1) 0%, rgba(48,48,48,1) 100%)",
                }
          }
        />
        <div className="absolute inset-0 bg-white/14 transition-colors duration-500 dark:bg-black/38" />
        <div
          ref={secondaryRef}
          className="absolute inset-0 opacity-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(238,58,36,0.28),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(245,245,245,0.92))] transition-colors duration-500 dark:bg-[radial-gradient(circle_at_top,rgba(238,58,36,0.18),transparent_42%),linear-gradient(180deg,rgba(5,5,5,0.04),rgba(5,5,5,0.96))]" />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1100px] text-center"
          >
            <p
              ref={kickerRef}
              className="goofy-mono text-[10px] uppercase tracking-[0.32em] text-black/58 transition-colors duration-500 dark:text-white/58"
            >
              Vientiane / Laos / Street Motion
            </p>
            <h2
              ref={headlineRef}
              className="goofy-display mt-6 text-[clamp(54px,11vw,164px)] uppercase italic leading-[0.84] tracking-[-0.06em] text-black transition-colors duration-500 dark:text-white"
            >
              {headline}
            </h2>
            <p className="mx-auto mt-6 max-w-[680px] text-sm uppercase tracking-[0.22em] text-black/52 transition-colors duration-500 dark:text-white/44 md:text-[11px]">
              Product drops, local footage, and team motion stitched into one
              continuous canvas.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
