"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { GoofyButton } from "@/components/GoofyButton"

interface LiveDropBannerProps {
  title: string
  status: string
  dropDate?: string | null
  href: string
}

function getDropDisplay(title: string) {
  const tokens = title
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.toUpperCase())

  if (tokens.length >= 3) {
    return [tokens[0], tokens[1], tokens.slice(2).join(" ")]
  }

  if (tokens.length === 2) {
    return [tokens[0], "DROP", tokens[1]]
  }

  if (tokens.length === 1) {
    return [tokens[0], "DROP", "001"]
  }

  return ["SPRING", "DROP", "001"]
}

function getTimeParts(dropDate?: string | null) {
  if (!dropDate) {
    return { hours: "00", minutes: "00", seconds: "00" }
  }

  const diff = Math.max(new Date(dropDate).getTime() - Date.now(), 0)
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  }
}

export function LiveDropBanner({
  title,
  status,
  dropDate,
  href,
}: LiveDropBannerProps) {
  const normalizedStatus = status.toUpperCase()
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(dropDate))
  const [lineOne, lineTwo, lineThree] = useMemo(
    () => getDropDisplay(title),
    [title],
  )

  useEffect(() => {
    setTimeLeft(getTimeParts(dropDate))

    if (normalizedStatus === "LIVE" || !dropDate) return

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeParts(dropDate))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [dropDate, normalizedStatus])

  if (normalizedStatus !== "LIVE" && normalizedStatus !== "UPCOMING") {
    return null
  }

  return (
    <Link
      href={href}
      className="group block bg-[var(--black)] px-5 py-10 text-[var(--white)] transition-opacity duration-300 hover:opacity-92 md:px-10"
    >
      <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-4">
          <p className="goofy-mono inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
            <span
              className={`inline-flex h-2 w-2 rounded-full bg-[var(--gold)] ${
                normalizedStatus === "LIVE" ? "sale-dot-pulse" : ""
              }`}
            />
            <span>
              {normalizedStatus === "LIVE" ? "Live Now" : "Coming"} {"·"} {title}
            </span>
          </p>

          <div className="space-y-0">
            <h2 className="goofy-display text-[clamp(48px,7vw,96px)] leading-[0.82] text-[var(--white)]">
              {lineOne}
            </h2>
            <h2 className="goofy-display goofy-outline text-[clamp(48px,7vw,96px)] leading-[0.82]">
              {lineTwo}
            </h2>
            <h2 className="goofy-display text-[clamp(48px,7vw,96px)] leading-[0.82] text-[var(--white)]">
              {lineThree}
            </h2>
          </div>

          <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
            Limited quantities {"·"} Limit 1 per person
          </p>
        </div>

        <div className="space-y-5 lg:text-right">
          {normalizedStatus === "LIVE" ? (
            <div className="goofy-display text-[clamp(40px,5vw,62px)] leading-none text-[var(--gold)]">
              Happening Now
            </div>
          ) : (
            <div className="inline-flex items-end gap-3 border border-[var(--bordw)] px-4 py-3">
              {[
                { label: "hrs", value: timeLeft.hours },
                { label: "min", value: timeLeft.minutes },
                { label: "sec", value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={item.label} className="flex items-end gap-3">
                  <div className="text-center">
                    <div className="goofy-display text-[52px] leading-none text-[var(--white)]">
                      {item.value}
                    </div>
                    <div className="goofy-mono mt-1 text-[7px] uppercase tracking-[0.22em] text-white/20">
                      {item.label}
                    </div>
                  </div>

                  {index < 2 ? (
                    <span className="goofy-display pb-2 text-[40px] leading-none text-white/10">
                      :
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div>
            <GoofyButton
              href={href}
              variant={normalizedStatus === "LIVE" ? "gold" : "outline"}
              className={
                normalizedStatus === "LIVE"
                  ? ""
                  : "border-white/16 bg-transparent text-[var(--white)]"
              }
            >
              {normalizedStatus === "LIVE" ? "Shop the Drop" : "Notify Me"} {"->"}
            </GoofyButton>
          </div>
        </div>
      </div>
    </Link>
  )
}
