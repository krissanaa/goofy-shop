interface GlobalWatermarkProps {
  text?: string
}

export function GlobalWatermark({ text = "GOOFY" }: GlobalWatermarkProps) {
  const normalizedText = text.replace(/\s+/g, " ").trim().toUpperCase()
  const label =
    normalizedText.length > 96
      ? `${normalizedText.slice(0, 96).trim()}...`
      : normalizedText
  const glyph = normalizedText.length > 0 ? normalizedText[0] : "G"

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_62%,rgba(240,180,41,0.035),transparent_56%)]" />

      <div
        className="watermark-float absolute bottom-[-5%] right-[-1.5%] select-none leading-none tracking-[-0.04em] text-[rgba(245,239,224,0.055)]"
        style={{
          fontFamily: "'Barlow Condensed', var(--font-barlow-condensed), sans-serif",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: "clamp(96px, 18vw, 260px)",
          opacity: 0.35,
        }}
      >
        {glyph}
      </div>

      <div
        className="watermark-float absolute bottom-5 left-5 max-w-[min(92vw,960px)] select-none overflow-hidden text-ellipsis whitespace-nowrap text-[rgba(244,240,235,0.08)]"
        style={{
          fontFamily: "'DM Mono', var(--font-dm-mono), ui-monospace, monospace",
          fontSize: "clamp(9px, 0.82vw, 12px)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          animationDelay: "1.6s",
        }}
      >
        {label}
      </div>
    </div>
  )
}
