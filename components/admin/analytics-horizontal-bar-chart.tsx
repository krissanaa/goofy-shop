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

interface AnalyticsHorizontalBarChartDatum {
  label: string
  value: number
  color?: string
}

interface AnalyticsHorizontalBarChartProps {
  data: AnalyticsHorizontalBarChartDatum[]
  format?: "currency" | "number" | "percent"
  height?: number
}

function formatChartValue(value: number, format: AnalyticsHorizontalBarChartProps["format"]) {
  if (format === "currency") {
    return formatPrice(value)
  }

  if (format === "percent") {
    return `${value}%`
  }

  return value.toLocaleString("en-US")
}

export function AnalyticsHorizontalBarChart({
  data,
  format = "number",
  height,
}: AnalyticsHorizontalBarChartProps) {
  if (data.length === 0) {
    return <div className="page-sub">No data for this period.</div>
  }

  return (
    <div style={{ height: height ?? Math.max(260, data.length * 36) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
          <CartesianGrid horizontal={false} stroke="var(--border2)" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "DM Mono" }}
            tickFormatter={(value: number) => formatChartValue(value, format)}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "DM Mono" }}
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
          <Bar dataKey="value" radius={[0, 1, 1, 0]}>
            {data.map((entry, index) => (
              <Cell key={`${entry.label}-${index}`} fill={entry.color ?? "var(--gold)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
