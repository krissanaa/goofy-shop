"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { motion } from "framer-motion"
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageFallbackStory,
} from "@/lib/homepage-content"
import { attachMagneticEffect } from "@/lib/gsap-magnetic"

export type FromTheStreetsStory = HomepageFallbackStory

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STORY_LAYOUTS = [
  {
    gridClasses: "md:col-span-5 md:row-span-2",
    rotation: -1.4,
    imageClasses: "aspect-[4/5]",
    contentClasses: "-mt-8 ml-4 mr-4",
    titleClasses: "text-[clamp(2.5rem,4vw,5rem)]",
    horizontal: false,
  },
  {
    gridClasses: "md:col-span-7 md:row-span-1 md:translate-y-2",
    rotation: 1.6,
    imageClasses: "aspect-[4/3] md:h-full md:min-h-[300px] md:w-[48%] md:shrink-0 md:aspect-auto",
    contentClasses: "-mt-7 ml-4 mr-4 md:-ml-8 md:mb-5 md:mt-5 md:ml-[-2rem] md:mr-5",
    titleClasses: "text-[clamp(2rem,3vw,3.25rem)]",
    horizontal: true,
  },
  {
    gridClasses: "md:col-span-7 md:row-span-1 md:translate-y-6",
    rotation: -1.2,
    imageClasses: "aspect-[4/3] md:h-full md:min-h-[300px] md:w-[48%] md:shrink-0 md:aspect-auto",
    contentClasses: "-mt-7 ml-4 mr-4 md:-ml-8 md:mb-5 md:mt-5 md:ml-[-2rem] md:mr-5",
    titleClasses: "text-[clamp(2rem,3vw,3.25rem)]",
    horizontal: true,
  },
] as const

const bentoRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
}

