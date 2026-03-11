"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface CategoryRowPanelItem {
  key: string
  title: string
  subtitle: string
  href: string
  imageUrl: string
  imageAlt: string
}

interface CategoryRowPanelProps {
  title: string
  items: CategoryRowPanelItem[]
}

const headingFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 900 as const,
}

const bodyFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const overlayTitleFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 800 as const,
  fontStyle: "italic" as const,
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
      className="relative overflow-hidden bg-[#F5EFE0] py-14 text-[#1A1614] md:py-16"
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
          <p
            className="text-[clamp(2rem,4.6vw,3.8rem)] uppercase tracking-[-0.04em] text-[#1A1614]"
            style={headingFontStyle}
          >
            {title.toUpperCase()}
          </p>
          <p
            className="mt-3 max-w-xl text-sm uppercase tracking-[0.14em] text-[#1A1614]/58"
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
                "group relative overflow-hidden border-[1.5px] border-black/10 bg-white transition-[transform,border-color,box-shadow,opacity] duration-500 ease-out",
                "hover:-translate-y-1 hover:border-[#F8B800] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
              style={{
                transitionDelay: `${(index % 4) * 100}ms`,
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p
                    className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#F8B800]"
                    style={bodyFontStyle}
                  >
                    {item.subtitle}
                  </p>
                  <p
                    className="text-[clamp(1rem,2vw,1.55rem)] uppercase leading-[0.92] text-white"
                    style={overlayTitleFontStyle}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
