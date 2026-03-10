"use client"

import Link from "next/link"
import { useState } from "react"
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react"
import { useGlobalConfig } from "@/components/global-config-provider"
import type { ComponentType, SVGProps } from "react"

const platformIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const config = useGlobalConfig()
  const showEmailSignup =
    !config.godMode.enabled || config.godMode.conversion.showEmailSignup

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div
          className={`grid gap-12 sm:grid-cols-2 ${
            showEmailSignup ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter text-foreground">
                {config.siteName.split(" ")[0] || "GOOFY"}
              </span>
              <span className="text-2xl font-black text-primary">.</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {config.siteDescription ||
                "Premium skate hardware & streetwear. Limited drops, zero compromises."}
            </p>
            <div className="flex gap-3">
              {config.footer.socialLinks.map((social) => {
                const Icon = platformIcons[social.platform]
                if (!Icon) return null
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Shop</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "All Products", href: "/products?filter=all" },
                { label: "New Arrivals", href: "/products?filter=new" },
                { label: "Drops", href: "/products?filter=drop" },
                { label: "Sale", href: "/products?filter=sale" },
                { label: "Hot", href: "/products?filter=hot" },
                { label: "Collab", href: "/products?filter=collab" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              {["Help Center", "Shipping", "Returns", "Size Guide"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {showEmailSignup ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Newsletter</h3>
              <p className="text-sm text-muted-foreground">
                Get exclusive drops and early access.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button type="submit" className="mario-btn mario-btn-red">
                    Subscribe
                  </button>
                </div>
                {isSubscribed ? (
                  <p className="text-xs font-medium text-primary">Thanks for subscribing!</p>
                ) : null}
              </form>
            </div>
          ) : null}
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {config.footer.copyrightText}
            </p>
            <div className="flex gap-6 text-xs">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
