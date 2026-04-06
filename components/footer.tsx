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

function FooterLink({ href, label, highlight = false }: { href: string; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
        highlight ? "text-[#F0B429]" : "text-white/78 hover:text-white"
      }`}
    >
      <span className="inline-block w-0 overflow-hidden text-[#F0B429] transition-all duration-300 group-hover:w-3">
        &gt;
      </span>
      <span>{label}</span>
    </Link>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string; highlight?: boolean }>
}) {
  return (
    <div className="space-y-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/48">{title}</p>
      <div className="grid gap-3">
        {links.map((item) => (
          <FooterLink key={`${title}-${item.label}`} href={item.href} label={item.label} highlight={item.highlight} />
        ))}
      </div>
    </div>
  )
}

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
    <footer className="relative overflow-hidden border-t border-white/6 bg-transparent text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:13px_13px]" />

      <div className="relative mx-auto max-w-[1480px] px-6 py-16 md:px-10 md:py-20">
        <div
          className={`grid gap-14 border-b border-white/6 pb-14 md:grid-cols-2 xl:grid-cols-5 ${
            showEmailSignup ? "2xl:grid-cols-6" : ""
          }`}
        >
          <div className="space-y-8 xl:col-span-2 2xl:col-span-2">
            <Link href="/" className="inline-flex items-end gap-1">
              <span
                className="text-[42px] font-black uppercase leading-none tracking-[-0.05em] text-white"
                style={{ fontFamily: "var(--font-ui-sans)" }}
              >
                {logo}
              </span>
              <span
                className="text-[42px] font-black leading-none tracking-[-0.05em] text-[#F0B429]"
                style={{ fontFamily: "var(--font-ui-sans)" }}
              >
                .
              </span>
            </Link>

            <p className="max-w-sm font-mono text-[10px] uppercase tracking-[0.18em] text-white/42">
              FIRST SKATE SHOP AND STREET CULTURE HUB IN LAOS.
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
                    className="social-icon group inline-flex h-11 w-11 items-center justify-center border border-white/12 text-white/48 transition-all duration-200 hover:border-[#F0B429] hover:text-[#F0B429] hover:shadow-[0_0_0_1px_rgba(240,180,41,0.18)]"
                  >
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </a>
                )
              })}
            </div>

            {showEmailSignup ? (
              <div className="max-w-sm space-y-4 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/56">
                  Newsletter
                </p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="YOUR EMAIL"
                    className="h-11 w-full border-0 border-b border-white/14 bg-transparent px-0 font-mono text-[11px] uppercase tracking-[0.22em] text-white placeholder:text-white/24 focus:border-b-[#F0B429] focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center bg-[#F0B429] px-6 py-3 text-sm font-black uppercase italic text-black transition-colors hover:bg-white"
                    style={{ fontFamily: "var(--font-ui-sans)" }}
                  >
                    Notify Me
                  </button>
                  {isSubscribed ? (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F0B429]">
                      You&apos;re on the list.
                    </p>
                  ) : null}
                </form>
              </div>
            ) : null}
          </div>

          <FooterColumn
            title="Shop"
            links={shopLinks.slice(0, 4).map((item) => ({
              ...item,
              highlight: item.label === "New Arrivals",
            }))}
          />

          <FooterColumn title="Community" links={communityLinks} />
          <FooterColumn title="About" links={aboutLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/24">
            <span>(C) 2026 GOOFY WORLD. ALL RIGHTS RESERVED.</span>
            <span className="inline-flex items-center gap-2 text-[#F0B429]">
              <span className="status-dot h-2 w-2 rounded-full bg-[#F0B429]" />
              LIVE_FROM_VIENTIANE
            </span>
          </div>

          <div className="flex flex-wrap gap-5">
            {["Privacy", "Terms", "Cookie Policy"].map((label) => (
              <FooterLink key={label} href="#" label={label} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .social-icon:hover svg {
          animation: footer-glitch 0.2s steps(2, end) 1;
        }

        .status-dot {
          animation: footer-status 1.8s ease-in-out infinite;
        }

        @keyframes footer-glitch {
          0% {
            transform: translate(0, 0);
          }
          20% {
            transform: translate(-1px, 1px);
          }
          40% {
            transform: translate(1px, -1px);
          }
          60% {
            transform: translate(-1px, -1px);
          }
          80% {
            transform: translate(1px, 1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes footer-status {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(240, 180, 41, 0.35);
          }
          50% {
            opacity: 0.35;
            box-shadow: 0 0 0 6px rgba(240, 180, 41, 0);
          }
        }
      `}</style>
    </footer>
  )
}
