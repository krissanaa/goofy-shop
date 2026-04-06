"use client"

import { useMemo, useState } from "react"

export function TopMarquee({ text }: { text: string }) {
  const [isPaused, setIsPaused] = useState(false)
  const repeatedMarquee = useMemo(
    () => Array.from({ length: 3 }, () => text),
    [text],
  )

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-6 overflow-hidden bg-white/92 transition-colors duration-500 dark:bg-[var(--gold)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex min-w-max whitespace-nowrap"
        style={{
          animation: "goofy-marquee 24s linear infinite",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {repeatedMarquee.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="goofy-mono flex h-6 items-center px-5 text-[8px] uppercase tracking-[0.22em] text-black transition-colors duration-500 dark:text-[var(--black)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
