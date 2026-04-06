import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  cloneDefaultHomepageMockContent,
  type HomepageHeroSlideInput,
  type HomepageMockContent,
  type HomepageSourceSummaryItem,
} from "@/lib/homepage-cms"

type GenericRow = Record<string, unknown>

const HOMEPAGE_MOCK_CONTENT_KEY = "homepage_mock_content"

export type HomepageMockContentStorageMode = "settings" | "unsupported"

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function parseHeroSlides(value: unknown, fallback: HomepageMockContent["heroSlides"]) {
  if (!Array.isArray(value)) {
    return fallback.map((slide) => ({ ...slide }))
  }

  const slides = value
    .map((entry, index) => {
      const row = asObject(entry)
      if (!row) return null

      return {
        id: asString(row.id) ?? fallback[index]?.id ?? `hero-${index + 1}`,
        title: asString(row.title) ?? fallback[index]?.title ?? `Hero Slide ${index + 1}`,
        tag: asString(row.tag) ?? fallback[index]?.tag ?? "Homepage Slide",
        imageUrl: asString(row.imageUrl ?? row.image_url) ?? fallback[index]?.imageUrl ?? "",
        ctaText: asString(row.ctaText ?? row.cta_text) ?? fallback[index]?.ctaText ?? "Explore",
        ctaLink: asString(row.ctaLink ?? row.cta_link) ?? fallback[index]?.ctaLink ?? "/shop",
        order: asNumber(row.order) ?? fallback[index]?.order ?? index + 1,
      } satisfies HomepageHeroSlideInput
    })
    .filter((slide): slide is HomepageHeroSlideInput => slide !== null)

  return slides.length > 0 ? slides : fallback.map((slide) => ({ ...slide }))
}

function parseStories(
  value: unknown,
  fallback: HomepageMockContent["fallbackStories"],
) {
  if (!Array.isArray(value)) {
    return fallback.map((story) => ({ ...story }))
  }

  const stories = value
    .map((entry, index) => {
      const row = asObject(entry)
      if (!row) return null

      return {
        id: asString(row.id) ?? fallback[index]?.id ?? `story-${index + 1}`,
        title: asString(row.title) ?? fallback[index]?.title ?? `Story ${index + 1}`,
        date: asString(row.date) ?? fallback[index]?.date ?? "",
        tag: asString(row.tag) ?? fallback[index]?.tag ?? "STORY",
        image: asString(row.image) ?? fallback[index]?.image ?? "",
        href: asString(row.href) ?? fallback[index]?.href ?? "/news",
      }
    })
    .filter(Boolean)

  return stories.length > 0 ? stories : fallback.map((story) => ({ ...story }))
}

function parseSpots(value: unknown, fallback: HomepageMockContent["fallbackSpots"]) {
  if (!Array.isArray(value)) {
    return fallback.map((spot) => ({ ...spot }))
  }

  const spots = value
    .map((entry, index) => {
      const row = asObject(entry)
      if (!row) return null

      return {
        id: asString(row.id) ?? fallback[index]?.id ?? `spot-${index + 1}`,
        name: asString(row.name) ?? fallback[index]?.name ?? `Spot ${index + 1}`,
        mapUrl: asString(row.mapUrl ?? row.map_url) ?? fallback[index]?.mapUrl ?? "",
        image: asString(row.image) ?? fallback[index]?.image ?? "",
      }
    })
    .filter(Boolean)

  return spots.length > 0 ? spots : fallback.map((spot) => ({ ...spot }))
}

function normalizeHomepageMockContent(value: unknown): HomepageMockContent {
  const fallback = cloneDefaultHomepageMockContent()
  const row = asObject(value)

  if (!row) {
    return fallback
  }

  return {
    topMarqueeText: asString(row.topMarqueeText ?? row.top_marquee_text) ?? fallback.topMarqueeText,
    featuredVideoUrl:
      asString(row.featuredVideoUrl ?? row.featured_video_url) ?? fallback.featuredVideoUrl,
    heroSlides: parseHeroSlides(row.heroSlides ?? row.hero_slides, fallback.heroSlides),
    fallbackStories: parseStories(
      row.fallbackStories ?? row.fallback_stories,
      fallback.fallbackStories,
    ),
    fallbackSpots: parseSpots(
      row.fallbackSpots ?? row.fallback_spots,
      fallback.fallbackSpots,
    ),
  }
}

async function getStorageModeWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<HomepageMockContentStorageMode> {
  const probe = await supabase
    .from("settings")
    .select("key, value")
    .eq("key", HOMEPAGE_MOCK_CONTENT_KEY)
    .maybeSingle()

  return probe.error ? "unsupported" : "settings"
}

async function getSettingsValue(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", HOMEPAGE_MOCK_CONTENT_KEY)
    .maybeSingle()

  if (error) {
    return null
  }

  return (data as GenericRow | null)?.value ?? null
}

export async function getHomepageMockContentStorageMode(): Promise<HomepageMockContentStorageMode> {
  const supabase = await createClient()
  return getStorageModeWithClient(supabase)
}

