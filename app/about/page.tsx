import type { Metadata } from "next"
import { DynamicZoneRenderer } from "@/components/dynamic-zone-renderer"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import {
  defaultAboutPageSections,
  defaultGlobalConfig,
} from "@/config/defaults"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About | GOOFY SHOP",
    description: "Watch edits, tutorials, and skate videos from GOOFY SHOP.",
    openGraph: {
      title: "About | GOOFY SHOP",
      description: "Watch edits, tutorials, and skate videos from GOOFY SHOP.",
      type: "website",
    },
  }
}

export default async function AboutPage() {
  const globalConfig = defaultGlobalConfig
  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {showNavbar ? <NavbarServer /> : null}

      <div className={showNavbar ? "pt-16" : undefined}>
        <section className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-8 md:px-8">
          <div className="grid gap-4 border-4 border-black bg-black p-5 text-white shadow-[6px_6px_0_#FBD000] lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div>
              <p className="inline-flex border border-[#FBD000] bg-[#FBD000] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black">
                ABOUT
              </p>
              <h1 className="mt-4 text-[clamp(34px,5vw,58px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-white">
                Watch GOOFY
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
                Edits, tutorials, and skate clips from the shop and community.
                The YouTube block lives here now instead of on the homepage.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="border-2 border-black bg-white px-4 py-4 text-black">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
                  Video hub
                </p>
                <p className="mt-2 text-3xl font-black text-[#E70009]">01</p>
              </div>

              <div className="border-2 border-black bg-white px-4 py-4 text-black">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
                  Tutorials
                </p>
                <p className="mt-2 text-3xl font-black text-[#FBD000]">YES</p>
              </div>

              <div className="border-2 border-black bg-white px-4 py-4 text-black">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/60">
                  Community
                </p>
                <p className="mt-2 text-3xl font-black text-[#2B7FFF]">LIVE</p>
              </div>
            </div>
          </div>
        </section>

        <DynamicZoneRenderer sections={defaultAboutPageSections as any} />
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
