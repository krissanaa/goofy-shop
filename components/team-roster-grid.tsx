"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { type TeamRosterMember, type TeamStatus } from "@/lib/team-roster"

const STATUS_STYLES: Record<
  TeamStatus,
  {
    borderColor: string
    boxClassName: string
    textClassName: string
  }
> = {
  PRO: {
    borderColor: "#ff0000",
    boxClassName: "bg-[#ff0000]",
    textClassName: "text-[#F0B429]",
  },
  AM: {
    borderColor: "#0055ff",
    boxClassName: "bg-[#0055ff]",
    textClassName: "text-[#F0B429]",
  },
  FLOW: {
    borderColor: "#ffffff",
    boxClassName: "bg-white",
    textClassName: "text-black",
  },
}

export function TeamRosterGrid({
  members,
}: {
  members: TeamRosterMember[]
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])

  const playVideo = async (index: number) => {
    setActiveIndex(index)

    const video = videoRefs.current[index]
    if (!video) return

    video.currentTime = 0

    try {
      await video.play()
    } catch {
      // Keep the image-only hover state if autoplay is blocked.
    }
  }

  const stopVideo = (index: number) => {
    setActiveIndex((current) => (current === index ? null : current))

    const video = videoRefs.current[index]
    if (!video) return

    video.pause()
    video.currentTime = 0
  }

  return (
    <section className="bg-[#050505] px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {members.map((skater, index) => {
            const isActive = activeIndex === index
            const styles = STATUS_STYLES[skater.status]

            return (
              <button
                key={skater.name}
                type="button"
                aria-label={`View ${skater.name}`}
                aria-pressed={isActive}
                onMouseEnter={() => void playVideo(index)}
                onMouseLeave={() => stopVideo(index)}
                onFocus={() => void playVideo(index)}
                onBlur={() => stopVideo(index)}
                onClick={() =>
                  isActive ? stopVideo(index) : void playVideo(index)
                }
                className="group relative aspect-square w-full overflow-hidden bg-black text-left transition-all duration-300 focus:outline-none"
              >
                <div className="absolute inset-0">
                  <Image
                    src={skater.image}
                    alt={`${skater.name} portrait`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    className={`object-cover transition-all duration-300 ${
                      isActive
                        ? "scale-[1.03] grayscale-0 brightness-100"
                        : "grayscale brightness-75"
                    }`}
                  />

                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node
                    }}
                    src={skater.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div
                    className={`absolute inset-0 bg-black transition-all duration-300 ${
                      isActive ? "opacity-10" : "opacity-35"
                    }`}
                  />
                </div>

                <div
                  className="pointer-events-none absolute inset-0 border-4 transition-all duration-300"
                  style={{
                    borderColor: isActive ? styles.borderColor : "transparent",
                  }}
                />

                <div
                  className={`pointer-events-none absolute bottom-4 left-4 px-4 py-3 transition-all duration-300 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  } ${styles.boxClassName}`}
                >
                  <p
                    className={`text-[clamp(1.9rem,4vw,2.8rem)] font-black uppercase italic leading-none tracking-[-0.05em] ${styles.textClassName}`}
                    style={{ fontFamily: "var(--font-ui-sans)" }}
                  >
                    {skater.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
