"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface DashboardOrdersStatusChartProps {
  data: Array<{
    label: string
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }>
}

export function DashboardOrdersStatusChart({
  data,
}: DashboardOrdersStatusChartProps) {
  return (
    <div className="card-body">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              allowDecimals={false}
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
            />
            <Bar dataKey="pending" stackId="orders" fill="var(--warning)" radius={[1, 1, 0, 0]} />
            <Bar dataKey="processing" stackId="orders" fill="var(--info)" />
            <Bar dataKey="shipped" stackId="orders" fill="#a78bfa" />
            <Bar dataKey="delivered" stackId="orders" fill="var(--success)" />
            <Bar dataKey="cancelled" stackId="orders" fill="var(--danger)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