export async function getHomepageMockContent(): Promise<HomepageMockContent> {
  const supabase = await createClient()
  const storageMode = await getStorageModeWithClient(supabase)

  if (storageMode === "unsupported") {
    return cloneDefaultHomepageMockContent()
  }

  const value = await getSettingsValue(supabase)
  return normalizeHomepageMockContent(value)
}

export async function saveHomepageMockContent(
  content: HomepageMockContent,
): Promise<{ errorMessage?: string }> {
  const supabase = await createClient()
  const storageMode = await getStorageModeWithClient(supabase)

  if (storageMode === "unsupported") {
    return {
      errorMessage:
        "Homepage CMS storage is not configured. The settings table must support key-value rows.",
    }
  }

  const payload = {
    top_marquee_text: content.topMarqueeText,
    featured_video_url: content.featuredVideoUrl,
    hero_slides: content.heroSlides,
    fallback_stories: content.fallbackStories,
    fallback_spots: content.fallbackSpots,
  }
  const timestamp = new Date().toISOString()

  const existing = await supabase
    .from("settings")
    .select("key")
    .eq("key", HOMEPAGE_MOCK_CONTENT_KEY)
    .maybeSingle()

  if (existing.error) {
    return {
      errorMessage: existing.error.message || "Unable to access homepage CMS settings.",
    }
  }

  if (existing.data) {
    const { error } = await supabase
      .from("settings")
      .update({
        value: payload,
        updated_at: timestamp,
      })
      .eq("key", HOMEPAGE_MOCK_CONTENT_KEY)

    return error ? { errorMessage: error.message || "Unable to update homepage CMS." } : {}
  }

  const { error } = await supabase.from("settings").insert({
    key: HOMEPAGE_MOCK_CONTENT_KEY,
    value: payload,
    updated_at: timestamp,
  })

  return error ? { errorMessage: error.message || "Unable to create homepage CMS row." } : {}
}

export async function getHomepageSourceSummary(): Promise<HomepageSourceSummaryItem[]> {
  const supabase = await createClient()
  const [bannersRes, postsRes, productsRes, parksRes, videosRes] = await Promise.all([
    supabase.from("banners").select("id").eq("active", true),
    supabase.from("posts").select("id").eq("published", true),
    supabase.from("products").select("id").eq("active", true),
    supabase.from("skateparks").select("id"),
    supabase.from("videos").select("id"),
  ])

  const activeBanners = bannersRes.data?.length ?? 0
  const publishedPosts = postsRes.data?.length ?? 0
  const activeProducts = productsRes.data?.length ?? 0
  const skateparks = parksRes.data?.length ?? 0
  const videos = videosRes.data?.length ?? 0

  return [
    {
      key: "marquee",
      label: "Top Marquee",
      status: "fallback",
      source: "Homepage CMS",
      detail: "Always uses the admin-editable homepage text.",
    },
    {
      key: "hero",
      label: "Hero Slider",
      status: activeBanners > 0 ? "live" : "fallback",
      source: activeBanners > 0 ? "banners table" : "Homepage CMS fallback slides",
      detail:
        activeBanners > 0
          ? `${activeBanners} active banner row(s) currently override the fallback slides.`
          : "No active banners found, so the homepage fallback slides are live.",
    },
    {
      key: "products",
      label: "Product Sections",
      status: activeProducts > 0 ? "live" : "fallback",
      source: "products table",
      detail:
        activeProducts > 0
          ? `${activeProducts} active product row(s) are feeding new arrivals and category sections.`
          : "No active products found. Product-based homepage sections will be empty.",
    },
    {
      key: "stories",
      label: "Stories",
      status: publishedPosts >= 3 ? "live" : publishedPosts > 0 ? "mixed" : "fallback",
      source:
        publishedPosts >= 3
          ? "posts table"
          : publishedPosts > 0
            ? "posts table + Homepage CMS fallback stories"
            : "Homepage CMS fallback stories",
      detail:
        publishedPosts >= 3
          ? `${publishedPosts} published post row(s) are enough to fill the homepage story sections.`
          : publishedPosts > 0
            ? `Only ${publishedPosts} published post row(s) found, so fallback stories may fill missing slots.`
            : "No published posts found. Fallback stories are used where applicable.",
    },
    {
      key: "spots",
      label: "Find Your Spot",
      status: skateparks >= 4 ? "live" : skateparks > 0 ? "mixed" : "fallback",
      source:
        skateparks >= 4
          ? "skateparks table"
          : skateparks > 0
            ? "skateparks table + Homepage CMS fallback spots"
            : "Homepage CMS fallback spots",
      detail:
        skateparks >= 4
          ? `${skateparks} skatepark row(s) are enough to fill the spot grid.`
          : skateparks > 0
            ? `Only ${skateparks} skatepark row(s) found, so fallback spots may fill missing cards.`
            : "No skateparks found. Fallback spots are being used.",
    },
    {
      key: "video",
      label: "Featured Video",
      status: videos > 0 ? "mixed" : "fallback",
      source:
        videos > 0
          ? "videos table + Homepage CMS featured video URL"
          : "Homepage CMS featured video URL",
      detail:
        videos > 0
          ? `${videos} video row(s) exist. Title and excerpt come from the latest video row, but the player URL comes from Homepage CMS.`
          : "No video rows found. The homepage relies entirely on the Homepage CMS featured video URL.",
    },
  ]
}
