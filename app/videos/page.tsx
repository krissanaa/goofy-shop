import type { Metadata } from "next"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { supabase } from "@/lib/supabase"

const FEATURED_GOOFY_VIDEO_URL = "https://www.youtube.com/watch?v=2WapgjbfXNM"
const YOUTUBE_CHANNEL_HREF = "https://youtube.com/@goofyskate"

type GenericRow = Record<string, unknown>

type VideoCard = {
  title: string
  href: string
  thumbnail: string
  excerpt: string
  label: string
  date: string
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Skate Videos | GOOFY SHOP",
    description: "Latest skate videos, edits, and raw sessions from GOOFY SHOP.",
    openGraph: {
      title: "Skate Videos | GOOFY SHOP",
      description: "Latest skate videos, edits, and raw sessions from GOOFY SHOP.",
      type: "website",
    },
  }
}

function getString(
  source: GenericRow | null | undefined,
  keys: string[],
  fallback = "",
) {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return fallback
}

function getExcerpt(source: GenericRow | null | undefined) {
  return getString(
    source,
    ["excerpt", "description", "summary", "caption"],
    "Raw shop edits, local sessions, and street clips from GOOFY.",
  )
}

function getImage(source: GenericRow | null | undefined) {
  if (!source) return ""

  const candidates = ["thumbnail", "thumbnail_url", "image", "image_url", "cover"]
  for (const key of candidates) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
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

function formatDate(value: string) {
  if (!value) return "Latest upload"

  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return value

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toVideoCard(row: GenericRow | null | undefined, index: number): VideoCard | null {
  if (!row) return null

  const href = getString(row, ["youtube_url", "url", "link"])
  if (!href) return null

  const youtubeId = getYouTubeId(href)
  const thumbnail =
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : "") ||
    getImage(row)

  return {
    title: getString(row, ["title", "name"], `Goofy Clip ${index + 1}`),
    href,
    thumbnail,
    excerpt: getExcerpt(row),
    label: getString(row, ["category", "tag", "type"], "Skate Video").toUpperCase(),
    date: formatDate(getString(row, ["published_date", "published_at", "created_at"])),
  }
}

export default async function VideosPage() {
  const primaryVideos = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)

  let videoRows = primaryVideos.data ?? []

  if (!videoRows.length && primaryVideos.error) {
    const fallbackVideos = await supabase
      .from("videos")
      .select("*")
      .order("published_date", { ascending: false })
      .limit(8)

    videoRows = fallbackVideos.data ?? []
  }

  const featuredYouTubeId = getYouTubeId(FEATURED_GOOFY_VIDEO_URL)
  const featuredCard: VideoCard = {
    title: "Goofy World Premiere",
    href: FEATURED_GOOFY_VIDEO_URL,
    thumbnail: featuredYouTubeId
      ? `https://img.youtube.com/vi/${featuredYouTubeId}/maxresdefault.jpg`
      : "",
    excerpt: "Raw Vientiane street footage, local sessions, and the latest Goofy world cut.",
    label: "Featured",
    date: "Now showing",
  }

  const cards = [featuredCard]
  const seen = new Set(cards.map((item) => item.href))

  videoRows.forEach((row, index) => {
    const card = toVideoCard(row as GenericRow, index)
    if (!card || seen.has(card.href)) return
    seen.add(card.href)
    cards.push(card)
  })

  const featured = cards[0]
  const gridCards = cards.slice(1, 9)
  const featuredEmbedId = getYouTubeId(featured.href)

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <NavbarServer />

      <div className="pt-16">
        <section className="border-b border-white/10 px-6 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1380px]">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#EE3A24]">
              Community // Skate Videos
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <h1
                  className="text-[clamp(3.2rem,8vw,7.5rem)] font-black uppercase italic leading-[0.88] tracking-[-0.06em]"
                  style={{ fontFamily: "var(--font-ui-sans)" }}
                >
                  Watch Goofy TV
                </h1>
                <p className="mt-4 max-w-2xl font-mono text-[11px] uppercase tracking-[0.18em] text-white/46">
                  Full edits, raw clips, shop sessions, and community skate videos from Vientiane.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                <a
                  href={YOUTUBE_CHANNEL_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#EE3A24] px-8 py-3 text-lg font-black uppercase italic text-black transition-colors hover:bg-white"
                  style={{ fontFamily: "var(--font-ui-sans)" }}
                >
                  YouTube Channel {"↗"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto grid max-w-[1380px] gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
            <div className="overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="relative aspect-video">
                {featuredEmbedId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${featuredEmbedId}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1`}
                    title={featured.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : featured.thumbnail ? (
                  <Image
                    src={featured.thumbnail}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#161616,#050505)]" />
                )}
              </div>

              <div className="border-t border-white/10 px-6 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EE3A24]">
                  {featured.label} // {featured.date}
                </p>
                <h2
                  className="mt-3 text-[clamp(2rem,4vw,3.6rem)] font-black uppercase italic leading-[0.9] tracking-[-0.05em]"
                  style={{ fontFamily: "var(--font-ui-sans)" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-3xl font-mono text-[11px] uppercase tracking-[0.18em] text-white/42">
                  {featured.excerpt}
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-[#090909] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EE3A24]">
                Watchlist
              </p>
              <div className="mt-5 space-y-4">
                {gridCards.map((card) => (
                  <a
                    key={card.href}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 border-b border-white/8 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden bg-black">
                      {card.thumbnail ? (
                        <Image
                          src={card.thumbnail}
                          alt={card.title}
                          fill
                          sizes="144px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#161616,#050505)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/34">
                        {card.label} // {card.date}
                      </p>
                      <h3
                        className="mt-2 text-[1.6rem] font-black uppercase italic leading-[0.9] tracking-[-0.04em] text-white transition-colors group-hover:text-[#EE3A24]"
                        style={{ fontFamily: "var(--font-ui-sans)" }}
                      >
                        {card.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/34">
                        {card.excerpt}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <SearchCommand />
    </main>
  )
}
