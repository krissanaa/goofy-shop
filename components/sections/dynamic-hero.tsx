import type { HeroSectionData } from "@/lib/strapi-types"
import { getStrapiImageUrl } from "@/lib/strapi"
import { HeroSection, type HeroStat } from "@/components/sections/HeroSection"

interface DynamicHeroProps {
  data: HeroSectionData
}

const fallbackSlide = [{ src: "/images/hero-1.jpg", alt: "Streetwear hero image" }]

function resolveTitleLines(rawTitle: string | null): {
  line1: string
  line2: string
  line3: string
} {
  const fallback = {
    line1: "LAOS",
    line2: "SKATE",
    line3: "CULTURE",
  }

  const title = rawTitle?.trim()
  if (!title) return fallback

  const parts = title
    .split(/\r?\n|[|/]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (parts.length >= 3) {
    return {
      line1: parts[0],
      line2: parts[1],
      line3: parts[2],
    }
  }

  if (parts.length === 2) {
    return {
      line1: parts[0],
      line2: parts[1],
      line3: fallback.line3,
    }
  }

  return {
    line1: parts[0],
    line2: fallback.line2,
    line3: fallback.line3,
  }
}

function normalizeStats(
  stats: HeroSectionData["stats"],
): HeroStat[] | undefined {
  if (!Array.isArray(stats) || stats.length === 0) {
    return undefined
  }

  return stats.map((item) => ({
    value: item.value?.trim() || "0",
    label: (item.label?.trim() || "METRIC").toUpperCase(),
    color: item.color?.trim() || undefined,
  }))
}

export function DynamicHero({ data }: DynamicHeroProps) {
  const slides = data.background_image
    ? [
        {
          src: getStrapiImageUrl(data.background_image, "large"),
          alt: data.background_image.alternativeText || data.title,
        },
      ]
    : fallbackSlide

  const description =
    data.subtitle?.trim() || "First skateboard shop & community in Laos"
  const titleLines = resolveTitleLines(data.title)

  return (
    <HeroSection
      slides={slides}
      showDots={false}
      badgeText={data.badge_text?.trim() || "GOOFY LAOS"}
      headingLine1={titleLines.line1}
      headingLine2={titleLines.line2}
      headingLine3={titleLines.line3}
      description={description}
      primaryAction={
        data.cta_text?.trim() && data.cta_link?.trim()
          ? { label: data.cta_text.trim(), href: data.cta_link.trim() }
          : { label: "SHOP NOW", href: "/products" }
      }
      secondaryAction={
        data.secondary_cta_text?.trim() && data.secondary_cta_link?.trim()
          ? {
              label: data.secondary_cta_text.trim(),
              href: data.secondary_cta_link.trim(),
            }
          : { label: "WATCH US SKATE \u25B6", href: "#videos" }
      }
      stats={normalizeStats(data.stats)}
    />
  )
}
