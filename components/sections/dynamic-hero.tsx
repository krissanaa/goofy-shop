import type { HeroSectionData } from "@/lib/strapi-types"
import { getStrapiImageUrl } from "@/lib/strapi"
import { HeroSection, type HeroStat } from "@/components/sections/HeroSection"

interface DynamicHeroProps {
  data: HeroSectionData
}

const fallbackSlide = [{ src: "/images/hero-1.jpg", alt: "Streetwear hero image" }]

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

  const description = data.subtitle?.trim() || undefined

  return (
    <HeroSection
      slides={slides}
      showDots={false}
      badgeText={data.badge_text?.trim() || "SS26 COLLECTION"}
      headingLine1={data.title?.trim() || "BUILT FOR THE"}
      headingLine2="STREETS."
      headingLine3="WORN BY THE CULTURE."
      description={description}
      primaryAction={
        data.cta_text?.trim() && data.cta_link?.trim()
          ? { label: data.cta_text.trim(), href: data.cta_link.trim() }
          : undefined
      }
      secondaryAction={
        data.secondary_cta_text?.trim() && data.secondary_cta_link?.trim()
          ? {
              label: data.secondary_cta_text.trim(),
              href: data.secondary_cta_link.trim(),
            }
          : undefined
      }
      stats={normalizeStats(data.stats)}
    />
  )
}
