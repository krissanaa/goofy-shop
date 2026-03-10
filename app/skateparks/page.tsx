import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { SkateparksPage } from "@/components/skateparks-page"
import { getLocationsPage, getResolvedGlobalConfig } from "@/lib/strapi"

export async function generateMetadata(): Promise<Metadata> {
  const locationsPage = await getLocationsPage()
  return {
    title: locationsPage.seoTitle,
    description: locationsPage.seoDescription,
    openGraph: {
      title: locationsPage.seoTitle,
      description: locationsPage.seoDescription,
      type: "website",
    },
  }
}

export default async function SkateparksRoute() {
  const [globalConfig, locationsPage] = await Promise.all([
    getResolvedGlobalConfig(),
    getLocationsPage(),
  ])

  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {showNavbar ? <NavbarServer /> : null}

      <div className={showNavbar ? "pt-16" : undefined}>
        <SkateparksPage
          pageTitle={locationsPage.pageTitle}
          searchPlaceholder={locationsPage.searchPlaceholder}
          parks={locationsPage.parks}
        />
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
