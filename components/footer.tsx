"use client"

import type { ComponentType, FormEvent, SVGProps } from "react"
import Link from "next/link"
import { useState } from "react"
import { Instagram, Twitter, Youtube } from "lucide-react"
import { useGlobalConfig } from "@/components/global-config-provider"

function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.2 3c.2 1.8 1.2 3.4 2.7 4.4 1 .7 2.2 1 3.4 1v3.2c-1.5 0-2.9-.3-4.2-.9v5.5c0 1.5-.5 2.9-1.5 4-1.2 1.3-2.9 1.9-4.7 1.8-1.3-.1-2.6-.6-3.6-1.5A6.22 6.22 0 0 1 4 15.9c0-3.3 2.6-6 5.8-6.2.4 0 .8 0 1.2.1v3.2c-.4-.1-.8-.2-1.2-.1-1.4.1-2.6 1.3-2.6 2.8 0 .8.3 1.6.9 2.1.5.5 1.1.7 1.8.8 1.7.1 3.1-1.2 3.1-2.9V3h3.2Z" />
    </svg>
  )
}

const platformIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: TiktokIcon,
}

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?badge=NEW" },
  { label: "Drops", href: "/drops" },
  { label: "Sale", href: "/shop?badge=SALE" },
  { label: "Hot", href: "/shop?badge=HOT" },
  { label: "Collab", href: "/shop?badge=COLLAB" },
]

const communityLinks = [
  { label: "News & Events", href: "/news" },
  { label: "Skate Videos", href: "/videos" },
  { label: "Skate Parks", href: "/parks" },
]

const aboutLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Contact Us", href: "/about#contact" },
  { label: "Careers", href: "/about#careers" },
]

const supportLinks = [
  { label: "Help Center", href: "#" },
  { label: "Shipping", href: "#" },
  { label: "Returns", href: "#" },
  { label: "Size Guide", href: "#" },
  { label: "Track Order", href: "/orders/track" },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const config = useGlobalConfig()
  const showEmailSignup =
    !config.godMode.enabled || config.godMode.conversion.showEmailSignup

  const socialLinkMap = new Map(
    config.footer.socialLinks.map((social) => [social.platform, social.url]),
  )

  const socialLinks = [
    {
      platform: "instagram",
      label: "Instagram",
      href: socialLinkMap.get("instagram") || "#",
    },
    {
      platform: "twitter",
      label: "Twitter",
      href: socialLinkMap.get("twitter") || "#",
    },
    {
      platform: "youtube",
      label: "YouTube",
      href: socialLinkMap.get("youtube") || "#",
    },
    {
      platform: "tiktok",
      label: "TikTok",
      href: socialLinkMap.get("tiktok") || "#",
    },
  ]

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  const logo = (config.siteName.split(" ")[0] || "GOOFY").toUpperCase()

  return (
    <footer className="border-t border-[var(--bordw)] bg-[#050505] text-[var(--white)]">
      <div className="mx-auto max-w-[1480px] px-6 py-16 md:px-10">
        <div
          className={`grid gap-12 md:grid-cols-2 xl:grid-cols-5 ${
            showEmailSignup ? "2xl:grid-cols-6" : ""
          }`}
        >
          <div className="space-y-5 xl:col-span-2 2xl:col-span-2">
            <Link href="/" className="inline-flex items-end gap-1">
              <span className="goofy-display text-[40px] leading-none tracking-[-0.05em] text-[var(--white)]">
                {logo}
              </span>
              <span className="goofy-display text-[40px] leading-none tracking-[-0.05em] text-[var(--gold)]">
                .
              </span>
            </Link>

            <p className="goofy-mono max-w-md text-[10px] uppercase tracking-[0.18em] text-white/42">
              First skate shop and street culture hub in Laos. Built in Vientiane
              for decks, drops, community, and movement.
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = platformIcons[social.platform]
                if (!Icon) return null

                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="goofy-mono inline-flex h-10 w-10 items-center justify-center border border-[var(--bordw)] text-white/42 transition-colors hover:text-[var(--white)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gray)]">
              Shop
            </p>
            <div className="grid gap-3">
              {shopLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-[var(--white)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gray)]">
              Community
            </p>
            <div className="grid gap-3">
              {communityLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-[var(--white)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gray)]">
              About
            </p>
            <div className="grid gap-3">
              {aboutLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-[var(--white)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gray)]">
              Support
            </p>
            <div className="grid gap-3">
              {supportLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-[var(--white)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {showEmailSignup ? (
            <div className="space-y-4">
              <p className="goofy-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gray)]">
                Newsletter
              </p>
              <p className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-white/42">
                Early drop access, event alerts, and stories from the streets.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email"
                  className="goofy-mono h-11 w-full border border-[var(--bordw)] bg-transparent px-4 text-[10px] uppercase tracking-[0.18em] text-[var(--white)] placeholder:text-white/24 focus:border-[var(--gold)] focus:outline-none"
                  required
                />
                <button type="submit" className="goofy-btn goofy-btn-gold w-full">
                  Notify Me
                </button>
                {isSubscribed ? (
                  <p className="goofy-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                    You&rsquo;re on the list.
                  </p>
                ) : null}
              </form>
            </div>
          ) : null}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[var(--bordw)] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
            (c) 2026 Goofy World. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            {["Privacy", "Terms", "Cookie Policy"].map((label) => (
              <Link
                key={label}
                href="#"
                className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-[var(--white)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
