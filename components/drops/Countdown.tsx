"use client"

import { useEffect, useState } from "react"

interface CountdownProps {
  targetDate?: string | null
  compact?: boolean
}

type CountdownState = {
  days: string
  hours: string
  minutes: string
  seconds: string
}

function getCountdown(targetDate?: string | null): CountdownState {
  if (!targetDate) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const diff = Math.max(new Date(targetDate).getTime() - Date.now(), 0)
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  }
}

export function Countdown({ targetDate, compact = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownState>(() => getCountdown(targetDate))

  useEffect(() => {
    setTimeLeft(getCountdown(targetDate))

    if (!targetDate) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft(getCountdown(targetDate))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {units.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="goofy-display text-[24px] leading-none text-[var(--white)]">
              {unit.value}
            </div>
            <div className="goofy-mono mt-1 text-[7px] uppercase tracking-[0.18em] text-white/28">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="border border-[var(--bordw)] bg-white/[0.03] px-4 py-5 text-center"
        >
          <div className="goofy-display text-[clamp(34px,4vw,58px)] leading-none text-[var(--white)]">
            {unit.value}
          </div>
          <div className="goofy-mono mt-2 text-[8px] uppercase tracking-[0.2em] text-white/35">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  )
}
