export interface HomepageHeroSlide {
  id: string
  tag: string
  leftTitleLines: string[]
  leftSubtitle: string
  leftMeta: string
  leftCtaLabel: string
  leftCtaHref: string
  rightImage: string | null
  rightTag: string
  rightTitle: string
  rightCtaLabel: string
  rightCtaHref: string
  rightCtaGold: boolean
}

export interface HomepageFallbackStory {
  id: string
  title: string
  date: string
  tag: string
  image: string | null
  href: string
}

export interface HomepageFallbackSpot {
  id: string
  name: string
  mapUrl: string
  image: string | null
}

export interface HomepageFeaturedVideoContent {
  videoUrl: string
  metaLabel: string
  primaryButtonLabel: string
  primaryButtonHref: string
  secondaryButtonLabel: string
  secondaryButtonHref: string
  footerHint: string
}

export interface HomepageReadyToSkateContent {
  backgroundImage: string
  titleLeading: string
  titleAccent: string
  subheading: string
  ctaLabel: string
  ctaHref: string
}

export interface HomepageContent {
  topMarqueeText: string
  heroSlides: HomepageHeroSlide[]
  fallbackStories: HomepageFallbackStory[]
  fallbackSpots: HomepageFallbackSpot[]
  featuredVideo: HomepageFeaturedVideoContent
  readyToSkate: HomepageReadyToSkateContent
}

type GenericRow = Record<string, unknown>

