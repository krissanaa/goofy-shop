"use client"

import { useMemo, useState } from "react"
import styles from "./sponsor-logo-strip.module.css"

export interface SponsorBrand {
  name: string
  url?: string
  logo?: string
  logoUrl?: string
}

interface SponsorLogoStripProps {
  brands: SponsorBrand[]
  title?: string
}

interface PreparedBrand {
  key: string
  name: string
  href: string
  primaryLogo: string
  secondaryLogo: string
  tertiaryLogo: string
}

function normalizeHref(url: string | undefined): string {
  if (!url || !url.trim()) return "#"
  return url.trim()
}

function deriveLogoFromUrl(url: string): string | null {
  if (!url || url === "#") return null

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    if (!hostname) return null
    return `https://logo.clearbit.com/${hostname}`
  } catch {
    return null
  }
}

function deriveFaviconFromUrl(url: string): string | null {
  if (!url || url === "#") return null

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    if (!hostname) return null
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(hostname)}`
  } catch {
    return null
  }
}

function deriveNameAvatar(name: string): string {
  const safeName = encodeURIComponent(name.trim() || "Brand")
  return `https://ui-avatars.com/api/?name=${safeName}&background=ffffff&color=111111&format=png&size=128&bold=true`
}

function prepareBrands(brands: SponsorBrand[]): PreparedBrand[] {
  return brands.map((brand, index) => {
    const explicitLogo = typeof brand.logoUrl === "string"
      ? brand.logoUrl.trim()
      : typeof brand.logo === "string"
        ? brand.logo.trim()
        : ""
    const href = normalizeHref(brand.url)
    const derivedLogo = deriveLogoFromUrl(href) || ""
    const secondaryLogo = deriveFaviconFromUrl(href) || ""

    return {
      key: `${brand.name}-${index}`,
      name: brand.name,
      href,
      primaryLogo: explicitLogo || derivedLogo,
      secondaryLogo,
      tertiaryLogo: deriveNameAvatar(brand.name),
    }
  })
}

function getLogoForStage(brand: PreparedBrand, stage: number): string {
  if (stage <= 0) {
    return brand.primaryLogo || brand.secondaryLogo || brand.tertiaryLogo
  }

  if (stage === 1) {
    return brand.secondaryLogo || brand.tertiaryLogo
  }

  return brand.tertiaryLogo
}

export function SponsorLogoStrip({
  brands,
  title = "* TRUSTED BY THE CULTURE *",
}: SponsorLogoStripProps) {
  const [errorStageByKey, setErrorStageByKey] = useState<Record<string, number>>({})

  const prepared = useMemo(() => prepareBrands(brands), [brands])
  const laneItems = useMemo(() => {
    if (prepared.length === 0) return []
    const minItemsPerLane = 12
    const repeats = Math.max(2, Math.ceil(minItemsPerLane / prepared.length))
    return Array.from({ length: repeats }).flatMap((_, repeatIndex) =>
      prepared.map((brand) => ({
        ...brand,
        renderKey: `${brand.key}-r${repeatIndex}`,
      })),
    )
  }, [prepared])

  if (prepared.length === 0) {
    return null
  }

  const renderLane = (laneKey: string) =>
    laneItems.map((brand, loopIndex) => {
      const key = `${brand.renderKey}-${laneKey}-${loopIndex}`
      const isExternal = brand.href !== "#"
      const errorStage = errorStageByKey[brand.key] ?? 0
      const imageSrc = getLogoForStage(brand, errorStage)
      const logoNode = (
        <img
          src={imageSrc}
          alt={`${brand.name} logo`}
          className={styles.logoImage}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setErrorStageByKey((current) => ({
              ...current,
              [brand.key]: Math.min((current[brand.key] ?? 0) + 1, 3),
            }))
          }}
        />
      )

      if (!isExternal) {
        return (
          <div key={key} className={styles.logoItem}>
            {logoNode}
          </div>
        )
      }

      return (
        <a
          key={key}
          href={brand.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.logoItem}
          aria-label={brand.name}
        >
          {logoNode}
        </a>
      )
    })

  return (
    <div className={styles.brandSection}>
      <div className={styles.brandLabelWrap}>
        <div className={styles.brandLabel}>{title}</div>
        <div className="menu-color-line" />
      </div>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {renderLane("a")}
        </div>
        <div className={`${styles.marqueeTrack} ${styles.trackOffset}`}>
          {renderLane("b")}
        </div>
      </div>

      <div className={styles.skatepark}>
        <div className={styles.rail} />
        <div className={styles.railBolts}>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={`bolt-${index}`} className={styles.bolt} />
          ))}
        </div>
        <div className={styles.bricks}>
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={`brick-${index}`} className={styles.brick} />
          ))}
        </div>
      </div>
    </div>
  )
}
