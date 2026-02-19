"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: Date
  variant?: "card" | "inline" | "full"
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ targetDate, variant = "card" }: CountdownTimerProps) {
  const [time, setTime] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ]

  if (variant === "full") {
    return (
      <div className="flex items-center gap-4 sm:gap-6">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold tracking-tighter text-foreground sm:text-8xl lg:text-9xl font-mono tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-4xl font-light text-foreground/20 sm:text-6xl lg:text-7xl">:</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 font-mono text-sm tabular-nums text-muted-foreground">
        {units.map((unit, i) => (
          <span key={unit.label}>
            <span className="text-foreground font-bold">{String(unit.value).padStart(2, '0')}</span>
            <span className="ml-0.5 text-muted-foreground/60">{unit.label.charAt(0).toLowerCase()}</span>
            {i < units.length - 1 && <span className="ml-3 text-foreground/20">:</span>}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="border border-border bg-card p-6 lg:p-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
        Next Drop
      </p>
      <div className="flex items-center gap-4">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold tracking-tighter text-foreground font-mono tabular-nums lg:text-4xl">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="text-xl font-light text-foreground/20">:</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        March 1, 2026 at 12:00 PM EST
      </p>
    </div>
  )
}
