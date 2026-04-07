import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { TeamRosterGrid } from "@/components/team-roster-grid"
import { getTeamRoster } from "@/lib/team-roster.server"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Team | GOOFY SHOP",
    description: "Meet the GOOFY team through a square hover-grid roster.",
    openGraph: {
      title: "Team | GOOFY SHOP",
      description: "Meet the GOOFY team through a square hover-grid roster.",
      type: "website",
    },
  }
}

export default async function TeamsPage() {
  const members = await getTeamRoster()

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <NavbarServer />

      <div className="pt-16">
        <section className="border-b border-white/10 px-6 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1480px]">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#EE3A24]">
              Team // Roster Grid
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <h1
                  className="text-[clamp(3.4rem,9vw,8rem)] font-black uppercase italic leading-[0.86] tracking-[-0.06em]"
                  style={{ fontFamily: "var(--font-ui-sans)" }}
                >
                  Meet The Team
                </h1>
                <p className="mt-4 max-w-3xl font-mono text-[11px] uppercase tracking-[0.18em] text-white/46">
                  Clean square tiles by default. Hover a rider to wake the color
                  feed, trigger the status border, and reveal the name tag.
                </p>
              </div>

              <div className="border border-white/10 bg-white/[0.03] px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#EE3A24]">
                  Hover Notes
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/42">
                  4 square cards // status color borders // grayscale off on hover
                </p>
              </div>
            </div>
          </div>
        </section>

        <TeamRosterGrid members={members} />
      </div>

      <Footer />
      <SearchCommand />
    </main>
  )
}
