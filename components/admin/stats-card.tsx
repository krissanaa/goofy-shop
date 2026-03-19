import type { ReactNode } from "react"

interface StatsCardProps {
  tone: "gold" | "success" | "warning" | "danger"
  label: string
  value: ReactNode
  delta?: ReactNode
  deltaTone?: "up" | "down"
}

export function StatsCard({
  tone,
  label,
  value,
  delta,
  deltaTone,
}: StatsCardProps) {
  return (
    <div className={`stat-card c-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta ? (
        <div className={`stat-delta ${deltaTone ?? ""}`.trim()}>{delta}</div>
      ) : null}
    </div>
  )
}
