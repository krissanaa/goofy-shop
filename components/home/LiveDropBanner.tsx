import Link from "next/link"
import { Countdown } from "@/components/drops/Countdown"
import { NotifyBtn } from "@/components/drops/NotifyBtn"
import { normalizeDropEvent } from "@/lib/drops"
import { createClient } from "@/lib/supabase/server"

export async function LiveDropBanner() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("drop_events")
    .select("*")
    .order("drop_date", { ascending: true })
    .limit(8)

  const featuredDrop = (data ?? [])
    .map((row) => {
      const genericRow = row as Record<string, unknown>
      const rawFeatured = genericRow.is_featured ?? genericRow.featured
      const normalizedFeatured =
        typeof rawFeatured === "string" ? rawFeatured.trim().toLowerCase() : rawFeatured
      const isFeatured =
        normalizedFeatured === true ||
        normalizedFeatured === 1 ||
        normalizedFeatured === "1" ||
        normalizedFeatured === "true"

      return {
        drop: normalizeDropEvent(genericRow),
        isFeatured,
      }
    })
    .filter((entry) => entry.drop.status === "active" || entry.drop.status === "upcoming")
    .sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1
      }

      if (left.drop.status !== right.drop.status) {
        return left.drop.status === "active" ? -1 : 1
      }

      const leftTimestamp = left.drop.dropDate ? new Date(left.drop.dropDate).getTime() : 0
      const rightTimestamp = right.drop.dropDate ? new Date(right.drop.dropDate).getTime() : 0
      return leftTimestamp - rightTimestamp
    })[0]?.drop

  if (!featuredDrop) {
    return null
  }

  if (featuredDrop.status === "active") {
    return (
      <section className="bg-[var(--gold)] text-[var(--black)]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 sale-dot-pulse" />
            <span className="goofy-mono text-[8px] uppercase tracking-[0.22em]">
              Live Now
            </span>
            <h2 className="goofy-display text-[32px] leading-none">
              {featuredDrop.title}
            </h2>
          </div>

          <Link
            href={`/drops/${featuredDrop.slug}`}
            className="goofy-mono inline-flex items-center text-[9px] uppercase tracking-[0.18em] text-[var(--black)] transition-opacity hover:opacity-70"
          >
            Shop Drop -{">"}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="border-y border-[var(--bordw)] bg-[var(--black)] text-[var(--white)]">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 md:px-10 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
        <div>
          <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Dropping Soon
          </p>
          <h2 className="goofy-display mt-2 text-[clamp(28px,4vw,48px)] leading-none text-[var(--white)]">
            {featuredDrop.title}
          </h2>
        </div>

        <Countdown targetDate={featuredDrop.dropDate} compact />

        <div className="xl:justify-self-end">
          <NotifyBtn dropId={featuredDrop.id} />
        </div>
      </div>
    </section>
  )
}
