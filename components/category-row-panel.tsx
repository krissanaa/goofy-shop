"use client"

import Image from "next/image"
import Link from "next/link"
import { type CSSProperties, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface CategoryRowPanelItem {
  key: string
  title: string
  subtitle: string
  href: string
  imageUrl: string
  imageAlt: string
  accentColor?: string
}

interface CategoryRowPanelProps {
  title: string
  items: CategoryRowPanelItem[]
}

const headingFontStyle = {
  fontFamily: "var(--font-barlow-condensed), var(--font-space-grotesk), sans-serif",
  fontWeight: 700 as const,
}

const bodyFontStyle = {
  fontFamily: "var(--font-barlow-condensed), var(--font-space-grotesk), sans-serif",
  fontWeight: 500 as const,
}

const overlayTitleFontStyle = {
  fontFamily: "var(--font-barlow-condensed), var(--font-space-grotesk), sans-serif",
  fontWeight: 700 as const,
}

export function CategoryRowPanel({ title, items }: CategoryRowPanelProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F7F7F5] py-14 text-[#111111] md:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div
          className={cn(
            "mb-8 transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="inline-flex items-center border-4 border-black bg-black px-4 py-2 shadow-[4px_4px_0_#FBD000]">
            <span
              className="text-xs font-bold uppercase tracking-[0.14em] text-[#FBD000]"
              style={bodyFontStyle}
            >
              * CATEGORY
            </span>
          </div>
          <p
            className="mt-5 text-[clamp(2rem,4.6vw,3.8rem)] uppercase tracking-[-0.04em] text-[#111111]"
            style={headingFontStyle}
          >
            {title.toUpperCase()}
          </p>
          <p
            className="mt-3 max-w-xl text-sm uppercase tracking-[0.14em] text-[#111111]/58"
            style={bodyFontStyle}
          >
            Built for street sessions, daily wear, and the next push through Laos.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {items.map((item, index) => (
            <Link
              key={`${item.key}-${item.href}`}
              href={item.href}
              className={cn(
                "group relative overflow-hidden border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow,opacity] duration-200 [will-change:transform]",
                "hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[4px_4px_0_var(--retro-accent),8px_8px_0_#002868]",
                "focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:scale-[1.015] focus-visible:outline-none focus-visible:shadow-[4px_4px_0_var(--retro-accent),8px_8px_0_#002868]",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{
                transitionDelay: `${(index % 4) * 100}ms`,
                ["--retro-accent" as const]: item.accentColor || "#FBD000",
              } as CSSProperties}
            >
              <div className="relative border-b-2 border-black bg-[#D9D9D9]">
                <div className="relative flex aspect-[4/4.2] items-center justify-center overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:12px_12px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                  />
                </div>
              </div>

              <div className="flex min-h-[74px] flex-col justify-center px-3 py-3">
                <p
                  className="line-clamp-1 text-[1.7rem] uppercase leading-[0.9] text-black transition-colors duration-200 group-hover:text-[var(--retro-accent)] group-focus-visible:text-[var(--retro-accent)]"
                  style={overlayTitleFontStyle}
                >
                  {item.title}
                </p>
                <p
                  className="mt-1 line-clamp-1 text-[10px] uppercase tracking-[0.12em]"
                  style={{ ...bodyFontStyle, color: item.accentColor || "#111111" }}
                >
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
