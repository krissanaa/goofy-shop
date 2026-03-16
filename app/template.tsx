"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { EASE_SNAP } from "@/lib/motion"

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: EASE_SNAP }}
    >
      {children}
    </motion.div>
  )
}
