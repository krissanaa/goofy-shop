"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const HUD_FPS = 60
const FALLBACK_LOOP_SECONDS = 12
const COMMUNITY_VIDEO_HREF = "/videos"
const YOUTUBE_CHANNEL_HREF = "https://youtube.com/@goofyskate"
const GLITCH_FEEDS = [
  {
    id: "CAM_02",
    label: "GLITCH_DETECTED",
    offset: 0.72,
    frameClassName:
      "absolute right-4 top-4 z-20 hidden h-32 w-52 overflow-hidden border border-[#F0B429] bg-black md:block lg:right-10 lg:top-8 lg:h-40 lg:w-64",
    mediaClassName:
      "absolute inset-0 h-full w-full object-cover opacity-60 grayscale contrast-[1.9] brightness-[0.72]",
    textClassName:
      "absolute left-2 top-2 font-mono text-[8px] uppercase tracking-[0.28em] text-[#F0B429]",
    overlayClassName:
      "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24)_50%,rgba(0,0,0,0.45)_100%)]",
    scanlineClassName:
      "pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]",
  },
  {
    id: "CAM_03",
    label: "GPS_LOCKED",
    offset: 1.34,
    frameClassName:
      "absolute bottom-[-18px] left-4 z-20 hidden h-28 w-48 overflow-hidden border border-[#F0B429] bg-black md:block lg:bottom-[-28px] lg:left-10 lg:h-36 lg:w-64",
    mediaClassName:
      "absolute inset-0 h-full w-full object-cover opacity-70 sepia saturate-[1.4] contrast-[1.15] brightness-[0.88]",
    textClassName:
      "absolute bottom-3 left-3 font-mono text-[8px] uppercase tracking-[0.28em] text-[#F4F0EB]",
    overlayClassName:
      "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(240,180,41,0.12),rgba(120,72,8,0.12)_38%,rgba(0,0,0,0.34)_100%)] mix-blend-screen",
    scanlineClassName:
      "pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_bottom,rgba(240,180,41,0.24)_0,rgba(240,180,41,0.24)_1px,transparent_1px,transparent_5px)] [background-size:100%_5px]",
  },
  {
    id: "CAM_04",
    label: "ARCHIVE_BUFFER",
    offset: 2.08,
    frameClassName:
      "absolute left-[11%] top-10 z-20 hidden h-24 w-40 overflow-hidden border border-[#F0B429] bg-black xl:block",
    mediaClassName:
      "absolute inset-0 h-full w-full object-cover opacity-58 grayscale contrast-[1.55] brightness-[0.7] hue-rotate-[160deg] saturate-[1.7]",
    textClassName:
      "absolute right-2 top-2 font-mono text-[8px] uppercase tracking-[0.28em] text-[#8DE9FF]",
    overlayClassName:
      "pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,102,132,0.28),rgba(0,0,0,0.1)_35%,rgba(4,18,30,0.38)_100%)] mix-blend-screen",
    scanlineClassName:
      "pointer-events-none absolute inset-0 opacity-[0.2] [background-image:linear-gradient(to_bottom,rgba(141,233,255,0.18)_0,rgba(141,233,255,0.18)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]",
  },
]

function isDirectVideoSource(src?: string | null) {
  return Boolean(src && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src))
}

function getVideoMimeType(src: string) {
  if (/\.webm(\?.*)?$/i.test(src)) return "video/webm"
  if (/\.ogg(\?.*)?$/i.test(src)) return "video/ogg"
  if (/\.mov(\?.*)?$/i.test(src)) return "video/quicktime"
  return "video/mp4"
}

function getYouTubeId(value?: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || null
    }

    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        return url.searchParams.get("v")
      }

      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/embed/")[1] || null
      }

      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/shorts/")[1] || null
      }
    }
  } catch {
    return null
  }

  return null
}

