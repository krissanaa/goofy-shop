"use client"

import { motion, type TargetAndTransition, type Transition, type Variants } from "framer-motion"
import type { ReactNode } from "react"
import { fadeIn, fadeLeft, fadeRight, fadeUp } from "@/lib/motion"

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
