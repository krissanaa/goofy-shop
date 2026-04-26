"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import type { GoofyStory } from "./homepage-types"

gsap.registerPlugin(ScrollTrigger)

const FT = "var(--font-title, 'Aerosoldier'), var(--font-noto-sans, sans-serif)"
const FC = "var(--font-content, 'Glancyr'), var(--font-noto-sans, sans-serif)"

/* ═══════════════════════════════════════════════════════════════════
   S3: FROM THE STREETS — Community / News / Events

   Street wall aesthetic: brick texture background, spray paint splatters,
   tape-on-wall cards with slight rotations, drip marks under title,
   sticker tag remnants. Cards look like posters taped to a wall.

   USAGE:
   Replace S3Projects call in GoofyHomepage return() with:
   <S3FromTheStreets stories={stories} />

   This section is used by the homepage composition file.
   It shares the same GoofyStory shape as the rest of the homepage modules.
   ═══════════════════════════════════════════════════════════════════ */

export function S3FromTheStreets({ stories }: { stories: GoofyStory[] }) {
  const ref = useRef<HTMLElement>(null)

  const placeholders: GoofyStory[] = [
    { id: "p1", title: "Grand Opening Coming Soon", image: null, href: "/community", category: "event", date: "2026" },
    { id: "p2", title: "First Skate Shop in Laos", image: null, href: "/community", category: "news", date: "2026" },
    { id: "p3", title: "Join The Goofy Crew", image: null, href: "/community", category: "community", date: "2026" },
    { id: "p4", title: "Skate Night Vientiane", image: null, href: "/community", category: "event", date: "2026" },
    { id: "p5", title: "New Deck Drop: Baker x Goofy", image: null, href: "/community", category: "news", date: "2026" },
    { id: "p6", title: "Local Skater Spotlight", image: null, href: "/community", category: "community", date: "2026" },
  ]

  const items = stories.length > 0 ? stories.slice(0, 6) : placeholders

  const badgeStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "event": return "bg-[#EE3A24] text-white rotate-[-3deg]"
      case "news": return "bg-black text-white rotate-[2deg]"
      case "community": return "bg-[#d4f542] text-black rotate-[-2deg]"
      default: return "bg-black/10 text-black rotate-[1deg]"
    }
  }

  const cardRotations = ["-1.2deg", "0.8deg", "-0.6deg", "1.2deg", "-0.8deg", "0.5deg"]

  useGSAP(() => {
    if (!ref.current) return
    gsap.from(".fts-title", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } })
    gsap.from(".fts-hero", { x: -30, rotate: -3, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 65%", once: true } })
    gsap.from(".fts-card", { y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 60%", once: true } })
    gsap.from(".fts-splat", { opacity: 0, scale: 0, stagger: 0.08, duration: 0.5, ease: "back.out(2)",
      scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background: "#e8e4de",
        backgroundImage: [
          "linear-gradient(to right, rgba(0,0,0,0.025) 1px, transparent 1px)",
          "linear-gradient(to bottom, rgba(0,0,0,0.025) 1px, transparent 1px)",
        ].join(","),
        backgroundSize: "60px 30px",
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="pointer-events-none absolute right-[10%] top-[8%] z-0">
        {[...Array(10)].map((_, i) => (
          <div key={`sr${i}`} className="fts-splat absolute rounded-full bg-[#EE3A24]"
            style={{ width: 4 + Math.random() * 12, height: 4 + Math.random() * 12, top: Math.random() * 120, left: Math.random() * 120, opacity: 0.04 + Math.random() * 0.06 }} />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-[12%] left-[5%] z-0">
        {[...Array(8)].map((_, i) => (
          <div key={`sl${i}`} className="fts-splat absolute rounded-full bg-black"
            style={{ width: 3 + Math.random() * 10, height: 3 + Math.random() * 10, top: Math.random() * 100, left: Math.random() * 100, opacity: 0.03 + Math.random() * 0.05 }} />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-[20%] left-[3%] z-0 rotate-[12deg] opacity-[0.04]">
        <span className="text-[44px] uppercase text-black" style={{ fontFamily: FT }}>GOOFY</span>
      </div>
      <div className="pointer-events-none absolute right-[6%] top-[45%] z-0 rotate-[-8deg] opacity-[0.05]">
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-[2px] border-black/10">
          <span className="text-[20px] text-black/20" style={{ fontFamily: FT }}>G</span>
        </div>
      </div>

      <svg className="pointer-events-none absolute left-[35%] top-[30%] z-0 hidden opacity-[0.03] md:block" width="200" height="200" viewBox="0 0 200 200">
        <line x1="20" y1="20" x2="180" y2="180" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="180" y1="20" x2="20" y2="180" stroke="#1a1a1a" strokeWidth="3" />
      </svg>

      <div className="relative z-10 px-5 sm:px-8 md:px-16 lg:px-24">
        <div className="fts-title mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-black/40 md:text-[11px]" style={{ fontFamily: FC }}>
              ● Community &nbsp;|&nbsp; ● News &nbsp;|&nbsp; ● Events
            </p>
            <h2 className="text-[clamp(48px,10vw,120px)] uppercase leading-[0.85] text-black" style={{ fontFamily: FT }}>
              From The
            </h2>
            <h2 className="relative text-[clamp(48px,10vw,120px)] uppercase leading-[0.85] text-[#EE3A24]" style={{ fontFamily: FT }}>
              Streets
              <span className="absolute -bottom-4 left-[10%] h-[35px] w-[2.5px] bg-[#EE3A24] opacity-[0.15]" />
              <span className="absolute -bottom-6 left-[22%] h-[50px] w-[2px] bg-[#EE3A24] opacity-[0.12]" />
              <span className="absolute -bottom-3 left-[38%] h-[28px] w-[2px] bg-[#EE3A24] opacity-[0.10]" />
            </h2>
            <p className="mt-3 text-[13px] text-[#EE3A24] md:text-[14px]" style={{ fontFamily: FC }}>
              จากท้องถนน
              <svg className="mt-1 block opacity-30" width="120" height="6" viewBox="0 0 120 6">
                <path d="M0 3 Q15 0 30 3 Q45 6 60 3 Q75 0 90 3 Q105 6 120 3" stroke="#EE3A24" strokeWidth="1.5" fill="none" />
              </svg>
            </p>
            <div className="mt-6 h-[2px] w-[60px] bg-[#EE3A24]" />
          </div>
          <Link href="/community" className="text-[10px] uppercase tracking-[0.15em] text-black/40 transition-colors hover:text-[#EE3A24] md:text-[11px]" style={{ fontFamily: FC }}>
            View all →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-12 md:gap-6">
          {items[0] && (
            <Link href={items[0].href}
              className="fts-hero group relative col-span-full overflow-hidden rounded-2xl border-[2px] border-black/[0.06] md:col-span-7 md:row-span-2"
              style={{ transform: `rotate(${cardRotations[0]})`, boxShadow: "4px 4px 0px rgba(0,0,0,0.08)", transition: "transform 400ms ease, box-shadow 400ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)"; e.currentTarget.style.boxShadow = "6px 8px 0px rgba(0,0,0,0.12)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${cardRotations[0]})`; e.currentTarget.style.boxShadow = "4px 4px 0px rgba(0,0,0,0.08)" }}
            >
              <div className="absolute left-1/2 top-[-4px] z-30 h-[10px] w-[28px] -translate-x-1/2 rotate-[2deg] bg-black/[0.06]" />
              <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-[#EE3A24]" />
              <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full md:min-h-[460px]">
                {items[0].image ? (
                  <Image src={items[0].image} alt={items[0].title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                ) : (
                  <div className="h-full w-full" style={{ background: "linear-gradient(145deg, #e0dcd4 0%, #ccc8c0 40%, #b8b4ac 100%)" }}>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                <div className="absolute left-4 top-4 z-20 md:left-6 md:top-6">
                  <span className={`inline-block rounded-full px-3 py-1.5 text-[10px] font-bold uppercase shadow-sm md:text-[11px] ${badgeStyle(items[0].category)}`} style={{ fontFamily: FC }}>
                    {items[0].category}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-8">
                  <h3 className="text-[clamp(22px,4vw,40px)] uppercase leading-[0.88] text-white transition-colors duration-300 group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>
                    {items[0].title}
                  </h3>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/40" style={{ fontFamily: FC }}>{items[0].date}</p>
                </div>
              </div>
            </Link>
          )}

          {items.slice(1, 6).map((item, i) => {
            const isCompact = i >= 2
            return (
              <Link key={item.id} href={item.href}
                className={`fts-card group relative overflow-hidden rounded-2xl border-[2px] border-black/[0.06] bg-white ${isCompact ? "col-span-full md:col-span-4" : "col-span-full md:col-span-5"}`}
                style={{ transform: `rotate(${cardRotations[(i + 1) % cardRotations.length]})`, boxShadow: "3px 3px 0px rgba(0,0,0,0.06)", transition: "transform 400ms ease, box-shadow 400ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(-4px)"; e.currentTarget.style.boxShadow = "4px 6px 0px rgba(0,0,0,0.10)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${cardRotations[(i + 1) % cardRotations.length]})`; e.currentTarget.style.boxShadow = "3px 3px 0px rgba(0,0,0,0.06)" }}
              >
                <div className="absolute left-1/2 top-[-4px] z-30 h-[8px] w-[22px] -translate-x-1/2 rotate-[-1deg] bg-black/[0.05]" />
                <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-[#EE3A24]" />

                {isCompact ? (
                  <div className="flex items-center gap-4 p-3 md:p-4">
                    <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-lg md:h-[90px] md:w-[90px]">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="90px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: "linear-gradient(145deg, #e8e4dc, #d4d0c8)" }}>
                          <span className="text-[24px] text-black/[0.06]" style={{ fontFamily: FT }}>G</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase shadow-sm md:text-[9px] ${badgeStyle(item.category)}`} style={{ fontFamily: FC }}>
                        {item.category}
                      </span>
                      <h4 className="mt-1 text-[clamp(13px,1.5vw,17px)] font-bold uppercase leading-tight text-black transition-colors duration-300 group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/30" style={{ fontFamily: FC }}>{item.date}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: "linear-gradient(145deg, #e8e4dc 0%, #d8d4cc 50%, #c8c4bc 100%)" }}>
                          <span className="text-[40px] text-black/[0.05]" style={{ fontFamily: FT }}>G</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-5">
                      <span className={`mb-2 inline-block rounded-full px-2.5 py-1 text-[9px] font-bold uppercase shadow-sm md:text-[10px] ${badgeStyle(item.category)}`} style={{ fontFamily: FC }}>
                        {item.category}
                      </span>
                      <h4 className="mt-2 text-[clamp(15px,2vw,22px)] font-bold uppercase leading-[0.9] text-black transition-colors duration-300 group-hover:text-[#EE3A24]" style={{ fontFamily: FT }}>
                        {item.title}
                      </h4>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-black/30" style={{ fontFamily: FC }}>Goofy Journal</p>
                        <span className="text-[9px] uppercase tracking-[0.12em] text-[#EE3A24] transition-colors group-hover:text-black" style={{ fontFamily: FC }}>Read more →</span>
                      </div>
                    </div>
                  </>
                )}
              </Link>
            )
          })}
        </div>

        <svg className="pointer-events-none absolute bottom-[15%] right-[18%] z-0 hidden opacity-[0.08] md:block" width="80" height="30" viewBox="0 0 80 30">
          <path d="M0 15 Q20 8 40 15 Q60 22 80 12" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M70 6 L80 12 L72 20" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  )
}
