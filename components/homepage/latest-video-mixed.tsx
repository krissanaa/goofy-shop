"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const HUD_FPS = 60
const FALLBACK_LOOP_SECONDS = 12
const COMMUNITY_VIDEO_HREF = "/videos"
const YOUTUBE_CHANNEL_HREF = "https://youtube.com/@goofyskate"

const GLITCH_FEEDS = [
    {
        id: "CAM_02", label: "GLITCH_DETECTED", offset: 0.72,
        frameClassName: "absolute right-4 top-4 z-20 hidden h-32 w-52 overflow-hidden border border-[#EE3A24] bg-black md:block lg:right-10 lg:top-8 lg:h-40 lg:w-64",
        mediaClassName: "absolute inset-0 h-full w-full object-cover opacity-60 grayscale contrast-[1.9] brightness-[0.72]",
        textClassName: "absolute left-2 top-2 font-mono text-[8px] uppercase tracking-[0.28em] text-[#EE3A24]",
        overlayClassName: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.24)_50%,rgba(0,0,0,0.45)_100%)]",
        scanlineClassName: "pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]",
    },
    {
        id: "CAM_03", label: "GPS_LOCKED", offset: 1.34,
        frameClassName: "absolute bottom-[-18px] left-4 z-20 hidden h-28 w-48 overflow-hidden border border-[#EE3A24] bg-black md:block lg:bottom-[-28px] lg:left-10 lg:h-36 lg:w-64",
        mediaClassName: "absolute inset-0 h-full w-full object-cover opacity-70 sepia saturate-[1.4] contrast-[1.15] brightness-[0.88]",
        textClassName: "absolute bottom-3 left-3 font-mono text-[8px] uppercase tracking-[0.28em] text-[#F4F0EB]",
        overlayClassName: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(240,180,41,0.12),rgba(120,72,8,0.12)_38%,rgba(0,0,0,0.34)_100%)] mix-blend-screen",
        scanlineClassName: "pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_bottom,rgba(240,180,41,0.24)_0,rgba(240,180,41,0.24)_1px,transparent_1px,transparent_5px)] [background-size:100%_5px]",
    },
    {
        id: "CAM_04", label: "ARCHIVE_BUFFER", offset: 2.08,
        frameClassName: "absolute left-[11%] top-10 z-20 hidden h-24 w-40 overflow-hidden border border-[#EE3A24] bg-black xl:block",
        mediaClassName: "absolute inset-0 h-full w-full object-cover opacity-58 grayscale contrast-[1.55] brightness-[0.7] hue-rotate-[160deg] saturate-[1.7]",
        textClassName: "absolute right-2 top-2 font-mono text-[8px] uppercase tracking-[0.28em] text-[#8DE9FF]",
        overlayClassName: "pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,102,132,0.28),rgba(0,0,0,0.1)_35%,rgba(4,18,30,0.38)_100%)] mix-blend-screen",
        scanlineClassName: "pointer-events-none absolute inset-0 opacity-[0.2] [background-image:linear-gradient(to_bottom,rgba(141,233,255,0.18)_0,rgba(141,233,255,0.18)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]",
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
        if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "") || null
        if (url.hostname.includes("youtube.com")) {
            if (url.pathname.startsWith("/watch")) return url.searchParams.get("v")
            if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1] || null
            if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1] || null
        }
    } catch { return null }
    return null
}