const bentoRevealItem = {
  hidden: { opacity: 0, y: 56 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

function getStories(
  stories: FromTheStreetsStory[],
  fallbackStories: FromTheStreetsStory[],
) {
  const filled = [...stories]

  while (filled.length < 3) {
    filled.push(fallbackStories[filled.length])
  }

  return filled.slice(0, 3)
}

function RippedBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex w-fit bg-[#F0B429] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-black goofy-mono"
      style={{
        clipPath:
          "polygon(0 0, 95% 0, 100% 35%, 97% 100%, 5% 100%, 0 68%, 2% 38%)",
      }}
    >
      {label}
    </span>
  )
}

export function FromTheStreets({
  stories,
  fallbackStories = DEFAULT_HOMEPAGE_CONTENT.fallbackStories,
}: {
  stories: FromTheStreetsStory[]
  fallbackStories?: FromTheStreetsStory[]
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const visibleStories = getStories(stories, fallbackStories)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", section)
      const magneticTargets = gsap.utils.toArray<HTMLElement>("[data-magnetic]", section)

      const hoverCleanups = cards.map((card) => {
        const image = card.querySelector<HTMLElement>("[data-card-image]")
        const fallback = card.querySelector<HTMLElement>("[data-card-fallback]")
        const title = card.querySelector<HTMLElement>("[data-card-title]")
        const meta = card.querySelector<HTMLElement>("[data-card-meta]")

        const handleEnter = () => {
          if (image) {
            gsap.to(image, {
              scale: 1.1,
              duration: 1.1,
              ease: "power2.out",
              overwrite: true,
            })
          }

          if (fallback) {
            gsap.to(fallback, {
              scale: 1.04,
              duration: 1.1,
              ease: "power2.out",
              overwrite: true,
            })
          }

          gsap.to([title, meta].filter(Boolean), {
            y: -6,
            duration: 0.42,
            stagger: 0.04,
            ease: "power2.out",
            overwrite: true,
          })
        }

        const handleLeave = () => {
          if (image) {
            gsap.to(image, {
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              overwrite: true,
            })
          }

          if (fallback) {
            gsap.to(fallback, {
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              overwrite: true,
            })
          }

          gsap.to([title, meta].filter(Boolean), {
            y: 0,
            duration: 0.36,
            stagger: 0.03,
            ease: "power3.out",
            overwrite: true,
          })
        }

        card.addEventListener("pointerenter", handleEnter)
        card.addEventListener("pointerleave", handleLeave)

        return () => {
          card.removeEventListener("pointerenter", handleEnter)
          card.removeEventListener("pointerleave", handleLeave)
        }
      })

      const magneticCleanups = magneticTargets.map((element) =>
        attachMagneticEffect(element, { strength: 0.22, duration: 0.3 }),
      )

      return () => {
        hoverCleanups.forEach((cleanup) => cleanup())
        magneticCleanups.forEach((cleanup) => cleanup())
      }
    },
    { scope: sectionRef, dependencies: [visibleStories] },
  )

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-white/6 bg-transparent px-6 py-24 md:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_28%),radial-gradient(circle_at_top_left,rgba(240,180,41,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] [background-size:12px_12px]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/8" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/8" />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.4em] text-black/42 transition-colors duration-500 dark:text-white/42">
              COMMUNITY // STORIES
            </p>
            <h2
              className="text-6xl font-black uppercase italic leading-none tracking-[-0.05em] text-black transition-colors duration-500 dark:text-white md:text-8xl"
              style={{ fontFamily: "var(--font-ui-sans)" }}
            >
              FROM THE STREETS
            </h2>
          </div>

          <Link
            href="/news"
            data-magnetic
            className="w-fit font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/72 transition-colors duration-300 hover:text-black dark:text-white/72 dark:hover:text-[#F0B429]"
          >
            View All Stories -{">"}
          </Link>
        </div>

        <motion.div
          variants={bentoRevealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-12 md:grid-rows-2 md:gap-10"
        >
          {visibleStories.map((story, index) => {
            const layout = STORY_LAYOUTS[index] ?? STORY_LAYOUTS[STORY_LAYOUTS.length - 1]

            return (
              <motion.article
                key={story.id}
                data-bento-card
                variants={bentoRevealItem}
                style={{ rotate: layout.rotation }}
                className={`group relative transform-gpu border border-white/10 bg-[#0c0c0c] p-4 shadow-[10px_10px_0px_rgba(240,180,41,0.12)] md:p-5 ${layout.gridClasses}`}
              >
                <Link href={story.href} className="absolute inset-0 z-30" aria-label={story.title} />

                <div className={`flex h-full flex-col ${layout.horizontal ? "md:flex-row md:items-stretch md:gap-0" : ""}`}>
                  <div
                    className={`relative overflow-hidden border border-white/10 ${layout.imageClasses}`}
                  >
                    {story.image ? (
                      <Image
                        data-card-image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes={
                          layout.horizontal
                            ? "(max-width: 768px) 100vw, 42vw"
                            : "(max-width: 768px) 100vw, 36vw"
                        }
                        className="homepage-media-fade object-cover grayscale contrast-[1.35] brightness-[0.88] transition-all duration-500 group-hover:scale-[1.08] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
                      />
                    ) : (
                      <div
                        data-card-fallback
                        className="absolute inset-0 bg-[linear-gradient(135deg,#232323,#090909)]"
                      />
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.5)_100%)]" />
                  </div>

                  <div
                    className={`relative z-20 border border-white/10 bg-[#111111] p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.24)] md:p-5 ${layout.contentClasses}`}
                  >
                    <RippedBadge label={story.tag} />

                    <h3
                      data-card-title
                      className={`mt-4 font-black uppercase italic leading-[0.92] tracking-[-0.04em] text-white transition-colors group-hover:text-[#F0B429] ${layout.titleClasses}`}
                      style={{ fontFamily: "var(--font-ui-sans)" }}
                    >
                      {story.title}
                    </h3>

                    <div
                      data-card-meta
                      className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4"
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/54">
                        Read Story
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/42">
                        [{story.date}]
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default FromTheStreets
