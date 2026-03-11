import type { Metadata } from "next"
import { DynamicZoneRenderer } from "@/components/dynamic-zone-renderer"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { PromoCodeBanner } from "@/components/promo-code-banner"
import { SearchCommand } from "@/components/search-command"
import { defaultHomePageSections, defaultGlobalConfig, defaultSeoTitle, defaultSeoDescription } from "@/config/defaults"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: defaultSeoTitle,
    description: defaultSeoDescription,
    openGraph: {
      title: defaultSeoTitle,
      description: defaultSeoDescription,
      type: "website",
    },
  }
}

export default async function HomePage() {
  const homePageSections = defaultHomePageSections
  const globalConfig = defaultGlobalConfig

  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter
  const showPromoBanner =
    godMode.enabled && godMode.conversion.showPromoCodeBanner
  const slideshowIndex = homePageSections.findIndex(
    (section) => section.__component === "sections.slideshow",
  )
  const marqueeIndex = homePageSections.findIndex(
    (section) => section.__component === "sections.marquee-text",
  )

  const sectionsToRender = homePageSections.filter((_, index) => {
    if (index === slideshowIndex || index === marqueeIndex) return false
    return true
  })

  if (slideshowIndex >= 0) {
    sectionsToRender.unshift(homePageSections[slideshowIndex])
  }

  if (marqueeIndex >= 0) {
    const insertAt = slideshowIndex >= 0 ? 1 : 0
    sectionsToRender.splice(insertAt, 0, homePageSections[marqueeIndex])
  }

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {showNavbar ? <NavbarServer /> : null}

      <div className={showNavbar ? "pt-16" : undefined}>
        {!showNavbar ? <div className="h-[2px] w-full menu-color-line" /> : null}

        {showPromoBanner ? (
          <PromoCodeBanner
            text={godMode.conversion.promoBannerText}
            code={godMode.conversion.promoBannerCode}
            ctaText={godMode.conversion.promoBannerCtaText}
            ctaLink={godMode.conversion.promoBannerCtaLink}
          />
        ) : null}

        <DynamicZoneRenderer sections={sectionsToRender as any} />
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