function getYouTubeEmbedUrl(videoId: string, startAt = 0) {
    const params = new URLSearchParams({
        autoplay: "1", mute: "1", controls: "0", loop: "1", playlist: videoId,
        playsinline: "1", rel: "0", modestbranding: "1", iv_load_policy: "3",
        start: Math.max(0, Math.floor(startAt)).toString(),
    })
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function formatTimecode(totalSeconds: number, fps = HUD_FPS) {
    const totalFrames = Math.floor(totalSeconds * fps)
    const h = Math.floor(totalFrames / (fps * 3600))
    const m = Math.floor(totalFrames / (fps * 60)) % 60
    const s = Math.floor(totalFrames / fps) % 60
    const f = totalFrames % fps
    return [h, m, s, f].map((v) => v.toString().padStart(2, "0")).join(":")
}

type FeedSurfaceProps = {
    alt: string; className: string; image?: string | null; poster?: string | null
    source?: string | null; youtubeUrl?: string | null; startAt?: number
    videoRef?: (node: HTMLVideoElement | null) => void
}

function FeedSurface({ alt, className, image, poster, source, youtubeUrl, startAt = 0, videoRef }: FeedSurfaceProps) {
    const youtubeId = getYouTubeId(source) || getYouTubeId(youtubeUrl)
    if (youtubeId) {
        return <iframe src={getYouTubeEmbedUrl(youtubeId, startAt)} title={alt} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className={className} />
    }
    if (isDirectVideoSource(source)) {
        return (
            <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster={poster || image || undefined} className={className}
                   onLoadedMetadata={(e) => { const v = e.currentTarget; if (v.duration > 0) { v.currentTime = Math.min(startAt, Math.max(v.duration - 0.05, 0)) } void v.play().catch(() => {}) }}>
                <source src={source ?? undefined} type={getVideoMimeType(source ?? "")} />
            </video>
        )
    }
    if (image) return <Image src={image} alt={alt} fill sizes="100vw" className={className} />
    return <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#050505)]" />
}

export function LatestVideoMixed({
                                     title, description, href, image, metaLabel, videoSrc,
                                     primaryButtonLabel, primaryButtonHref, secondaryButtonLabel, secondaryButtonHref, footerHint,
                                 }: {
    title: string; description: string; href?: string; image?: string | null; metaLabel?: string
    videoSrc?: string | null; primaryButtonLabel?: string; primaryButtonHref?: string
    secondaryButtonLabel?: string; secondaryButtonHref?: string; footerHint?: string
}) {
    const sectionRef = useRef<HTMLElement | null>(null)
    const stripRef = useRef<HTMLDivElement | null>(null)
    const mainVideoRef = useRef<HTMLVideoElement | null>(null)
    const overlayVideoRefs = useRef<Array<HTMLVideoElement | null>>([])
    const [progressWidth, setProgressWidth] = useState(0)
    const [timecode, setTimecode] = useState(formatTimecode(0))
    const youtubeId = getYouTubeId(videoSrc) || getYouTubeId(href)

    /* ── GSAP scroll animations ── */
    useGSAP(
        () => {
            const el = sectionRef.current
            const strip = stripRef.current
            if (!el || !strip) return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

            /* ── Cinematic strip reveal: width 60%→100%, borderRadius 26→0, y parallax ── */
            gsap.fromTo(strip,
                { width: "60%", borderRadius: 26, y: 60, opacity: 0.7 },
                {
                    width: "100%", borderRadius: 0, y: -20, opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el, start: "top 80%", end: "center center",
                        scrub: 1.5,
                    },
                },
            )

            /* ── Glitch feeds slide in from edges ── */
            const feeds = gsap.utils.toArray<HTMLElement>("[data-glitch-feed]", el)
            feeds.forEach((feed, i) => {
                const fromX = i === 1 ? -60 : 60
                const fromY = i === 1 ? 30 : -24
                gsap.fromTo(feed,
                    { opacity: 0, x: fromX, y: fromY, scale: 0.8 },
                    {
                        opacity: 1, x: 0, y: 0, scale: 1,
                        duration: 0.8, ease: "power3.out",
                        scrollTrigger: { trigger: strip, start: "top 60%", once: true },
                        delay: 0.2 + i * 0.15,
                    },
                )
            })

            /* ── Animated scanline sweep ── */
            const scanOverlay = el.querySelector<HTMLElement>("[data-scan-sweep]")
            if (scanOverlay) {
                gsap.to(scanOverlay, {
                    backgroundPosition: "0 100%",
                    duration: 4,
                    ease: "none",
                    repeat: -1,
                })
            }

            /* ── CTA section reveal ── */
            const ctaBlock = el.querySelector<HTMLElement>("[data-cta-block]")
            if (ctaBlock) {
                gsap.fromTo(ctaBlock,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                        scrollTrigger: { trigger: ctaBlock, start: "top 90%", once: true } },
                )
            }

            /* ── Title chars reveal (if not youtube) ── */
            const titleChars = gsap.utils.toArray<HTMLElement>("[data-video-title-char]", el)
            if (titleChars.length) {
                gsap.fromTo(titleChars,
                    { opacity: 0, y: 40, rotateX: -60 },
                    {
                        opacity: 1, y: 0, rotateX: 0,
                        duration: 0.6, ease: "power4.out", stagger: 0.025,
                        scrollTrigger: { trigger: titleChars[0]?.parentElement, start: "top 85%", once: true },
                    },
                )
            }
        },
        { scope: sectionRef, dependencies: [title, videoSrc] },
    )

    /* ── HUD timecode + progress ── */
    useEffect(() => {
        if (isDirectVideoSource(videoSrc) && mainVideoRef.current) {
            const vid = mainVideoRef.current
            const update = () => {
                const dur = vid.duration || FALLBACK_LOOP_SECONDS
                setProgressWidth((vid.currentTime / dur) * 100)
                setTimecode(formatTimecode(vid.currentTime))
            }
            const seed = () => {
                overlayVideoRefs.current.forEach((v, i) => {
                    const off = GLITCH_FEEDS[i]?.offset ?? 0
                    if (!v || !(v.duration > 0)) return
                    v.currentTime = Math.min(off, Math.max(v.duration - 0.05, 0))
                    void v.play().catch(() => {})
                })
            }
            const onMeta = () => { update(); seed() }
            vid.addEventListener("loadedmetadata", onMeta)
            vid.addEventListener("timeupdate", update)
            if (vid.readyState >= 1) onMeta()
            return () => { vid.removeEventListener("loadedmetadata", onMeta); vid.removeEventListener("timeupdate", update) }
        }
        const t0 = Date.now()
        const timer = window.setInterval(() => {
            const elapsed = ((Date.now() - t0) / 1000) % FALLBACK_LOOP_SECONDS
            setProgressWidth((elapsed / FALLBACK_LOOP_SECONDS) * 100)
            setTimecode(formatTimecode(elapsed))
        }, 100)
        return () => window.clearInterval(timer)
    }, [videoSrc])

    /* ── Split title into chars for reveal ── */
    const titleChars = (title || "").split("")

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-transparent py-28 md:py-40">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.38)_1px,transparent_0)] [background-size:14px_14px]" />

            <div className="relative z-10 w-full">
                {/* ── Video strip ── */}
                <div
                    ref={stripRef}
                    className="homepage-media-fade group relative mx-auto overflow-hidden border-y border-black/10 bg-[#111111] shadow-[0_30px_120px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#050505] dark:shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
                    style={{ willChange: "width, border-radius" }}
                >
                    <div className="relative h-[260px] md:h-[430px] lg:h-[520px]">
                        <FeedSurface
                            alt={title} className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.01]"
                            image={image} poster={image} source={videoSrc} youtubeUrl={href}
                            videoRef={(n) => { mainVideoRef.current = n }}
                        />

                        {/* Overlays */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.04)_28%,rgba(5,5,5,0.14)_100%)]" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_4px)] [background-size:100%_4px]" />

                        {/* Animated scanline sweep */}
                        <div
                            data-scan-sweep
                            className="pointer-events-none absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: "linear-gradient(180deg, transparent 0%, rgba(240,180,41,0.3) 2%, transparent 4%)",
                                backgroundSize: "100% 300%",
                                backgroundPosition: "0 0",
                            }}
                        />

                        {/* HUD elements */}
                        <div className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full border border-black/10 bg-white/82 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/78 backdrop-blur-sm dark:border-white/10 dark:bg-black/55 dark:text-white/75">
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#ff3b30]" />
                            REC
                        </div>

                        <div className="absolute right-4 top-4 z-30 rounded-full border border-black/10 bg-white/78 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.26em] text-black/62 backdrop-blur-sm dark:border-white/10 dark:bg-black/45 dark:text-white/58 md:right-6 md:top-6">
                            FPS: 60 // ISO: 800
                        </div>

                        <div className="absolute bottom-5 left-4 z-30 rounded-full border border-black/10 bg-white/78 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-black/64 backdrop-blur-sm dark:border-white/10 dark:bg-black/45 dark:text-white/52 md:left-6">
                            {metaLabel ?? "RAW EXPORT // VIENTIANE 2026"}
                        </div>

                        <div className="absolute bottom-5 right-4 z-30 rounded-full border border-black/10 bg-white/78 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#8a2a1a] backdrop-blur-sm dark:border-white/10 dark:bg-black/45 dark:text-[#EE3A24] md:right-6">
                            TC: {timecode}
                        </div>

                        {/* Glitch feeds */}
                        {GLITCH_FEEDS.map((feed, index) => (
                            <div key={feed.id} data-glitch-feed className={feed.frameClassName}>
                                <FeedSurface
                                    alt={`${title} ${feed.id}`} className={`pointer-events-none ${feed.mediaClassName}`}
                                    image={image} poster={image} source={videoSrc} youtubeUrl={href} startAt={feed.offset}
                                    videoRef={(n) => { overlayVideoRefs.current[index] = n }}
                                />
                                <div className={feed.overlayClassName} />
                                <div className={feed.scanlineClassName} />
                                <p className={feed.textClassName}>{feed.id} // {feed.label}</p>
                            </div>
                        ))}

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#171717]" />
                        <div className="absolute bottom-0 left-0 z-30 h-[3px] bg-[#EE3A24] transition-[width] duration-100" style={{ width: `${progressWidth}%` }} />
                    </div>
                </div>

                {/* ── CTA block ── */}
                <div data-cta-block className="mx-auto mt-14 max-w-[1040px] px-6 text-center md:px-12">
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.5em] text-black/42 dark:text-white/34">
                        {metaLabel ?? "RAW EXPORT // VIENTIANE 2026"}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={primaryButtonHref ?? COMMUNITY_VIDEO_HREF}
                            className="group/btn relative inline-flex items-center justify-center overflow-hidden bg-[#EE3A24] px-10 py-4 text-xl font-black uppercase italic text-black transition-colors hover:bg-white"
                            style={{ fontFamily: "var(--font-ui-sans)" }}
                        >
                            <span className="relative z-10">{primaryButtonLabel ?? "Watch On Goofy TV"} {"↗"}</span>
                        </Link>

                        <a
                            href={secondaryButtonHref ?? YOUTUBE_CHANNEL_HREF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border-b border-black/10 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-black/58 transition-opacity hover:opacity-70 dark:border-white/10 dark:text-white/40"
                        >
                            <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                            </svg>
                            {secondaryButtonLabel ?? "YouTube Channel"}
                        </a>
                    </div>

                    <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.28em] text-black/38 dark:text-white/26">
                        {footerHint ?? "Stay on site for exclusive content"}
                    </p>

                    {/* ── Title with per-char reveal ── */}
                    {!youtubeId && (
                        <>
                            <h3
                                className="mx-auto mt-8 max-w-[920px] text-[clamp(2.4rem,5vw,5rem)] font-black uppercase italic leading-[0.9] tracking-[-0.05em] text-black dark:text-white [perspective:600px]"
                                style={{ fontFamily: "var(--font-ui-sans)" }}
                            >
                                {titleChars.map((char, i) => (
                                    <span key={`${i}-${char}`} data-video-title-char className="inline-block" style={{ willChange: "transform, opacity" }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                                ))}
                            </h3>
                            <p className="mx-auto mt-4 max-w-[760px] font-mono text-[11px] uppercase tracking-[0.18em] text-black/58 dark:text-white/40">
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