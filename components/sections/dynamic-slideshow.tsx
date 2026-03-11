import { HeroSection, type HeroStat } from "@/components/sections/HeroSection"

interface DynamicSlideshowProps {
  data: any
}

const fallbackSlides = [
  { src: "/images/hero-1.jpg", alt: "Streetwear collection hero" },
]

const fallbackStats: HeroStat[] = [
  { value: "50+", label: "PRODUCTS", tone: "yellow" },
  { value: "100+", label: "COMMUNITY", tone: "yellow" },
  { value: "20+", label: "VIDEOS", tone: "yellow" },
]

export function DynamicSlideshow({ data }: DynamicSlideshowProps) {
  const slides = !data.slides?.length
    ? fallbackSlides
    : data.slides.map((slide: any, index: number) => ({
        src: slide.url,
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

  const badgeText = data.badge_text?.trim() || "GOOFY LAOS"
  const headingLine1 = data.heading_line_1?.trim() || "LAOS"
  const headingHighlight = data.heading_highlight?.trim() || "SKATE"
  const headingLine2 = data.heading_line_2?.trim() || "CULTURE"
  const description =
    data.description?.trim() ||
    "First skateboard shop & community in Laos"
  const primaryCtaText = data.primary_cta_text?.trim() || "SHOP NOW"
  const primaryCtaLink = data.primary_cta_link?.trim() || "/products"
  const secondaryCtaText = data.secondary_cta_text?.trim() || "WATCH US SKATE \u25B6"
  const secondaryCtaLink = data.secondary_cta_link?.trim() || "#videos"
  const bottomNoteText =
    data.bottom_note_text?.trim() || "GOOFY SKATE COMMUNITY LAOS"

  const hasAnyAction = Boolean(primaryCtaText && primaryCtaLink) || Boolean(secondaryCtaText && secondaryCtaLink)

  return (
    <HeroSection
      slides={slides}
      autoplaySeconds={data.autoplay_seconds || 6}
      compact
      heightClassName="h-[calc(100svh-6.5rem)] min-h-[calc(100svh-6.5rem)]"
      textVisibleOnFirstSlideOnly
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
      bottomNoteText={bottomNoteText}
      stats={stats}
    />
  )
}
