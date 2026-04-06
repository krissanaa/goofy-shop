"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface ScrollMotionSectionProps {
  children: ReactNode
  className?: string
  distance?: number
  exitDistance?: number
  scaleFrom?: number
  scaleTo?: number
}

export function ScrollMotionSection({
  children,
  className,
  distance = 148,
  exitDistance = 64,
  scaleFrom = 0.95,
  scaleTo = 1,
}: ScrollMotionSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 8%"],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    prefersReducedMotion ? [0, 0, 0] : [distance, 0, -exitDistance],
  )
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.82, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0, 1, 1, 0.72],
  )
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    prefersReducedMotion ? [1, 1, 1] : [scaleFrom, scaleTo, 0.985],
  )

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale, willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
