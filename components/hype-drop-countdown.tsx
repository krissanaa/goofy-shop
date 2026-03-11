"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, Clock3 } from "lucide-react"

interface HypeDropCountdownProps {
  dropTitle?: string
  dropDate?: Date
  dropSubtitle?: string
  heroBannerUrl?: string | null
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const DROP_RULES = [
  "Only 100 pieces available worldwide",
  "First come, first served access",
  "Queue system enabled for fair entry",
  "Payment window closes after 5 minutes",
  "No cancellations after checkout",
]

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export function HypeDropCountdown({
  dropTitle = "Shadow Series",
  dropDate = new Date("2026-03-01T17:00:00Z"),
  dropSubtitle = "Limited edition drop. Ultra-exclusive. Never restocked.",
  heroBannerUrl = null,
}: HypeDropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(dropDate))
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const syncCountdown = () => {
      setTimeLeft(getTimeLeft(dropDate))
    }

    syncCountdown()
    const timer = window.setInterval(syncCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [dropDate])

  useEffect(() => {
    if (!isSubscribed) return
    const timer = window.setTimeout(() => setIsSubscribed(false), 2800)
    return () => window.clearTimeout(timer)
  }, [isSubscribed])

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubscribed(true)
    setEmail("")
  }

  const isLive =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0

  return (
    <div className="bg-[#F1EEE8]">
      <section className="border-y-4 border-black bg-[#0A0E1A] text-[#F5EFE0]">
        <div className="relative overflow-hidden">
          {heroBannerUrl ? (
            <img
              src={heroBannerUrl}
              alt={dropTitle}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A0E1A_0%,#151C33_45%,#6B8CFF_100%)]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,14,26,0.94)_0%,rgba(10,14,26,0.82)_52%,rgba(10,14,26,0.5)_100%)]" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
            <p className="inline-flex w-fit border border-[#F8B800] bg-[#F8B800] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
              Drop Countdown
            </p>

            <h1 className="max-w-3xl text-[clamp(42px,7vw,88px)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
              {dropTitle}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-white/82 md:text-base">
              {dropSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">
              <span
                className={`border-2 border-black px-3 py-2 ${
                  isLive ? "bg-[#E70009] text-white" : "bg-[#F8B800] text-black"
                }`}
              >
                {isLive ? "Drop live" : "Upcoming drop"}
              </span>
              <span>2847 waiting</span>
              <span>Queue on</span>
              <span>1203 notified</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)]">
          <div className="border-4 border-black bg-black p-6 text-white shadow-[6px_6px_0_#E70009]">
            <div className="flex items-center gap-2 text-[#F8B800]">
              <Clock3 className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Countdown
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="border-2 border-[#F8B800] bg-[#111111] px-4 py-5 text-center"
                >
                  <p className="text-[clamp(28px,4vw,42px)] font-black text-[#F8B800]">
                    {String(unit.value).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Allocation
                </p>
                <p className="mt-2 text-2xl font-black uppercase">100 units</p>
              </div>
              <div className="border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Checkout
                </p>
                <p className="mt-2 text-2xl font-black uppercase">5 min hold</p>
              </div>
              <div className="border border-white/25 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Restock
                </p>
                <p className="mt-2 text-2xl font-black uppercase">Never</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/products?badge=drop"
                className="inline-flex h-11 items-center justify-center border-2 border-black bg-[#F8B800] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_#000]"
              >
                View drop products
              </Link>
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center border-2 border-white bg-transparent px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
              >
                Browse all products
              </Link>
            </div>
          </div>

          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_#0A0A0A]">
            <h2 className="text-xl font-black uppercase tracking-[0.06em] text-black">
              Drop rules
            </h2>
            <ul className="mt-4 space-y-3">
              {DROP_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-sm text-black/80">
                  <span className="mt-0.5 text-[#E70009]">{">"}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t-2 border-black pt-6">
              <div className="flex items-center gap-2 text-black">
                <Bell className="h-4 w-4 text-[#E70009]" />
                <h2 className="text-xl font-black uppercase tracking-[0.06em]">
                  Get notified
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black/70">
                Drop your email and get a reminder before release.
              </p>

              <form onSubmit={handleSubscribe} className="mt-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="h-12 flex-1 border-2 border-black bg-[#F5EFE0] px-4 text-sm text-black outline-none placeholder:text-black/45"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center border-2 border-black bg-black px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_#E70009]"
                  >
                    Notify me
                  </button>
                </div>

                {isSubscribed ? (
                  <p className="mt-3 text-sm font-semibold text-[#00AA00]">
                    Reminder saved. You are on the list.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
