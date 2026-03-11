"use client"

import { useEffect, useMemo, useState } from "react"
import { Heart, Search, Share2 } from "lucide-react"
import type { ResolvedLocationPark } from "@/lib/types/cms"

type ParkFilter = "all" | "free" | "indoor" | "bowl" | "street" | "night"

interface SkateparksPageProps {
  pageTitle: string
  searchPlaceholder: string
  parks: ResolvedLocationPark[]
}

const STORAGE_KEY = "goofy-shop-skateparks-saved-v1"

const FILTERS: Array<{ key: ParkFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "free", label: "Free" },
  { key: "indoor", label: "Indoor" },
  { key: "bowl", label: "Bowl" },
  { key: "street", label: "Street" },
  { key: "night", label: "Night" },
]

const PANEL_CLASSES = [
  "bg-[#F8E2E8]",
  "bg-[#DDE7F5]",
  "bg-[#F3EED7]",
  "bg-[#E6E9F8]",
  "bg-[#F6DFDF]",
] as const

function parseSavedIds(raw: string | null): string[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is string => typeof value === "string")
  } catch {
    return []
  }
}

function buildMapUrl(park: ResolvedLocationPark): string {
  const query = park.mapsQuery?.trim() || `${park.name}, ${park.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function renderStars(rating: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)))
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`
}

