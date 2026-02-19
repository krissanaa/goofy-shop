"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const [email, setEmail] = useState("")

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-2xl font-bold tracking-tighter text-foreground">
              GOOFY<span className="text-primary">.</span>
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium streetwear and skateboard hardware for the culture. Based in LA, shipped worldwide.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                Stay in the loop
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail("") }}
                className="mt-3 flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-xs rounded-none border-border bg-secondary text-sm"
                />
                <Button type="submit" className="rounded-none px-6 text-xs font-bold uppercase tracking-widest">
                  Join
                </Button>
              </form>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">Shop</p>
            <ul className="mt-4 flex flex-col gap-3">
              {['New Arrivals', 'Decks', 'Apparel', 'Hardware', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">Info</p>
            <ul className="mt-4 flex flex-col gap-3">
              {['About', 'Shipping', 'Returns', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {'2026 GOOFY SHOP. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6">
            {/* Social icons as links */}
            {[
              { label: 'Instagram', href: '#' },
              { label: 'TikTok', href: '#' },
              { label: 'X', href: '#' },
              { label: 'YouTube', href: '#' },
            ].map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
