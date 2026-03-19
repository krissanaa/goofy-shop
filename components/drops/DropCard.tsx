import Image from "next/image"
import Link from "next/link"
import { Countdown } from "@/components/drops/Countdown"
import { formatDropDate, type DropEvent } from "@/lib/drops"

interface DropCardProps {
  drop: DropEvent
}

export function DropCard({ drop }: DropCardProps) {
  const badgeTone =
    drop.status === "active"
      ? "bg-[var(--gold)] text-[var(--black)]"
      : drop.status === "upcoming"
        ? "bg-white/10 text-[var(--white)]"
        : "bg-white/8 text-white/45"

  const badgeLabel =
    drop.status === "active" ? "LIVE" : drop.status === "upcoming" ? "UPCOMING" : "ENDED"

  return (
    <Link
      href={`/drops/${drop.slug}`}
      className="group block overflow-hidden border border-[var(--bordw)] bg-[var(--black)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
        {drop.coverImage || drop.teaserImage ? (
          <Image
            src={drop.coverImage || drop.teaserImage || "/placeholder.jpg"}
            alt={drop.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className={`object-cover transition duration-700 group-hover:scale-[1.04] ${drop.status === "past" ? "grayscale opacity-60" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#111,#050505)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.76))]" />
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2">
          {drop.status === "active" ? (
            <span className="h-2 w-2 rounded-full bg-red-500 sale-dot-pulse" />
          ) : null}
          <span className={`px-2 py-1 goofy-mono text-[8px] uppercase tracking-[0.18em] ${badgeTone}`}>
            {badgeLabel}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--gold)]">
              GOOFY. DROP
            </p>
            <h2 className="goofy-display mt-3 text-[34px] leading-[0.88] text-[var(--white)] transition-colors group-hover:text-[var(--gold)]">
              {drop.title}
            </h2>
          </div>
          <span className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/28">
            {formatDropDate(drop.dropDate)}
          </span>
        </div>

        {drop.status === "upcoming" ? (
          <Countdown targetDate={drop.dropDate} compact />
        ) : (
          <p className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-white/34">
            {drop.status === "active"
              ? "Available now. Limited quantities."
              : "Archive drop. View the release details."}
          </p>
        )}
      </div>
    </Link>
  )
}