export function SkateparksPage({ pageTitle, searchPlaceholder, parks }: SkateparksPageProps) {
  const [filter, setFilter] = useState<ParkFilter>("all")
  const [query, setQuery] = useState("")
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const openCount = useMemo(
    () => parks.filter((park) => park.status === "open").length,
    [parks],
  )
  const freeCount = useMemo(
    () => parks.filter((park) => park.accessType === "free").length,
    [parks],
  )

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    return parks.filter((park) => {
      const filterMatched =
        filter === "all"
          ? true
          : filter === "free"
            ? park.accessType === "free"
            : filter === "indoor"
              ? park.environmentType === "indoor"
              : filter === "bowl"
                ? park.hasBowl
                : filter === "street"
                  ? park.hasStreet
                  : park.hasNight

      if (!filterMatched) return false
      if (!search) return true

      const searchable = [
        park.name,
        park.address,
        park.placeCode,
        park.categoryLabel,
        park.mapsQuery,
        park.tags.join(" "),
      ].join(" ").toLowerCase()

      return searchable.includes(search)
    })
  }, [filter, parks, query])

  useEffect(() => {
    if (typeof window === "undefined") return
    setSaved(new Set(parseSavedIds(window.localStorage.getItem(STORAGE_KEY))))
  }, [])

  useEffect(() => {
    if (!shareMessage) return
    const timer = window.setTimeout(() => setShareMessage(null), 1400)
    return () => window.clearTimeout(timer)
  }, [shareMessage])

  const toggleSave = (parkId: string) => {
    setSaved((current) => {
      const next = new Set(current)
      if (next.has(parkId)) {
        next.delete(parkId)
      } else {
        next.add(parkId)
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      }

      return next
    })
  }

  const sharePark = async (park: ResolvedLocationPark) => {
    const url = buildMapUrl(park)

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: park.name,
          text: `${park.name} - ${park.address}`,
          url,
        })
        return
      } catch {
        // no-op
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        setShareMessage("Park link copied")
        return
      } catch {
        // no-op
      }
    }

    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-8 md:px-8">
      <div className="grid gap-4 border-4 border-black bg-black p-5 text-white shadow-[6px_6px_0_#FBD000] lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div>
          <p className="inline-flex border border-[#FBD000] bg-[#FBD000] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black">
            {pageTitle}
          </p>
          <h1 className="mt-4 text-[clamp(34px,5vw,58px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-white">
            Skate spots across Laos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
            Find local parks, save session spots, and open directions fast. This page should feel useful, not empty, so the important park info now starts at the top.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=skate+parks+laos"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black bg-[#FBD000] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black shadow-[2px_2px_0_#0A0A0A] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              View full map
            </a>

            <a
              href="mailto:parks@goofyshop.com?subject=Suggest%20a%20Skate%20Park"
              className="border-2 border-white bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            >
              Suggest a park
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div className="border-2 border-black bg-white px-4 py-4 text-black">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
              Listed parks
            </p>
            <p className="mt-2 text-3xl font-black text-[#E70009]">{parks.length}</p>
          </div>

          <div className="border-2 border-black bg-white px-4 py-4 text-black">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
              Open now
            </p>
            <p className="mt-2 text-3xl font-black text-[#00AA00]">{openCount}</p>
          </div>

          <div className="border-2 border-black bg-white px-4 py-4 text-black">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
              Free entry
            </p>
            <p className="mt-2 text-3xl font-black text-[#2B7FFF]">{freeCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-2 border-black bg-[#EFEFEF] p-2">
        <label className="inline-flex flex-1 items-center gap-2 border-2 border-black bg-white px-2 py-1">
          <Search className="h-3.5 w-3.5 text-black/70" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-xs font-semibold text-black outline-none placeholder:text-black/50"
          />
        </label>

        {FILTERS.map((item) => {
          const active = filter === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-[2px_2px_0_#0A0A0A] ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black bg-white text-black"
              }`}
            >
              {item.label}
            </button>
          )
        })}

        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-black/70">
          {filtered.length} parks
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full border-4 border-black bg-[#EFEFEF] p-8 text-center shadow-[4px_4px_0_#0A0A0A]">
            <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-black">
              No skate parks match this filter
            </p>
          </div>
        ) : (
          filtered.map((park, index) => {
            const isSaved = saved.has(park.id)
            const mapUrl = buildMapUrl(park)
            const ratingText = park.reviewsCount > 0 ? park.rating.toFixed(1) : "No reviews"
            const panelClass = PANEL_CLASSES[index % PANEL_CLASSES.length]

            return (
              <article
                key={park.id}
                className="group relative border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow] duration-200 [will-change:transform] hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] focus-within:z-10 focus-within:-translate-y-1 focus-within:scale-[1.015] focus-within:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868]"
              >
                <div className="flex items-center justify-between border-b-2 border-black bg-white px-2 py-1">
                  <span className="border border-black bg-[#FBD000] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-black">
                    {park.categoryLabel || "Skatepark"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => sharePark(park)}
                      className="grid h-5 w-5 place-items-center border border-black bg-white text-black transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FBD000] active:translate-y-0.5"
                      aria-label={`Share ${park.name}`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(park.id)}
                      className="grid h-5 w-5 place-items-center border border-black bg-white text-black transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FBD000] active:translate-y-0.5"
                      aria-label={isSaved ? `Remove ${park.name} from saved` : `Save ${park.name}`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-[#E70009] text-[#E70009] scale-110" : "text-black"}`} />
                    </button>
                  </div>
                </div>

                <div className={`relative border-b-2 border-black ${panelClass}`}>
                  <div className="relative flex h-36 items-center justify-center bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:12px_12px]">
                    <img
                      src={park.imageUrl}
                      alt={park.name}
                      loading="lazy"
                      className="h-28 w-28 object-cover drop-shadow-[2px_2px_0_#0A0A0A]"
                    />
                  </div>

                  <span className="absolute left-2 top-2 border border-black bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-black">
                    {park.photoCount > 0 ? `${park.photoCount} photos` : "No photos"}
                  </span>

                  <span
                    className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white ${
                      park.status === "open" ? "bg-[#00AA00]" : "bg-[#E70009]"
                    }`}
                  >
                    {park.status === "open" ? "Open" : "Closed"}
                  </span>

                  <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    {park.distance || park.placeCode || ""}
                  </span>
                </div>

                <div className="flex flex-col p-2">
                  <h3 className="line-clamp-1 text-sm font-black uppercase tracking-[0.08em] text-black">
                    {park.name}
                  </h3>

                  <p className="mt-1 text-xs text-black/65">
                    {park.address}
                  </p>

                  <div className="mt-2 flex items-center gap-1">
                    {park.reviewsCount > 0 ? (
                      <>
                        <span className="text-xs font-bold text-black">{ratingText}</span>
                        <span className="text-[11px] text-[#FBD000]">{renderStars(park.rating)}</span>
                        <span className="text-[10px] font-semibold text-black/60">({park.reviewsCount})</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-semibold text-black/60">No reviews</span>
                    )}
                  </div>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black/60">
                    {park.opensText || "Open hours unavailable"}
                  </p>

                  {park.reviewSnippet ? (
                    <p className="mt-1 line-clamp-2 text-xs text-black/70">\"{park.reviewSnippet}\"</p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {park.tags.map((tag) => (
                      <span
                        key={`${park.id}-${tag}`}
                        className="border border-black bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-black/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 border-2 border-black bg-black text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#0A0A0A] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#E70009] active:translate-y-0.5 active:shadow-[1px_1px_0_#0A0A0A]"
                  >
                    Get Directions
                  </a>
                </div>
              </article>
            )
          })
        )}
      </div>

      {shareMessage ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white">
          {shareMessage}
        </div>
      ) : null}
    </section>
  )
}
