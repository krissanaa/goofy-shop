import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { DropCard } from "@/components/drops/DropCard"
import { normalizeDropEvent, sortDropsForDisplay } from "@/lib/drops"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Drops - GOOFY. Skate",
}

export default async function DropsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("drop_events")
    .select("*")
    .order("drop_date", { ascending: false })

  const drops = sortDropsForDisplay(
    (data ?? []).map((row) => normalizeDropEvent(row as Record<string, unknown>)),
  )

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />
      <div className="mx-auto max-w-[1480px] px-5 pb-20 pt-24 md:px-10">
        <div className="border-b border-[var(--bordw)] pb-8">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            GOOFY. / DROPS
          </p>
          <h1 className="goofy-display mt-2 text-[clamp(42px,6vw,88px)] leading-none text-[var(--white)]">
            Releases From The Streets
          </h1>
        </div>

        {drops.length === 0 ? (
          <div className="py-20">
            <p className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              No drops have been published yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {drops.map((drop) => (
              <DropCard key={drop.id} drop={drop} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <SearchCommand />
    </main>
  )
}
