"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatPrice } from "@/lib/utils/format"

interface DashboardRevenueChartProps {
  data: Array<{
    label: string
    amount: number
    highlight?: boolean
  }>
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
  return (
    <div className="card-body">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--border2)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "DM Mono" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "DM Mono" }}
              tickFormatter={(value: number) => value.toLocaleString("en-US")}
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
              formatter={(value: number) => formatPrice(value)}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="var(--gold)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--gold)", stroke: "var(--surface)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
