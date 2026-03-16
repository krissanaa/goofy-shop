"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"

export type FromTheStreetsStory = {
  id: string
  title: string
  date: string
  tag: string
  image: string | null
  href: string
}

const DEFAULT_STORIES: FromTheStreetsStory[] = [
  {
    id: "default-1",
    title: "VIENTIANE: THE NEW WAVE",
    date: "12.03.2026",
    tag: "FEATURE",
    image:
      "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=900",
    href: "/news",
  },
  {
    id: "default-2",
    title: "MEKONG RIVER SESSIONS",
    date: "10.03.2026",
    tag: "STORY",
    image:
      "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=900",
    href: "/news",
  },
  {
    id: "default-3",
    title: "DIY SPOT: THE ABANDONED PLAZA",
    date: "08.03.2026",
    tag: "SPOTLIGHT",
    image:
      "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=900",
    href: "/news",
  },
]

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
}

function getStories(stories: FromTheStreetsStory[]) {
  const filled = [...stories]

  while (filled.length < 3) {
    filled.push(DEFAULT_STORIES[filled.length])
  }

  return filled.slice(0, 3)
}

function RippedBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex w-fit bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-white goofy-mono"
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
}: {
  stories: FromTheStreetsStory[]
}) {
  const visibleStories = getStories(stories)

  return (
    <section className="relative overflow-hidden bg-[#F4F0EB] px-6 py-24 md:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(0,0,0,0.02))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,rgba(5,5,5,0.18)_1px,transparent_0)] [background-size:10px_10px]" />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.4em] text-black/45">
              COMMUNITY // STORIES
            </p>
            <h2
              className="text-6xl font-black uppercase italic leading-none tracking-[-0.05em] text-[#050505] md:text-8xl"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              FROM THE STREETS
            </h2>
          </div>

          <Link
            href="/news"
            className="w-fit font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black transition-colors duration-300 hover:text-[#F0B429]"
          >
            View All Stories -{">"}
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-12 md:grid-rows-2 md:gap-10"
        >
          {visibleStories.map((story, index) => {
            const layout = STORY_LAYOUTS[index] ?? STORY_LAYOUTS[STORY_LAYOUTS.length - 1]

            return (
              <motion.article
                key={story.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, rotate: 0, y: -4 }}
                transition={{ duration: 0.32, ease: [0.175, 0.885, 0.32, 1.275] }}
                style={{ rotate: layout.rotation }}
                className={`group relative border border-black/85 bg-[#fffdf8] p-4 shadow-[8px_8px_0px_rgba(5,5,5,0.12)] md:p-5 ${layout.gridClasses}`}
              >
                <Link href={story.href} className="absolute inset-0 z-30" aria-label={story.title} />

                <div className={`flex h-full flex-col ${layout.horizontal ? "md:flex-row md:items-stretch md:gap-0" : ""}`}>
                  <div
                    className={`relative overflow-hidden border border-black ${layout.imageClasses}`}
                  >
                    {story.image ? (
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes={
                          layout.horizontal
                            ? "(max-width: 768px) 100vw, 42vw"
                            : "(max-width: 768px) 100vw, 36vw"
                        }
                        className="object-cover grayscale contrast-[1.35] brightness-[0.88] transition-all duration-500 group-hover:scale-[1.08] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#bdb7ae,#8d877e)]" />
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.28)_100%)]" />
                  </div>

                  <div
                    className={`relative z-20 border border-black bg-[#F4F0EB] p-4 shadow-[6px_6px_0px_rgba(5,5,5,0.08)] md:p-5 ${layout.contentClasses}`}
                  >
                    <RippedBadge label={story.tag} />

                    <h3
                      className={`mt-4 font-black uppercase italic leading-[0.92] tracking-[-0.04em] text-[#050505] transition-colors group-hover:text-[#F0B429] ${layout.titleClasses}`}
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      {story.title}
                    </h3>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/15 pt-4">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/55">
                        Read Story
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
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