function getYouTubeEmbedUrl(videoId: string, startAt = 0) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    start: Math.max(0, Math.floor(startAt)).toString(),
  })

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function formatTimecode(totalSeconds: number, fps = HUD_FPS) {
  const totalFrames = Math.floor(totalSeconds * fps)
  const hours = Math.floor(totalFrames / (fps * 60 * 60))
  const minutes = Math.floor(totalFrames / (fps * 60)) % 60
  const seconds = Math.floor(totalFrames / fps) % 60
  const frames = totalFrames % fps

  return [hours, minutes, seconds, frames]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":")
}

type FeedSurfaceProps = {
  alt: string
  className: string
  image?: string | null
  poster?: string | null
  source?: string | null
  youtubeUrl?: string | null
  startAt?: number
  videoRef?: (node: HTMLVideoElement | null) => void
}

function FeedSurface({
  alt,
  className,
  image,
  poster,
  source,
  youtubeUrl,
  startAt = 0,
  videoRef,
}: FeedSurfaceProps) {
  const youtubeId = getYouTubeId(source) || getYouTubeId(youtubeUrl)

  if (youtubeId) {
    return (
      <iframe
        src={getYouTubeEmbedUrl(youtubeId, startAt)}
        title={alt}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className={className}
      />
    )
  }

  if (isDirectVideoSource(source)) {
    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster || image || undefined}
        className={className}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget
          if (video.duration > 0) {
            video.currentTime = Math.min(startAt, Math.max(video.duration - 0.05, 0))
          }
          void video.play().catch(() => {})
        }}
      >
        <source src={source ?? undefined} type={getVideoMimeType(source ?? "")} />
      </video>
    )
  }

  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className={className}
      />
    )
  }

  return <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#050505)]" />
}

