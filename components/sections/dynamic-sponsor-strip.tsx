import { SponsorLogoStrip, type SponsorBrand } from "@/components/sponsor-logo-strip"

interface DynamicSponsorStripProps {
  data: any
}

const FALLBACK_BRANDS: SponsorBrand[] = [
  { name: "BAKER", url: "https://www.bakerskateboards.com", logoUrl: "https://logo.clearbit.com/bakerskateboards.com" },
  { name: "PALACE", url: "https://www.palaceskateboards.com", logoUrl: "https://logo.clearbit.com/palaceskateboards.com" },
  { name: "PRIMITIVE", url: "https://primitiveskate.com", logoUrl: "https://logo.clearbit.com/primitiveskate.com" },
  { name: "ENJOI", url: "https://enjoico.com", logoUrl: "https://logo.clearbit.com/enjoico.com" },
  { name: "SANTA CRUZ", url: "https://santacruzskateboards.com", logoUrl: "https://logo.clearbit.com/santacruzskateboards.com" },
  { name: "ELEMENT", url: "https://www.elementbrand.com", logoUrl: "https://logo.clearbit.com/elementbrand.com" },
  { name: "GIRL", url: "https://www.girlskateboards.com", logoUrl: "https://logo.clearbit.com/girlskateboards.com" },
  { name: "REAL", url: "https://www.realskateboards.com", logoUrl: "https://logo.clearbit.com/realskateboards.com" },
]

function normalizeLogos(logos: any[]): SponsorBrand[] {
  if (!Array.isArray(logos) || logos.length === 0) return FALLBACK_BRANDS

  const parsed: SponsorBrand[] = []

  for (const logo of logos) {
    const name = typeof logo?.name === "string" ? logo.name.trim() : ""
    if (!name) continue

    const url = typeof logo?.url === "string" ? logo.url.trim() : undefined
    const logoUrl = typeof logo?.logoUrl === "string"
      ? logo.logoUrl.trim()
      : typeof logo?.logo === "string"
        ? logo.logo.trim()
        : undefined

    parsed.push({
      name,
      url: url || undefined,
      logoUrl: logoUrl || undefined,
    })
  }

  return parsed.length > 0 ? parsed : FALLBACK_BRANDS
}

export function DynamicSponsorStrip({ data }: DynamicSponsorStripProps) {
  const title = data.title?.trim() || "TRUSTED BY THE CULTURE"
  const brands = normalizeLogos(data.logos)

  return (
    <section className="w-full bg-[#F1EEE8] py-8">
      <SponsorLogoStrip brands={brands} title={`* ${title} *`} />
    </section>
  )
}
