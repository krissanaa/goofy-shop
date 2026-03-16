"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function ReadyToSkate() {
  const containerRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const yImage = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0])

  return (
    <section
      ref={containerRef}
      className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden border-t border-white/5 bg-[#050505] md:h-[60vh]"
    >
      <motion.div style={{ y: yImage }} className="absolute inset-0 z-0 scale-110">
        <Image
          src="/images/channels4_banner (1).jpg"
          alt="Goofy skate background"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.5),rgba(5,5,5,0.18)_42%,rgba(5,5,5,0.62)_100%)]" />

      <motion.div style={{ opacity }} className="relative z-10 px-6 text-center">
        <h2
          className="text-7xl font-black uppercase italic leading-none text-white md:text-[8vw]"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          READY TO <span className="text-[#F0B429]">SKATE?</span>
        </h2>

        <p className="mt-6 mb-10 font-mono text-sm font-bold uppercase tracking-[0.45em] text-white md:text-base">
          Vientiane Street Culture // Est. 2026
        </p>

        <motion.div
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.2)",
          }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Link
            href="/shop"
            className="inline-flex bg-[#F0B429] px-10 py-4 text-lg font-black uppercase italic text-black transition-colors hover:bg-white md:px-12 md:text-xl"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            SHOP ALL GEAR {"->"}
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 w-full h-px bg-white/5" />
    </section>
  )
}

export default ReadyToSkate
