import type { MarqueeTextData } from "@/lib/strapi-types"

interface DynamicMarqueeProps {
  data: MarqueeTextData
}

export function DynamicMarquee({ data }: DynamicMarqueeProps) {
  const items = Array.isArray(data.items) ? data.items : []
  const repeated = [...items, ...items, ...items, ...items]

  const speedClass =
    data.speed === "slow"
      ? "animate-marquee-slow"
      : data.speed === "fast"
        ? "animate-marquee-fast"
        : "animate-marquee"

  return (
    <div
      className="flex h-10 items-center overflow-hidden"
      style={{ backgroundColor: data.background_color }}
    >
      <div className={`flex ${speedClass} whitespace-nowrap`}>
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-8 text-xs font-black uppercase tracking-wider"
            style={{ color: data.text_color }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
