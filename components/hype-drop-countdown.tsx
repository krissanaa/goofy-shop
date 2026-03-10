"use client"

import { useState, useEffect } from "react"
import { Bell, Users, Zap } from "lucide-react"

interface HypeDropCountdownProps {
  dropTitle?: string
  dropDate?: Date
  dropSubtitle?: string
  heroBannerUrl?: string | null
}

export function HypeDropCountdown({
  dropTitle = "Shadow Series",
  dropDate = new Date("2026-03-01T17:00:00Z"),
  dropSubtitle = "Limited edition drop. Ultra-exclusive. Never restocked.",
}: HypeDropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const targetDate = dropDate
    
    const timer = setInterval(() => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [dropDate])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="pb-10">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">

          {/* Title */}
          <h1 className="font-black leading-tight text-foreground mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            {dropTitle}
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            {dropSubtitle}
          </p>

          {/* Countdown */}
          {timeLeft && (
            <div className="rounded-lg border-3 border-foreground bg-card p-8 pixel-card mb-12">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Drop starts in</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[/* eslint-disable @typescript-eslint/no-useless-computed-key */
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Minutes" },
                  { value: timeLeft.seconds, label: "Seconds" },
                ].map((unit) => (
                  <div key={unit.label} className="rounded border-2 border-border bg-muted p-4">
                    <p className="text-3xl font-black text-foreground mb-2">{unit.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{unit.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Rules */}
          <div className="rounded-lg border-3 border-foreground bg-card p-8 pixel-card mb-12 text-left">
            <h2 className="font-black text-lg text-foreground mb-4">Drop Rules</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▶</span>
                <span className="text-sm">Only 100 pieces available worldwide</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▶</span>
                <span className="text-sm">First-come, first-served basis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▶</span>
                <span className="text-sm">Queue system enabled for fair access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▶</span>
                <span className="text-sm">Payment required within 5 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">▶</span>
                <span className="text-sm">No cancellations or refunds</span>
              </li>
            </ul>
          </div>

          {/* Notification Form */}
          <div className="rounded-lg border-3 border-foreground bg-card p-8 pixel-card">
            <h2 className="font-black text-lg text-primary mb-4">Get Notified</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your email to receive a notification 5 minutes before the drop.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="submit"
                  className="mario-btn mario-btn-red"
                >
                  Notify Me
                </button>
              </div>
              {isSubscribed && (
                <p className="text-primary text-xs font-medium mt-3">
                  ✓ You'll be notified!
                </p>
              )}
            </form>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">2,847 waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Queue enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="text-sm">1,203 notified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
