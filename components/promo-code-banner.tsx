import Link from "next/link"

interface PromoCodeBannerProps {
  text: string
  code: string
  ctaText: string
  ctaLink: string
}

export function PromoCodeBanner({
  text,
  code,
  ctaText,
  ctaLink,
}: PromoCodeBannerProps) {
  return (
    <section className="border-b-2 border-black bg-[#FBD000]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 text-center sm:flex-row sm:text-left lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-black md:text-sm">
          {text}{" "}
          <span className="bg-black px-2 py-1 text-[#FBD000]">{code}</span>
        </p>
        <Link
          href={ctaLink}
          className="border-2 border-black bg-black px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#E70009]"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  )
}
