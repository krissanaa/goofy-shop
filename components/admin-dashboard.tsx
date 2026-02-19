"use client"

import { useState } from "react"
import Link from "next/link"
import { products, recentOrders } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Archive,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Package, label: "Products" },
  { icon: Archive, label: "Inventory" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Users" },
  { icon: Settings, label: "Settings" },
]

const kpiData = [
  { label: "Revenue", value: "$24,891", change: "+12.5%", up: true, icon: TrendingUp },
  { label: "Orders", value: "342", change: "+8.2%", up: true, icon: ShoppingCart },
  { label: "Conversion", value: "3.24%", change: "-0.4%", up: false, icon: BarChart3 },
  { label: "AOV", value: "$72.80", change: "+5.1%", up: true, icon: TrendingUp },
]

function statusColor(status: string) {
  switch (status) {
    case "Shipped": return "bg-primary/20 text-primary"
    case "Pending": return "bg-foreground/10 text-foreground"
    case "Delivered": return "bg-foreground/10 text-muted-foreground"
    case "Cancelled": return "bg-destructive/20 text-destructive"
    default: return "bg-secondary text-secondary-foreground"
  }
}

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const lowStockProducts = products.filter((p) => p.stock <= 10 && !p.isSoldOut)
  const topProducts = [...products].sort((a, b) => b.price * (50 - b.stock) - a.price * (50 - a.stock)).slice(0, 5)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/" className="text-lg font-bold tracking-tighter text-foreground">
            GOOFY<span className="text-primary">.</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 px-3 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Button variant="outline" size="sm" className="w-full rounded-none text-xs font-bold uppercase tracking-widest" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to Store
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 rounded-none border-border bg-secondary pl-9 text-sm"
              />
            </div>
            <Select defaultValue="7d">
              <SelectTrigger className="w-36 rounded-none border-border text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            {/* Live visitors */}
            <div className="hidden items-center gap-2 rounded-sm bg-primary/10 px-3 py-1.5 lg:flex">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tabular-nums">127 live</span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {kpiData.map((kpi) => (
              <Card key={kpi.label} className="rounded-none border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      {kpi.label}
                    </p>
                    <kpi.icon className={`h-4 w-4 ${kpi.up ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground lg:text-3xl tabular-nums">
                    {kpi.value}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {kpi.up ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs font-bold tabular-nums ${kpi.up ? 'text-primary' : 'text-destructive'}`}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue chart placeholder + Low stock */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue chart area */}
            <Card className="rounded-none border-border bg-card lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Chart visualization */}
                <div className="flex h-64 items-end gap-2">
                  {[35, 55, 45, 70, 60, 85, 75, 90, 65, 80, 95, 88].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-primary/20 transition-all hover:bg-primary/40"
                        style={{ height: `${val}%` }}
                      >
                        <div
                          className="w-full rounded-sm bg-primary"
                          style={{ height: `${val * 0.6}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low stock alerts */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {lowStockProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">All stock levels healthy</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                        </div>
                        <Badge variant="outline" className="rounded-none border-primary/30 text-primary text-[10px] font-bold">
                          {p.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tables row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top selling products */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Price</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((p) => (
                      <TableRow key={p.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="text-sm font-bold text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold tabular-nums text-foreground">${p.price}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{p.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent orders */}
            <Card className="rounded-none border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="text-sm font-bold text-foreground">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.customer}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold tabular-nums text-foreground">${order.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
