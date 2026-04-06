"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { motion, type TargetAndTransition, type Transition, type Variants } from "framer-motion"
import { fadeIn, fadeLeft, fadeRight, fadeUp } from "@/lib/motion"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type FadeVariant = "up" | "left" | "right" | "in"

const VARIANT_MAP: Record<FadeVariant, Variants> = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
  in: fadeIn,
}

interface FadeSectionProps {
  variant?: FadeVariant
  delay?: number
  className?: string
  children: ReactNode
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
  transition?: Transition
}

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

export function FadeSection({
  variant = "up",
  delay = 0,
  className,
  children,
  whileHover,
  whileTap,
  transition,
}: FadeSectionProps) {
  const selectedVariant = VARIANT_MAP[variant]
  const visibleState = selectedVariant.visible as { transition?: Transition } | undefined

  return (
    <motion.div
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        ...(visibleState?.transition ?? {}),
        delay,
        ...(transition ?? {}),
      }}
      whileHover={whileHover}
      whileTap={whileTap}
      className={className}
    >
      {children}
    </motion.div>
  )
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

      const enterY = Math.min(Math.max(distance * 0.22, 18), 44)
      const exitY = Math.min(Math.max(exitDistance * 0.28, 12), 24)

      gsap.set(el, {
        force3D: true,
        transformOrigin: "center top",
      })

      gsap.fromTo(
        el,
        {
          y: enterY,
          scale: scaleFrom,
        },
        {
          y: 0,
          scale: scaleTo,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            end: "top 48%",
            scrub: scrubValue,
          },
        },
      )

      gsap.to(el, {
        y: -exitY,
        scale: 0.995,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "bottom 62%",
          end: "bottom 12%",
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
