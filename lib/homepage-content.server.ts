import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  cloneDefaultHomepageContent,
  normalizeHomepageContent,
  type HomepageContent,
} from "@/lib/homepage-content"

type GenericRow = Record<string, unknown>

export type HomepageContentStorageMode = "settings" | "unsupported"

export interface HomepageLiveSourceSummary {
  activeBannerCount: number
  publishedPostCount: number
  skateparkCount: number
  videoCount: number
  activeProductCount: number
}

const HOMEPAGE_CONTENT_SETTINGS_KEY = "homepage_content"

async function getHomepageContentStorageModeWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<HomepageContentStorageMode> {
  const settingsProbe = await supabase
    .from("settings")
    .select("key, value")
    .eq("key", HOMEPAGE_CONTENT_SETTINGS_KEY)
    .maybeSingle()

  return settingsProbe.error ? "unsupported" : "settings"
}

async function loadHomepageContentFromSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<HomepageContent | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", HOMEPAGE_CONTENT_SETTINGS_KEY)
    .maybeSingle()

  if (error) {
    return null
  }

  const value = (data as GenericRow | null)?.value
  return value ? normalizeHomepageContent(value) : null
}

function buildHomepageContentPayload(content: HomepageContent) {
  return {
    top_marquee_text: content.topMarqueeText,
    hero_slides: content.heroSlides.map((slide) => ({
      id: slide.id,
      tag: slide.tag,
      left_title_lines: slide.leftTitleLines,
      left_subtitle: slide.leftSubtitle,
      left_meta: slide.leftMeta,
      left_cta_label: slide.leftCtaLabel,
      left_cta_href: slide.leftCtaHref,
      right_image: slide.rightImage,
      right_tag: slide.rightTag,
      right_title: slide.rightTitle,
      right_cta_label: slide.rightCtaLabel,
      right_cta_href: slide.rightCtaHref,
      right_cta_gold: slide.rightCtaGold,
    })),
    fallback_stories: content.fallbackStories.map((story) => ({
      id: story.id,
      title: story.title,
      date: story.date,
      tag: story.tag,
      image: story.image,
      href: story.href,
    })),
    fallback_spots: content.fallbackSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      map_url: spot.mapUrl,
      image: spot.image,
    })),
    featured_video: {
      video_url: content.featuredVideo.videoUrl,
      meta_label: content.featuredVideo.metaLabel,
      primary_button_label: content.featuredVideo.primaryButtonLabel,
      primary_button_href: content.featuredVideo.primaryButtonHref,
      secondary_button_label: content.featuredVideo.secondaryButtonLabel,
      secondary_button_href: content.featuredVideo.secondaryButtonHref,
      footer_hint: content.featuredVideo.footerHint,
    },
    ready_to_skate: {
      background_image: content.readyToSkate.backgroundImage,
      title_leading: content.readyToSkate.titleLeading,
      title_accent: content.readyToSkate.titleAccent,
      subheading: content.readyToSkate.subheading,
      cta_label: content.readyToSkate.ctaLabel,
      cta_href: content.readyToSkate.ctaHref,
    },
  }
}

async function persistHomepageContentInSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  content: HomepageContent,
): Promise<{ errorMessage?: string }> {
  const payload = buildHomepageContentPayload(content)
  const timestamp = new Date().toISOString()
  const existing = await supabase
    .from("settings")
    .select("key")
    .eq("key", HOMEPAGE_CONTENT_SETTINGS_KEY)
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
      .eq("key", HOMEPAGE_CONTENT_SETTINGS_KEY)

    return error
      ? { errorMessage: error.message || "Unable to update homepage content." }
      : {}
  }

  const { error } = await supabase.from("settings").insert({
    key: HOMEPAGE_CONTENT_SETTINGS_KEY,
    value: payload,
    updated_at: timestamp,
  })

  return error
    ? { errorMessage: error.message || "Unable to create homepage content settings." }
    : {}
}

export async function getHomepageContentStorageMode(): Promise<HomepageContentStorageMode> {
  const supabase = await createClient()
  return getHomepageContentStorageModeWithClient(supabase)
}

export async function getHomepageContent({
  fallbackToDefaults = true,
}: {
  fallbackToDefaults?: boolean
} = {}): Promise<HomepageContent> {
  const supabase = await createClient()
  const storageMode = await getHomepageContentStorageModeWithClient(supabase)

  if (storageMode === "settings") {
    const storedContent = await loadHomepageContentFromSettings(supabase)
    if (storedContent) {
      return storedContent
    }
  }

  return fallbackToDefaults ? cloneDefaultHomepageContent() : normalizeHomepageContent(null)
}

export async function saveHomepageContent(
  content: HomepageContent,
): Promise<{ errorMessage?: string }> {
  const supabase = await createClient()
  const storageMode = await getHomepageContentStorageModeWithClient(supabase)

  if (storageMode === "unsupported") {
    return {
      errorMessage:
        "Homepage CMS storage is not configured. Add key-value settings storage before saving homepage content.",
    }
  }

  return persistHomepageContentInSettings(supabase, content)
}

export async function getHomepageLiveSourceSummary(): Promise<HomepageLiveSourceSummary> {
  const supabase = await createClient()
  const [activeBanners, publishedPosts, skateparks, videos, activeProducts] = await Promise.all([
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("skateparks").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
  ])

  return {
    activeBannerCount: activeBanners.error ? 0 : activeBanners.count ?? 0,
    publishedPostCount: publishedPosts.error ? 0 : publishedPosts.count ?? 0,
    skateparkCount: skateparks.error ? 0 : skateparks.count ?? 0,
    videoCount: videos.error ? 0 : videos.count ?? 0,
    activeProductCount: activeProducts.error ? 0 : activeProducts.count ?? 0,
  }
}
