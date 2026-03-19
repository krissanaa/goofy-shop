"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatPrice } from "@/lib/utils/format"

interface AnalyticsBarChartDatum {
  label: string
  value: number
  color?: string
}

interface AnalyticsBarChartProps {
  data: AnalyticsBarChartDatum[]
  format?: "currency" | "number" | "percent"
  height?: number
}

function formatChartValue(value: number, format: AnalyticsBarChartProps["format"]) {
  if (format === "currency") {
    return formatPrice(value)
  }

  if (format === "percent") {
    return `${value}%`
  }

  return value.toLocaleString("en-US")
}

export function AnalyticsBarChart({
  data,
  format = "number",
  height = 260,
}: AnalyticsBarChartProps) {
  if (data.length === 0) {
    return <div className="page-sub">No data for this period.</div>
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="var(--border2)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "DM Mono" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "DM Mono" }}
            tickFormatter={(value: number) => formatChartValue(value, format)}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
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
          <Bar dataKey="value" radius={[1, 1, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`${entry.label}-${index}`} fill={entry.color ?? "var(--gold)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
