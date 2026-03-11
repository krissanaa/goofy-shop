import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { SkateparksPage } from "@/components/skateparks-page"
import { getSkateparks } from "@/lib/api"
import { defaultGlobalConfig, defaultLocationsPageConfig } from "@/config/defaults"

export async function generateMetadata(): Promise<Metadata> {
  const locationsPage = defaultLocationsPageConfig
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
  const globalConfig = defaultGlobalConfig
  const locationsPageConfig = defaultLocationsPageConfig
  const supabaseSkateparks = await getSkateparks()

  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {showNavbar ? <NavbarServer /> : null}

      <div className={showNavbar ? "pt-16" : undefined}>
        <SkateparksPage
          pageTitle={locationsPageConfig.pageTitle}
          searchPlaceholder={locationsPageConfig.searchPlaceholder}
          parks={supabaseSkateparks.length > 0 ? supabaseSkateparks.map((p: any) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            placeCode: p.city,
            categoryLabel: 'Skatepark',
            reviewSnippet: '',
            rating: Number(p.rating),
            reviewsCount: p.review_count,
            status: p.open ? 'open' : 'closed',
            opensText: p.hours,
            accessType: 'free',
            environmentType: 'outdoor',
            hasBowl: false,
            hasStreet: true,
            hasNight: false,
            tags: p.tags || [],
            distance: '',
            photoCount: p.photo_count,
            mapsQuery: `${p.name}, ${p.city}`,
            imageUrl: p.photo || '/placeholder.jpg',
          })) : locationsPageConfig.parks}
        />
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
