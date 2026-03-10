import type { Metadata } from "next"
import { DynamicZoneRenderer } from "@/components/dynamic-zone-renderer"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { PromoCodeBanner } from "@/components/promo-code-banner"
import { SearchCommand } from "@/components/search-command"
import { getHomePage, getResolvedGlobalConfig } from "@/lib/strapi"

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage()

  return {
    title: homePage.seoTitle,
    description: homePage.seoDescription,
    openGraph: {
      title: homePage.seoTitle,
      description: homePage.seoDescription,
      type: "website",
    },
  }
}

export default async function HomePage() {
  const [homePage, globalConfig] = await Promise.all([
    getHomePage(),
    getResolvedGlobalConfig(),
  ])

  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter
  const showPromoBanner =
    godMode.enabled && godMode.conversion.showPromoCodeBanner
  const slideshowIndex = homePage.sections.findIndex(
    (section) => section.__component === "sections.slideshow",
  )
  const marqueeIndex = homePage.sections.findIndex(
    (section) => section.__component === "sections.marquee-text",
  )

  const sectionsToRender = homePage.sections.filter((_, index) => {
    if (index === slideshowIndex || index === marqueeIndex) return false
    return true
  })

  if (slideshowIndex >= 0) {
    sectionsToRender.unshift(homePage.sections[slideshowIndex])
  }

  if (marqueeIndex >= 0) {
    const insertAt = slideshowIndex >= 0 ? 1 : 0
    sectionsToRender.splice(insertAt, 0, homePage.sections[marqueeIndex])
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

        <DynamicZoneRenderer sections={sectionsToRender} />
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
