import Image from "next/image"
import { Play } from "lucide-react"
import type { CSSProperties } from "react"

interface DynamicYoutubeLinksProps {
  data: any
}

interface YoutubeCardItem {
  title: string
  label: string
  date: string
  duration: string
  url: string
  thumbnailUrl: string
  accentColor: string
}

const FALLBACK_ITEMS: YoutubeCardItem[] = [
  {
    title: "Street Session Highlights",
    label: "EDIT",
    date: "Mar 1, 2026",
    duration: "06:42",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    accentColor: "#E70009",
  },
  {
    title: "Kickflip Basics in 5 Minutes",
    label: "TUTORIAL",
    date: "Feb 21, 2026",
    duration: "05:14",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    thumbnailUrl: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    accentColor: "#FBD000",
  },
  {
    title: "Deck Setup: Trucks + Wheels",
    label: "HOW TO",
    date: "Feb 10, 2026",
    duration: "08:09",
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    accentColor: "#6B8CFF",
  },
  {
    title: "Best Flatground Tricks This Week",
    label: "WEEKLY",
    date: "Jan 29, 2026",
    duration: "04:33",
    url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    thumbnailUrl: "https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg",
    accentColor: "#00AA00",
  },
]

const COLOR_BY_NAME: Record<string, string> = {
  red: "#E70009",
  yellow: "#FBD000",
  blue: "#6B8CFF",
  green: "#00AA00",
  orange: "#F97316",
  pink: "#EC4899",
  purple: "#7C3AED",
  black: "#0A0A0A",
  white: "#FFFFFF",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function toString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return "#"
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  if (rawUrl.startsWith("//")) return `https:${rawUrl}`
  return `https://${rawUrl}`
}

function resolveAssetUrl(rawUrl: string): string {
  if (!rawUrl) return ""
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  // For Supabase, we assume these are public URLs or absolute paths.
  // If we needed a base URL, it would be NEXT_PUBLIC_SUPABASE_URL.
  return rawUrl
}

function resolveMediaUrl(value: unknown): string {
  const directRecord = toRecord(value)
  if (!directRecord) return ""

  const mediaRecord = toRecord(directRecord.data) || directRecord
  const formats = toRecord(mediaRecord.formats)
  const medium = toRecord(formats?.medium)
  const small = toRecord(formats?.small)
  const thumbnail = toRecord(formats?.thumbnail)

  const rawUrl =
    toString(medium?.url) ||
    toString(small?.url) ||
    toString(thumbnail?.url) ||
    toString(mediaRecord.url)

  return resolveAssetUrl(rawUrl)
}

function isValidColorCode(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
}

function resolveAccentColor(record: Record<string, unknown>): string {
  const colorCodeRaw = toString(record.colorCode) || toString(record.color_code)
  if (isValidColorCode(colorCodeRaw)) return colorCodeRaw

  const colorNameRaw = (
    toString(record.colorName) || toString(record.color_name)
  ).toLowerCase()
  if (colorNameRaw && COLOR_BY_NAME[colorNameRaw]) {
    return COLOR_BY_NAME[colorNameRaw]
  }

  return "#E70009"
}

function normalizeCardStyle(
  value: unknown,
): "original-picture" | "color-style" {
  const style = toString(value)
  if (style === "color-style") return "color-style"
  return "original-picture"
}

function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id || null
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        return id || null
      }

      if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1]
        return id || null
      }
    }
  } catch {
    return null
  }

  return null
}

function formatDate(rawDate: string): string {
  if (!rawDate) return "Unknown date"
  const parsed = new Date(rawDate)
  if (!Number.isFinite(parsed.getTime())) return rawDate
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function normalizeItem(raw: unknown): YoutubeCardItem | null {
  const record = toRecord(raw)
  if (!record) return null

  const rawUrl = toString(record.url) || toString(record.link)
  const url = normalizeUrl(rawUrl)
  const title = toString(record.title) || "Untitled video"
  const label = (toString(record.label) || "YOUTUBE").toUpperCase()
  const date = formatDate(toString(record.date) || toString(record.publishedAt))
  const duration = toString(record.duration) || "00:00"
  const mediaThumbnail = resolveMediaUrl(record.thumbnail)
  const thumbnailCandidate =
    toString(record.thumbnailUrl) ||
    mediaThumbnail ||
    toString(record.thumbnail) ||
    toString(record.imageUrl) ||
    toString(record.image)
  const videoId = getYoutubeVideoId(url)
  const thumbnailUrl =
    thumbnailCandidate ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/images/placeholder.jpg")
  const accentColor = resolveAccentColor(record)

  return {
    title,
    label,
    date,
    duration,
    url,
    thumbnailUrl,
    accentColor,
  }
}

function normalizeItems(items: any[]): YoutubeCardItem[] {
  if (!Array.isArray(items) || items.length === 0) return FALLBACK_ITEMS
  const parsed = items
    .map((item) => normalizeItem(item))
    .filter((item): item is YoutubeCardItem => item !== null)
  return parsed.length > 0 ? parsed : FALLBACK_ITEMS
}

export function DynamicYoutubeLinks({ data }: DynamicYoutubeLinksProps) {
  const title = data.title?.trim() || "YOUTUBE LINKS"
  const subtitle =
    data.subtitle?.trim() || "Latest videos from our channel and partner edits."
  const dataRecord = data as unknown as Record<string, unknown>
  const rawCardStyle = dataRecord.card_style
    ?? dataRecord.style
    ?? dataRecord.cardStyle
  const cardStyle = normalizeCardStyle(rawCardStyle)
  const items = normalizeItems(data.items)

  return (
    <section id="videos" className="bg-[#F1EEE8] py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="inline-flex items-center border-4 border-black bg-black px-4 py-2 shadow-[4px_4px_0_#FBD000]">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#FBD000]">
            {`* ${title.toUpperCase()}`}
          </span>
        </div>

        {subtitle ? (
          <p className="mt-4 max-w-2xl text-sm text-black/70">{subtitle}</p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={`${item.url}-${item.title}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-44 overflow-hidden border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow] duration-200 [will-change:transform] hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:scale-[1.015] focus-visible:outline-none focus-visible:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868]"
              style={{ ["--accent-color" as const]: item.accentColor } as CSSProperties}
            >
              <div className="relative h-[78%] overflow-hidden border-b-2 border-black bg-[#D9D9D9]">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />

                <div
                  className={
                    cardStyle === "color-style"
                      ? "absolute inset-0 opacity-25 transition-opacity duration-200 group-hover:opacity-45 group-focus-visible:opacity-45"
                      : "absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/35 group-focus-visible:bg-black/35"
                  }
                  style={cardStyle === "color-style" ? { backgroundColor: item.accentColor } : undefined}
                />

                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid h-10 w-10 scale-90 place-items-center rounded-full bg-white text-black opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </div>

                <span
                  className="absolute bottom-1.5 right-1.5 border border-black px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white"
                  style={{ backgroundColor: item.accentColor }}
                >
                  {item.duration}
                </span>
              </div>

              <div className="flex h-[22%] items-center px-3">
                <h3 className="line-clamp-1 text-[26px] font-black leading-none tracking-[0.01em] text-black transition-colors duration-200 group-hover:text-[var(--accent-color)] group-focus-visible:text-[var(--accent-color)]">
                  {item.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
