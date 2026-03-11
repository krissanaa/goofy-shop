import type { MarqueeTextData } from "@/lib/strapi-types"

interface DynamicMarqueeProps {
  data: MarqueeTextData
}

const fallbackItems = [
  "NEW DROP",
  "SS26 BRICK PACK",
  "FREE SHIPPING",
  "LAOS SKATE",
]

const marqueeFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

function normalizeItem(item: string): string {
  return item.replace(/^[*•\s]+/, "").trim()
}

export function DynamicMarquee({ data }: DynamicMarqueeProps) {
  const items =
    Array.isArray(data.items) && data.items.length > 0
      ? data.items.map(normalizeItem).filter((item) => item.length > 0)
      : fallbackItems
  const repeated = [...items, ...items, ...items, ...items]

  const speedClass =
    data.speed === "slow"
      ? "animate-marquee-slow"
      : data.speed === "fast"
        ? "animate-marquee-fast"
        : "animate-marquee"

  return (
    <div
      className="flex h-11 items-center overflow-hidden"
      style={{ backgroundColor: data.background_color || "#F8B800" }}
    >
      <div className={`flex ${speedClass} whitespace-nowrap`}>
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-7 text-xs uppercase tracking-[0.14em]"
            style={{ ...marqueeFontStyle, color: data.text_color || "#1A1614" }}
          >
            {`${item} •`}
          </span>
        ))}
      </div>
    </div>
  )
}
