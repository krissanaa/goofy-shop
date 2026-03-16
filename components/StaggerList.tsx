"use client"

import { Children, type ReactNode } from "react"
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/motion"

interface StaggerListProps {
  className?: string
  itemClassName?: string
  children: ReactNode
  delay?: number
  itemWhileHover?: TargetAndTransition
  itemTransition?: Transition
}

export function StaggerList({
  className,
  itemClassName,
  children,
  delay = 0,
  itemWhileHover,
  itemTransition,
}: StaggerListProps) {
  const items = Children.toArray(children)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delayChildren: 0.05 + delay, staggerChildren: 0.08 }}
      className={className}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          className={itemClassName}
          whileHover={itemWhileHover}
          transition={itemTransition}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
