import { getStrapiImageUrl } from "@/lib/strapi"
import type { SlideshowData } from "@/lib/strapi-types"
import { HeroSection, type HeroStat } from "@/components/sections/HeroSection"

interface DynamicSlideshowProps {
  data: SlideshowData
}

const fallbackSlides = [
  { src: "/images/hero-1.jpg", alt: "Streetwear collection hero" },
]

const fallbackStats: HeroStat[] = [
  { value: "500+", label: "PRODUCTS", tone: "red" },
  { value: "12K+", label: "SKATERS", tone: "blue" },
  { value: "100%", label: "AUTHENTIC", tone: "green" },
]

export function DynamicSlideshow({ data }: DynamicSlideshowProps) {
  const slides = !data.slides?.length
    ? fallbackSlides
    : data.slides.map((slide, index) => ({
        src: getStrapiImageUrl(slide, "large"),
        alt: slide.alternativeText || `Slideshow image ${index + 1}`,
      }))

  const stats: HeroStat[] = !Array.isArray(data.stats) || data.stats.length === 0
    ? fallbackStats
    : data.stats.map((item) => ({
        value: item.value?.trim() || "0",
        label: (item.label?.trim() || "METRIC").toUpperCase(),
        color: item.color?.trim() || undefined,
      }))

  const showOverlayText = data.show_overlay_text ?? true
  const showButtons = data.show_buttons ?? true
  const showStats = data.show_stats ?? true

  const badgeText = data.badge_text?.trim() || "SS26 COLLECTION"
  const headingLine1 = data.heading_line_1?.trim() || "BUILT FOR THE"
  const headingHighlight = data.heading_highlight?.trim() || "STREETS."
  const headingLine2 = data.heading_line_2?.trim() || "WORN BY THE CULTURE."
  const description =
    data.description?.trim() ||
    "Premium skate hardware and streetwear essentials. Limited drops, exclusive collabs, zero compromises."
  const primaryCtaText = data.primary_cta_text?.trim() || "Shop the Drop"
  const primaryCtaLink = data.primary_cta_link?.trim() || "/drop"
  const secondaryCtaText = data.secondary_cta_text?.trim() || "Explore Collection"
  const secondaryCtaLink = data.secondary_cta_link?.trim() || "#products"

  const hasAnyAction = Boolean(primaryCtaText && primaryCtaLink) || Boolean(secondaryCtaText && secondaryCtaLink)

  return (
    <HeroSection
      slides={slides}
      autoplaySeconds={data.autoplay_seconds || 6}
      compact
      heightClassName="h-[calc(100svh-6.5rem)] min-h-[calc(100svh-6.5rem)]"
      showDots={Boolean(data.show_dots)}
      showBadge={showOverlayText}
      showHeading={showOverlayText}
      showDescription={showOverlayText}
      showActions={showButtons && hasAnyAction}
      showStatsRow={showStats}
      badgeText={badgeText}
      headingLine1={headingLine1}
      headingLine2={headingHighlight}
      headingLine3={headingLine2}
      description={description}
      primaryAction={
        showButtons && primaryCtaText && primaryCtaLink
          ? { label: primaryCtaText, href: primaryCtaLink }
          : undefined
      }
      secondaryAction={
        showButtons && secondaryCtaText && secondaryCtaLink
          ? { label: secondaryCtaText, href: secondaryCtaLink }
          : undefined
      }
      stats={stats}
    />
  )
}