export function LatestVideoMixed({
  title,
  description,
  href,
  image,
  metaLabel,
  videoSrc,
}: {
  title: string
  description: string
  href?: string
  image?: string | null
  metaLabel?: string
  videoSrc?: string | null
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const mainVideoRef = useRef<HTMLVideoElement | null>(null)
  const overlayVideoRefs = useRef<Array<HTMLVideoElement | null>>([])
  const [progressWidth, setProgressWidth] = useState(0)
  const [timecode, setTimecode] = useState(formatTimecode(0))
  const youtubeId = getYouTubeId(videoSrc) || getYouTubeId(href)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const stripWidth = useTransform(scrollYProgress, [0, 0.55], ["70%", "100%"])
  const stripY = useTransform(scrollYProgress, [0, 1], [48, -20])
  const stripRadius = useTransform(scrollYProgress, [0, 0.55], [26, 0])

  useEffect(() => {
    if (isDirectVideoSource(videoSrc) && mainVideoRef.current) {
      const mainVideo = mainVideoRef.current

      const updateHud = () => {
        const duration = mainVideo.duration || FALLBACK_LOOP_SECONDS
        setProgressWidth((mainVideo.currentTime / duration) * 100)
        setTimecode(formatTimecode(mainVideo.currentTime))
      }

      const seedOverlayOffsets = () => {
        overlayVideoRefs.current.forEach((video, index) => {
          const offset = GLITCH_FEEDS[index]?.offset ?? 0
          if (!video || !(video.duration > 0)) return

          video.currentTime = Math.min(offset, Math.max(video.duration - 0.05, 0))
          void video.play().catch(() => {})
        })
      }

      const handleLoadedMetadata = () => {
        updateHud()
        seedOverlayOffsets()
      }

      mainVideo.addEventListener("loadedmetadata", handleLoadedMetadata)
      mainVideo.addEventListener("timeupdate", updateHud)

      if (mainVideo.readyState >= 1) {
        handleLoadedMetadata()
      }

      return () => {
        mainVideo.removeEventListener("loadedmetadata", handleLoadedMetadata)
        mainVideo.removeEventListener("timeupdate", updateHud)
      }
    }

    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = ((Date.now() - startedAt) / 1000) % FALLBACK_LOOP_SECONDS
      setProgressWidth((elapsed / FALLBACK_LOOP_SECONDS) * 100)
      setTimecode(formatTimecode(elapsed))
    }, 100)

    return () => {
      window.clearInterval(timer)
    }
  }, [videoSrc])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#050505] py-28 md:py-40">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.38)_1px,transparent_0)] [background-size:14px_14px]" />

      <div className="relative z-10 w-full">
        <motion.div
          style={{ width: stripWidth, y: stripY, borderRadius: stripRadius }}
          className="group relative mx-auto overflow-hidden border-y border-white/10 bg-[#0b0b0b] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        >
          <div className="relative h-[260px] md:h-[430px] lg:h-[520px]">
            <FeedSurface
              alt={title}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-100 transition-transform duration-1000 group-hover:scale-[1.01]"
              image={image}
              poster={image}
              source={videoSrc}
              youtubeUrl={href}
              videoRef={(node) => {
                mainVideoRef.current = node
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.04)_28%,rgba(5,5,5,0.14)_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.52)_1px,transparent_0)] [background-size:12px_12px]" />

            <div className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/75 backdrop-blur-sm">
              <motion.span
                animate={{ opacity: [1, 0.25, 1], scale: [1, 0.72, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="h-2.5 w-2.5 rounded-full bg-[#ff3b30]"
              />
              REC
            </div>

            <div className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/45 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.26em] text-white/58 backdrop-blur-sm md:right-6 md:top-6">
              FPS: 60 // ISO: 800
            </div>

            <div className="absolute bottom-5 left-4 z-30 rounded-full border border-white/10 bg-black/45 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/52 backdrop-blur-sm md:left-6">
              {metaLabel ?? "RAW EXPORT // VIENTIANE 2026"}
            </div>

            <div className="absolute bottom-5 right-4 z-30 rounded-full border border-white/10 bg-black/45 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#F0B429] backdrop-blur-sm md:right-6">
              TC: {timecode}
            </div>

            {GLITCH_FEEDS.map((feed, index) => (
              <motion.div
                key={feed.id}
                initial={{
                  opacity: 0,
                  x: index === 1 ? -40 : 40,
                  y: index === 1 ? 24 : -18,
                  rotate: index === 1 ? -1 : 2,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: index === 1 ? -1 : 2,
                }}
                viewport={{ once: true, margin: "-80px" }}
                className={feed.frameClassName}
              >
                <FeedSurface
                  alt={`${title} ${feed.id}`}
                  className={`pointer-events-none ${feed.mediaClassName}`}
                  image={image}
                  poster={image}
                  source={videoSrc}
                  youtubeUrl={href}
                  startAt={feed.offset}
                  videoRef={(node) => {
                    overlayVideoRefs.current[index] = node
                  }}
                />
                <div className={feed.overlayClassName} />
                <div className={feed.scanlineClassName} />
                <p className={feed.textClassName}>
                  {feed.id} // {feed.label}
                </p>
              </motion.div>
            ))}

            <div className="absolute bottom-0 left-0 h-px w-full bg-[#222222]" />
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#171717]" />
            <motion.div
              className="absolute bottom-0 left-0 z-30 h-[3px] bg-[#F0B429]"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </motion.div>

        <div className="mx-auto mt-14 max-w-[1040px] px-6 text-center md:px-12">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.5em] text-white/34">
            {metaLabel ?? "RAW EXPORT // VIENTIANE 2026"}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={COMMUNITY_VIDEO_HREF}
                className="inline-flex items-center justify-center bg-[#F0B429] px-10 py-4 text-xl font-black uppercase italic text-black transition-colors hover:bg-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                Watch On Goofy TV {"↗"}
              </Link>
            </motion.div>

            <motion.a
              href={YOUTUBE_CHANNEL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ opacity: 0.7 }}
              className="inline-flex items-center gap-2 border-b border-white/10 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40"
            >
              <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
              </svg>
              YouTube Channel
            </motion.a>
          </div>

          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.28em] text-white/26">
            Stay on site for exclusive content
          </p>
          {youtubeId ? null : (
            <>
              <h3
                className="mx-auto mt-8 max-w-[920px] text-[clamp(2.4rem,5vw,5rem)] font-black uppercase italic leading-[0.9] tracking-[-0.05em] text-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                {title}
              </h3>
              <p className="mx-auto mt-4 max-w-[760px] font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default LatestVideoMixed
