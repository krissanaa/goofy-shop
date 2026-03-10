import Image from "next/image"
import Link from "next/link"
import type { RetroBannerData } from "@/lib/strapi-types"
import { getStrapiImageUrl } from "@/lib/strapi"

interface DynamicRetroBannerProps {
  data: RetroBannerData
}

const styleMap: Record<RetroBannerData["style"], { bg: string; text: string; border: string }> = {
  "mario-red": { bg: "#e52521", text: "#ffffff", border: "#a01816" },
  "luigi-green": { bg: "#43b047", text: "#ffffff", border: "#2d7a32" },
  "toad-blue": { bg: "#049cd8", text: "#ffffff", border: "#0370c8" },
  "wario-yellow": { bg: "#fbd000", text: "#1a1a2e", border: "#c9a600" },
}

const colorByName: Record<string, string> = {
  red: "#E70009",
  yellow: "#FBD000",
  blue: "#049CD8",
  green: "#43B047",
  orange: "#F97316",
  pink: "#EC4899",
  purple: "#7C3AED",
  black: "#0A0A0A",
  white: "#FFFFFF",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
}

function isValidHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim()
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return trimmed
}

function hexToRgb(hex: string): [number, number, number] | null {
  if (!isValidHexColor(hex)) return null
  const normalized = normalizeHex(hex).replace("#", "")
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  if ([r, g, b].some((value) => Number.isNaN(value))) return null
  return [r, g, b]
}

function getReadableTextColor(background: string): "#111111" | "#FFFFFF" {
  const rgb = hexToRgb(background)
  if (!rgb) return "#FFFFFF"
  const [r, g, b] = rgb
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.65 ? "#111111" : "#FFFFFF"
}

function darkenHex(hex: string, amount = 0.28): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#0A0A0A"
  const [r, g, b] = rgb
  const factor = Math.max(0, Math.min(1, 1 - amount))
  const toHex = (value: number) =>
    Math.round(value * factor)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function resolveBaseColor(data: RetroBannerData, fallbackColor: string): string {
  const colorCode = typeof data.color_code === "string" ? data.color_code.trim() : ""
  if (isValidHexColor(colorCode)) return normalizeHex(colorCode)

  const colorName =
    typeof data.color_name === "string" ? data.color_name.trim().toLowerCase() : ""
  if (colorName && colorByName[colorName]) return colorByName[colorName]

  return fallbackColor
}

export function DynamicRetroBanner({ data }: DynamicRetroBannerProps) {
  const presetColors = styleMap[data.style] || styleMap["mario-red"]
  const imageUrl = data.image ? getStrapiImageUrl(data.image, "large") : null
  const mode =
    data.banner_style === "original-picture" && imageUrl
      ? "original-picture"
      : "color-style"
  const baseColor = resolveBaseColor(data, presetColors.bg)
  const textColor = mode === "original-picture" ? "#FFFFFF" : getReadableTextColor(baseColor)
  const borderColor = mode === "original-picture" ? "#0A0A0A" : darkenHex(baseColor)
  const buttonBg = textColor
  const buttonText = mode === "original-picture" ? "#0A0A0A" : baseColor
  const imageWidth =
    typeof data.image?.width === "number" && data.image.width > 0 ? data.image.width : 1138
  const imageHeight =
    typeof data.image?.height === "number" && data.image.height > 0 ? data.image.height : 241
  const originalPictureAspectRatio = `${imageWidth} / ${imageHeight}`
  const content = (
    <>
      {data.title && (
        <h3
          className="text-3xl font-black tracking-tight md:text-4xl"
          style={{ color: textColor }}
        >
          {data.title}
        </h3>
      )}
      {data.subtitle && (
        <p className="max-w-lg text-sm opacity-90" style={{ color: textColor }}>
          {data.subtitle}
        </p>
      )}
      {data.cta_text && data.cta_link && (
        <Link
          href={data.cta_link}
          className="mario-btn mt-2"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
            borderColor: buttonBg,
          }}
        >
          {data.cta_text}
        </Link>
      )}
    </>
  )

  if (mode === "original-picture" && imageUrl) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div
          className="relative overflow-hidden rounded-lg border-[3px]"
          style={{
            backgroundColor: "#0A0A0A",
            borderColor,
          }}
        >
          <div className="relative w-full" style={{ aspectRatio: originalPictureAspectRatio }}>
            <Image
              src={imageUrl}
              alt={data.title || ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center md:px-12">
              {content}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div
        className="relative overflow-hidden rounded-lg border-[3px] p-8 md:p-12"
        style={{
          backgroundColor: mode === "original-picture" ? "#0A0A0A" : baseColor,
          borderColor,
        }}
      >
        {imageUrl && mode === "original-picture" ? (
          <>
            <div className="absolute inset-0">
              <Image src={imageUrl} alt={data.title || ""} fill className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/35" />
          </>
        ) : null}

        {imageUrl && mode === "color-style" ? (
          <div className="absolute inset-0 opacity-20">
            <Image src={imageUrl} alt={data.title || ""} fill className="object-cover" />
          </div>
        ) : null}

        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          {content}
        </div>
      </div>
    </section>
  )
}
