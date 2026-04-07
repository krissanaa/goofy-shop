"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { type TeamRosterMember } from "@/lib/team-roster"

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.08,
    },
  },
}

const editorialEase = [0.16, 1, 0.3, 1] as const

const revealItem = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: editorialEase,
    },
  },
}

export function HomepageTeamPreview({
  members,
}: {
  members: TeamRosterMember[]
}) {
  const visibleMembers = members.slice(0, 4)

  if (visibleMembers.length === 0) {
    return null
  }

  return (
    <section
      id="team"
      className="relative bg-transparent px-4 py-24 text-black transition-colors duration-500 dark:text-white md:px-12"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="goofy-mono text-[10px] uppercase tracking-[0.32em] text-black/58 transition-colors duration-500 dark:text-[#EE3A24]">
              TEAM / LOCAL MOTION / GOOFY
            </p>
            <h2 className="goofy-display text-[clamp(42px,6vw,82px)] italic leading-[0.84] text-black transition-colors duration-500 dark:text-white">
              Team
            </h2>
          </div>

          <Link
            href="/teams"
            className="goofy-mono inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/62 transition-colors duration-300 hover:text-black dark:text-white/58 dark:hover:text-white"
          >
            View Full Roster
            <span className="text-[#EE3A24]">{"->"}</span>
          </Link>
        </div>

        <motion.div
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {visibleMembers.map((member, index) => (
            <motion.article
              key={member.id}
              variants={revealItem}
              className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white/76 p-3 shadow-[0_18px_45px_rgba(5,5,5,0.12)] backdrop-blur-sm transition-colors duration-500 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-black/5 dark:bg-white/5">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                  priority={index === 0}
                  className="object-cover grayscale transition duration-700 group-hover:scale-[1.05] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,245,245,0.02),rgba(245,245,245,0.8)_100%)] transition-colors duration-500 dark:bg-[linear-gradient(180deg,rgba(5,5,5,0.05),rgba(5,5,5,0.78)_100%)]" />
                <div className="absolute left-4 top-4 rounded-full border border-black/10 bg-white/82 px-3 py-1 goofy-mono text-[9px] uppercase tracking-[0.22em] text-black transition-colors duration-500 dark:border-white/12 dark:bg-black/45 dark:text-white">
                  {member.status}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="goofy-display text-[clamp(28px,4vw,42px)] italic leading-none text-black transition-colors duration-500 dark:text-white">
                    {member.name}
                  </h3>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
