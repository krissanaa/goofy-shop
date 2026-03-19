"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatPrice } from "@/lib/utils/format"

interface AnalyticsDonutChartDatum {
  label: string
  value: number
  color?: string
}

interface AnalyticsDonutChartProps {
  data: AnalyticsDonutChartDatum[]
  format?: "currency" | "number" | "percent"
  height?: number
}

function formatChartValue(value: number, format: AnalyticsDonutChartProps["format"]) {
  if (format === "currency") {
    return formatPrice(value)
  }

  if (format === "percent") {
    return `${value}%`
  }

  return value.toLocaleString("en-US")
}

export function AnalyticsDonutChart({
  data,
  format = "number",
  height = 220,
}: AnalyticsDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0 || total === 0) {
    return <div className="page-sub">No data for this period.</div>
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`${entry.label}-${index}`} fill={entry.color ?? "var(--gold)"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                fontFamily: "DM Mono",
                fontSize: 10,
                color: "var(--text)",
              }}
              formatter={(value: number) => formatChartValue(value, format)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        {data.map((entry) => {
          const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0

          return (
            <div key={entry.label} className="prog-row">
              <div className="prog-top">
                <span
                  className="prog-lbl"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: entry.color ?? "var(--gold)",
                      display: "inline-block",
                    }}
                  />
                  {entry.label}
                </span>
                <span className="prog-val">{formatChartValue(entry.value, format)}</span>
              </div>
              <div className="prog-bar">
                <div
                  className="prog-fill"
                  style={{
                    width: `${percent}%`,
                    background: entry.color ?? "var(--gold)",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
