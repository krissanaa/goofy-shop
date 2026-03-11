import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { HypeDropCountdown } from "@/components/hype-drop-countdown"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { getActiveDropEvent } from "@/lib/api"
import { defaultGlobalConfig } from "@/config/defaults"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const drop = await getActiveDropEvent()
    if (drop) {
      return {
        title: `${drop.title} — GOOFY SHOP`,
        description: `Limited drop event. ${new Date(drop.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. No restocks.`,
      }
    }
  } catch {}
  return {
    title: 'SHADOW SERIES DROP — GOOFY SHOP',
    description: 'The most anticipated drop of the season. Limited quantities. No restocks.',
  }
}

export default async function DropPage() {
  const config = defaultGlobalConfig
  const godMode = config.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter

  let dropTitle = "Shadow Series"
  let dropDate = new Date("2026-03-01T17:00:00Z")
  let dropSubtitle = "March 1, 2026 at 12:00 PM EST"
  let heroBannerUrl: string | null = null

  try {
    const drop = await getActiveDropEvent()
    if (drop) {
      dropTitle = drop.title
      dropDate = new Date(drop.drop_date)
      dropSubtitle = dropDate.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      }) + ' at ' + dropDate.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      })
      if (drop.teaser_image) {
        heroBannerUrl = drop.teaser_image
      }
    }
  } catch {}

  return (
    <main className="min-h-screen bg-background">
      {showNavbar ? <NavbarServer /> : null}
      <div className={showNavbar ? "pt-16" : undefined}>
        <HypeDropCountdown
          dropTitle={dropTitle}
          dropDate={dropDate}
          dropSubtitle={dropSubtitle}
          heroBannerUrl={heroBannerUrl}
        />
      </div>
      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
