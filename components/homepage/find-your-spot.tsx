"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageFallbackSpot,
} from "@/lib/homepage-content"

export type FindYourSpotItem = HomepageFallbackSpot

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 18 },
  },
}

function getVisibleSpots(
  spots: FindYourSpotItem[],
  fallbackSpots: FindYourSpotItem[],
) {
  const filled = [...spots]

  while (filled.length < 4) {
    filled.push(fallbackSpots[filled.length])
  }

  return filled.slice(0, 4)
}

export function FindYourSpot({
  spots,
  fallbackSpots = DEFAULT_HOMEPAGE_CONTENT.fallbackSpots,
}: {
  spots: FindYourSpotItem[]
  fallbackSpots?: FindYourSpotItem[]
}) {
  const visibleSpots = getVisibleSpots(spots, fallbackSpots)

  return (
    <section className="bg-transparent px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2
            className="text-6xl font-black uppercase italic leading-none text-black transition-colors duration-500 dark:text-white md:text-7xl"
            style={{ fontFamily: "var(--font-ui-sans)" }}
          >
            FIND YOUR SPOT
          </h2>

          <Link
            href="/skateparks"
            className="w-fit font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/72 transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#F0B429]"
          >
            View All Spots -{">"}
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {visibleSpots.map((spot) => (
            <motion.article
              key={spot.id}
              variants={cardVariants}
              className="relative"
            >
              <motion.a
                href={spot.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial="rest"
                animate="rest"
                whileHover="hover"
                className="group relative block h-[400px] overflow-hidden border border-black/10 bg-white/35 shadow-[0_16px_40px_rgba(5,5,5,0.08)] transition-colors duration-500 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
              >
                {spot.image ? (
                  <motion.div
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 1.05 },
                    }}
                    transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
                    className="homepage-media-fade absolute inset-0"
                  >
                    <Image
                      src={spot.image}
                      alt={spot.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover brightness-[0.4] grayscale transition-all duration-700 group-hover:brightness-[0.72] group-hover:grayscale-0"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#646464,#2b2b2b)] transition-colors duration-500 dark:bg-[linear-gradient(135deg,#2d2d2d,#111111)]" />
                )}

                <div className="absolute inset-0 p-6">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.05),rgba(5,5,5,0.36)_68%,rgba(5,5,5,0.82)_100%)]" />

                  <div className="relative flex h-full items-end overflow-hidden">
                    <motion.div
                      className="space-y-3"
                      variants={{
                        rest: { y: 0 },
                        hover: { y: -22 },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.h3
                        className="max-w-[92%] text-3xl font-black uppercase italic leading-none text-white"
                        style={{ fontFamily: "var(--font-ui-sans)" }}
                        variants={{
                          rest: { color: "#ffffff" },
                          hover: { color: "#F0B429" },
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {spot.name}
                      </motion.h3>

                      <motion.div
                        variants={{
                          rest: { y: 14, opacity: 0 },
                          hover: { y: 0, opacity: 1 },
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="inline-flex items-center rounded-sm bg-[#F0B429] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                          VIEW ON MAPS -{">"}
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  variants={{
                    rest: { opacity: 0 },
                    hover: { opacity: 1 },
                  }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#F0B429]"
                />
                <motion.div
                  variants={{
                    rest: { opacity: 0 },
                    hover: { opacity: 1 },
                  }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#F0B429]"
                />
              </motion.a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FindYourSpot