function isRecord(value: unknown): value is GenericRow {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "number") {
    return value > 0
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false
    }
  }

  return null
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  topMarqueeText:
    "First Skate Shop in Laos · New Drop Every Week · ຮ້ານສະເກັດທຳອິດໃນລາວ · Free Shipping Over ₭500,000 · Vientiane Street Culture · Shop · Community · Drops",
  heroSlides: [
    {
      id: "hero-1",
      tag: "Vol.01 · Spring 2026 · Vientiane",
      leftTitleLines: ["The", "Streets", "Are", "Ours"],
      leftSubtitle: "ຮ້ານສະເກັດທຳອິດໃນລາວ — Est. 2026",
      leftMeta: "Vientiane · Laos / First Skate Shop",
      leftCtaLabel: "Explore Issue",
      leftCtaHref: "/shop",
      rightImage: null,
      rightTag: "Active Drop",
      rightTitle: "Spring Drop 001",
      rightCtaLabel: "Shop The Drop",
      rightCtaHref: "/drops/spring-001",
      rightCtaGold: false,
    },
    {
      id: "hero-2",
      tag: "New Arrivals · Spring 2026",
      leftTitleLines: ["Fresh", "Decks", "Just", "Landed"],
      leftSubtitle: "Premium hardware — built for the street",
      leftMeta: "Decks · Trucks · Wheels",
      leftCtaLabel: "Shop Decks",
      leftCtaHref: "/shop?category=deck",
      rightImage: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=900&q=80",
      rightTag: "New In",
      rightTitle: "Fresh Decks In",
      rightCtaLabel: "Shop Decks",
      rightCtaHref: "/shop?category=deck",
      rightCtaGold: false,
    },
    {
      id: "hero-3",
      tag: "Limited Collab Drop",
      leftTitleLines: ["Goofy", "×", "Local", "Artist"],
      leftSubtitle: "Limited edition — Vientiane x Goofy",
      leftMeta: "Apparel · Limited Edition",
      leftCtaLabel: "View Collab",
      leftCtaHref: "/shop?badge=COLLAB",
      rightImage: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=900&q=80",
      rightTag: "Collab",
      rightTitle: "Goofy × Local Artist",
      rightCtaLabel: "View Collab",
      rightCtaHref: "/shop?badge=COLLAB",
      rightCtaGold: true,
    },
    {
      id: "hero-4",
      tag: "Community · Vientiane",
      leftTitleLines: ["Skate", "Every", "Damn", "Day"],
      leftSubtitle: "Join the community — Vientiane streets",
      leftMeta: "Parks · Videos · Community",
      leftCtaLabel: "Find Spots",
      leftCtaHref: "/parks",
      rightImage: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=900&q=80",
      rightTag: "Community",
      rightTitle: "Vientiane Streets",
      rightCtaLabel: "Find Spots",
      rightCtaHref: "/parks",
      rightCtaGold: false,
    },
  ],
  fallbackStories: [
    {
      id: "default-1",
      title: "VIENTIANE: THE NEW WAVE",
      date: "12.03.2026",
      tag: "FEATURE",
      image:
        "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
    {
      id: "default-2",
      title: "MEKONG RIVER SESSIONS",
      date: "10.03.2026",
      tag: "STORY",
      image:
        "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
    {
      id: "default-3",
      title: "DIY SPOT: THE ABANDONED PLAZA",
      date: "08.03.2026",
      tag: "SPOTLIGHT",
      image:
        "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
  ],
  fallbackSpots: [
    {
      id: "spot-1",
      name: "THAT LUANG PLAZA",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=That+Luang+Plaza",
      image:
        "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-2",
      name: "MEKONG CURB CUTS",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Mekong+Vientiane",
      image:
        "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-3",
      name: "OLD CITY BANKS",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+City+Banks+Vientiane",
      image:
        "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-4",
      name: "RIVERSIDE FLAT",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Riverside+Vientiane",
      image:
        "https://images.unsplash.com/photo-1508179522353-11ba468c4a1c?auto=format&fit=crop&q=80&w=900",
    },
  ],
  featuredVideo: {
    videoUrl: "https://www.youtube.com/watch?v=2WapgjbfXNM",
    metaLabel: "RAW EXPORT // VIENTIANE 2026",
    primaryButtonLabel: "Watch On Goofy TV",
    primaryButtonHref: "/videos",
    secondaryButtonLabel: "YouTube Channel",
    secondaryButtonHref: "https://youtube.com/@goofyskate",
    footerHint: "Stay on site for exclusive content",
  },
  readyToSkate: {
    backgroundImage: "/images/channels4_banner (1).jpg",
    titleLeading: "READY TO",
    titleAccent: "SKATE?",
    subheading: "Vientiane Street Culture // Est. 2026",
    ctaLabel: "SHOP ALL GEAR",
    ctaHref: "/shop",
  },
}

function normalizeHeroSlide(value: unknown, index: number): HomepageHeroSlide {
  const fallback =
    DEFAULT_HOMEPAGE_CONTENT.heroSlides[index] ??
    DEFAULT_HOMEPAGE_CONTENT.heroSlides[DEFAULT_HOMEPAGE_CONTENT.heroSlides.length - 1]
  const row = isRecord(value) ? value : {}
  const leftTitleLines = normalizeStringArray(
    row.leftTitleLines ?? row.left_title_lines ?? row.titleLines ?? row.title_lines,
  )

  return {
    id: normalizeString(row.id) ?? fallback.id,
    tag: normalizeString(row.tag) ?? fallback.tag,
    leftTitleLines:
      leftTitleLines.length > 0 ? leftTitleLines.slice(0, 4) : [...fallback.leftTitleLines],
    leftSubtitle:
      normalizeString(row.leftSubtitle ?? row.left_subtitle ?? row.subtitle) ??
      fallback.leftSubtitle,
    leftMeta: normalizeString(row.leftMeta ?? row.left_meta ?? row.meta) ?? fallback.leftMeta,
    leftCtaLabel:
      normalizeString(row.leftCtaLabel ?? row.left_cta_label ?? row.ctaLabel ?? row.cta_label) ??
      fallback.leftCtaLabel,
    leftCtaHref:
      normalizeString(row.leftCtaHref ?? row.left_cta_href ?? row.ctaHref ?? row.cta_href) ??
      fallback.leftCtaHref,
    rightImage:
      normalizeString(row.rightImage ?? row.right_image ?? row.image ?? row.image_url) ??
      fallback.rightImage,
    rightTag: normalizeString(row.rightTag ?? row.right_tag) ?? fallback.rightTag,
    rightTitle: normalizeString(row.rightTitle ?? row.right_title ?? row.title) ?? fallback.rightTitle,
    rightCtaLabel:
      normalizeString(
        row.rightCtaLabel ?? row.right_cta_label ?? row.secondaryCtaLabel ?? row.secondary_cta_label,
      ) ?? fallback.rightCtaLabel,
    rightCtaHref:
      normalizeString(
        row.rightCtaHref ?? row.right_cta_href ?? row.secondaryCtaHref ?? row.secondary_cta_href,
      ) ?? fallback.rightCtaHref,
    rightCtaGold:
      normalizeBoolean(row.rightCtaGold ?? row.right_cta_gold) ?? fallback.rightCtaGold,
  }
}

function normalizeFallbackStory(value: unknown, index: number): HomepageFallbackStory {
  const fallback =
    DEFAULT_HOMEPAGE_CONTENT.fallbackStories[index] ??
    DEFAULT_HOMEPAGE_CONTENT.fallbackStories[
      DEFAULT_HOMEPAGE_CONTENT.fallbackStories.length - 1
    ]
  const row = isRecord(value) ? value : {}

  return {
    id: normalizeString(row.id) ?? fallback.id,
    title: normalizeString(row.title) ?? fallback.title,
    date: normalizeString(row.date) ?? fallback.date,
    tag: normalizeString(row.tag) ?? fallback.tag,
    image: normalizeString(row.image ?? row.image_url ?? row.thumbnail) ?? fallback.image,
    href: normalizeString(row.href ?? row.url ?? row.link) ?? fallback.href,
  }
}

function normalizeFallbackSpot(value: unknown, index: number): HomepageFallbackSpot {
  const fallback =
    DEFAULT_HOMEPAGE_CONTENT.fallbackSpots[index] ??
    DEFAULT_HOMEPAGE_CONTENT.fallbackSpots[
      DEFAULT_HOMEPAGE_CONTENT.fallbackSpots.length - 1
    ]
  const row = isRecord(value) ? value : {}

  return {
    id: normalizeString(row.id) ?? fallback.id,
    name: normalizeString(row.name ?? row.title) ?? fallback.name,
    mapUrl: normalizeString(row.mapUrl ?? row.map_url ?? row.href ?? row.url) ?? fallback.mapUrl,
    image: normalizeString(row.image ?? row.image_url ?? row.thumbnail) ?? fallback.image,
  }
}

export function normalizeHomepageContent(value: unknown): HomepageContent {
  const row = isRecord(value) ? value : {}
  const heroSlidesInput = Array.isArray(row.heroSlides ?? row.hero_slides)
    ? ((row.heroSlides ?? row.hero_slides) as unknown[])
    : []
  const fallbackStoriesInput = Array.isArray(row.fallbackStories ?? row.fallback_stories)
    ? ((row.fallbackStories ?? row.fallback_stories) as unknown[])
    : []
  const fallbackSpotsInput = Array.isArray(row.fallbackSpots ?? row.fallback_spots)
    ? ((row.fallbackSpots ?? row.fallback_spots) as unknown[])
    : []
  const featuredVideoRow = isRecord(row.featuredVideo ?? row.featured_video)
    ? ((row.featuredVideo ?? row.featured_video) as GenericRow)
    : {}
  const readyToSkateRow = isRecord(row.readyToSkate ?? row.ready_to_skate)
    ? ((row.readyToSkate ?? row.ready_to_skate) as GenericRow)
    : {}

  return {
    topMarqueeText:
      normalizeString(row.topMarqueeText ?? row.top_marquee_text) ??
      DEFAULT_HOMEPAGE_CONTENT.topMarqueeText,
    heroSlides: DEFAULT_HOMEPAGE_CONTENT.heroSlides.map((_, index) =>
      normalizeHeroSlide(heroSlidesInput[index], index),
    ),
    fallbackStories: DEFAULT_HOMEPAGE_CONTENT.fallbackStories.map((_, index) =>
      normalizeFallbackStory(fallbackStoriesInput[index], index),
    ),
    fallbackSpots: DEFAULT_HOMEPAGE_CONTENT.fallbackSpots.map((_, index) =>
      normalizeFallbackSpot(fallbackSpotsInput[index], index),
    ),
    featuredVideo: {
      videoUrl:
        normalizeString(featuredVideoRow.videoUrl ?? featuredVideoRow.video_url ?? featuredVideoRow.href) ??
        DEFAULT_HOMEPAGE_CONTENT.featuredVideo.videoUrl,
      metaLabel:
        normalizeString(featuredVideoRow.metaLabel ?? featuredVideoRow.meta_label) ??
        DEFAULT_HOMEPAGE_CONTENT.featuredVideo.metaLabel,
      primaryButtonLabel:
        normalizeString(
          featuredVideoRow.primaryButtonLabel ?? featuredVideoRow.primary_button_label,
        ) ?? DEFAULT_HOMEPAGE_CONTENT.featuredVideo.primaryButtonLabel,
      primaryButtonHref:
        normalizeString(
          featuredVideoRow.primaryButtonHref ?? featuredVideoRow.primary_button_href,
        ) ?? DEFAULT_HOMEPAGE_CONTENT.featuredVideo.primaryButtonHref,
      secondaryButtonLabel:
        normalizeString(
          featuredVideoRow.secondaryButtonLabel ?? featuredVideoRow.secondary_button_label,
        ) ?? DEFAULT_HOMEPAGE_CONTENT.featuredVideo.secondaryButtonLabel,
      secondaryButtonHref:
        normalizeString(
          featuredVideoRow.secondaryButtonHref ?? featuredVideoRow.secondary_button_href,
        ) ?? DEFAULT_HOMEPAGE_CONTENT.featuredVideo.secondaryButtonHref,
      footerHint:
        normalizeString(featuredVideoRow.footerHint ?? featuredVideoRow.footer_hint) ??
        DEFAULT_HOMEPAGE_CONTENT.featuredVideo.footerHint,
    },
    readyToSkate: {
      backgroundImage:
        normalizeString(
          readyToSkateRow.backgroundImage ?? readyToSkateRow.background_image,
        ) ?? DEFAULT_HOMEPAGE_CONTENT.readyToSkate.backgroundImage,
      titleLeading:
        normalizeString(readyToSkateRow.titleLeading ?? readyToSkateRow.title_leading) ??
        DEFAULT_HOMEPAGE_CONTENT.readyToSkate.titleLeading,
      titleAccent:
        normalizeString(readyToSkateRow.titleAccent ?? readyToSkateRow.title_accent) ??
        DEFAULT_HOMEPAGE_CONTENT.readyToSkate.titleAccent,
      subheading:
        normalizeString(readyToSkateRow.subheading ?? readyToSkateRow.subtitle) ??
        DEFAULT_HOMEPAGE_CONTENT.readyToSkate.subheading,
      ctaLabel:
        normalizeString(readyToSkateRow.ctaLabel ?? readyToSkateRow.cta_label) ??
        DEFAULT_HOMEPAGE_CONTENT.readyToSkate.ctaLabel,
      ctaHref:
        normalizeString(readyToSkateRow.ctaHref ?? readyToSkateRow.cta_href) ??
        DEFAULT_HOMEPAGE_CONTENT.readyToSkate.ctaHref,
    },
  }
}

export function cloneDefaultHomepageContent(): HomepageContent {
  return {
    topMarqueeText: DEFAULT_HOMEPAGE_CONTENT.topMarqueeText,
    heroSlides: DEFAULT_HOMEPAGE_CONTENT.heroSlides.map((slide) => ({
      ...slide,
      leftTitleLines: [...slide.leftTitleLines],
    })),
    fallbackStories: DEFAULT_HOMEPAGE_CONTENT.fallbackStories.map((story) => ({ ...story })),
    fallbackSpots: DEFAULT_HOMEPAGE_CONTENT.fallbackSpots.map((spot) => ({ ...spot })),
    featuredVideo: { ...DEFAULT_HOMEPAGE_CONTENT.featuredVideo },
    readyToSkate: { ...DEFAULT_HOMEPAGE_CONTENT.readyToSkate },
  }
}
