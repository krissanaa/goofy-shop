import Image from "next/image"
import Link from "next/link"

interface DynamicStreetsBannerProps {
  data: any
}

export function DynamicStreetsBanner({ data }: DynamicStreetsBannerProps) {
  const eyebrow = data.eyebrow?.trim() || "GOOFY SHOP"
  const title = data.title?.trim() || "BUILT FOR THE STREETS"
  const subtitle =
    data.subtitle?.trim() ||
    "High-performance gear made for daily sessions."
  const ctaText = data.cta_text?.trim() || "Shop The Drop"
  const ctaLink = data.cta_link?.trim() || "/products"
  const bannerImageUrl = data.background_image
    ? data.background_image.url
    : null

  return (
    <section className="relative overflow-hidden bg-[#F1EEE8] py-12">
      {bannerImageUrl ? (
        <Image
          src={bannerImageUrl}
          alt={title}
          fill
          className="object-cover opacity-[0.08]"
          sizes="100vw"
        />
      ) : null}
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E70009]">
            {eyebrow}
          </p>
          <div className="mt-2 h-[2px] w-36 menu-color-line" />
        </div>
        <h2 className="max-w-3xl text-3xl font-black uppercase tracking-[0.04em] text-black md:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm text-black/70 md:text-base">
          {subtitle}
        </p>
        <Link
          href={ctaLink}
          className="inline-flex w-fit border-2 border-black bg-[#FBD000] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-[#E70009] hover:text-white"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  )
}
