"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CountdownTimer } from "@/components/countdown-timer"
import { ArrowLeft, ArrowRight, Bell, ShieldCheck, Clock, Ban } from "lucide-react"

export function HypeDropCountdown() {
  const [email, setEmail] = useState("")
  const [notified, setNotified] = useState(false)
  const dropDate = new Date("2026-03-01T17:00:00Z")

  const rules = [
    { icon: ShieldCheck, text: "1 per customer, no exceptions" },
    { icon: Clock, text: "Queue system may apply at drop time" },
    { icon: Ban, text: "Bots will be detected and blocked" },
  ]

  return (
    <div className="noise-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 lg:p-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <span className="text-lg font-bold tracking-tighter text-foreground">
          GOOFY<span className="text-primary">.</span>
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Label */}
        <div className="mb-6 flex items-center gap-2 rounded-none border border-primary/30 bg-primary/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Incoming Drop
          </span>
        </div>

        {/* Title */}
        <h1 className="max-w-2xl text-5xl font-bold leading-[0.9] tracking-tighter text-foreground sm:text-7xl lg:text-8xl text-balance">
          Shadow Series
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          March 1, 2026 at 12:00 PM EST
        </p>

        {/* Countdown */}
        <div className="mt-10">
          <CountdownTimer targetDate={dropDate} variant="full" />
        </div>

        {/* Product preview card */}
        <div className="mt-12 w-full max-w-sm overflow-hidden border border-border bg-card">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/drop-preview.jpg"
              alt="Shadow Series drop preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Limited Edition</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">Shadow Deck Pro + Void Hoodie</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Bundle exclusive to this drop</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" className="rounded-none px-8 py-6 text-sm font-bold uppercase tracking-widest" asChild>
            <Link href="/#products">
              Enter Drop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {!notified ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setNotified(true) }}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-48 rounded-none border-border bg-secondary text-sm"
              />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="rounded-none border-border py-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notify Me
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 rounded-none border border-primary/30 bg-primary/10 px-4 py-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Notification set
              </span>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:gap-8">
          {rules.map((rule) => (
            <div key={rule.text} className="flex items-center gap-2.5">
              <rule.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
    </div>
  )
}
