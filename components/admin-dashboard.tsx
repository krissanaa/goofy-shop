"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3, 
  Home,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from "lucide-react"

interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/admin" },
  { icon: <Package className="h-5 w-5" />, label: "Products", href: "/admin/products", badge: "12" },
  { icon: <ShoppingCart className="h-5 w-5" />, label: "Orders", href: "/admin/orders", badge: "3" },
  { icon: <Users className="h-5 w-5" />, label: "Customers", href: "/admin/customers" },
  { icon: <BarChart3 className="h-5 w-5" />, label: "Analytics", href: "/admin/analytics" },
  { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/admin/settings" },
]

interface KpiCard {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
}

const kpiData: KpiCard[] = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+12.5%",
    trend: "up",
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    title: "Active Users",
    value: "8,549",
    change: "+23.1%",
    trend: "up",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-2.4%",
    trend: "down",
    icon: <TrendingUp className="h-5 w-5" />
  }
]

interface Order {
  id: string
  customer: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: string
  date: string
  items: number
}

const recentOrders: Order[] = [
  { id: "#12345", customer: "John Doe", status: "pending", total: "$89.99", date: "2024-01-15", items: 3 },
  { id: "#12346", customer: "Jane Smith", status: "processing", total: "$124.99", date: "2024-01-15", items: 5 },
  { id: "#12347", customer: "Bob Johnson", status: "shipped", total: "$45.99", date: "2024-01-14", items: 2 },
  { id: "#12348", customer: "Alice Brown", status: "delivered", total: "$234.99", date: "2024-01-14", items: 8 },
  { id: "#12349", customer: "Charlie Wilson", status: "cancelled", total: "$67.99", date: "2024-01-13", items: 4 }
]

interface Product {
  id: string
  name: string
  category: string
  price: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
}

const lowStockProducts: Product[] = [
  { id: "1", name: "Skateboard Deck - Pro Model", category: "Decks", price: "$89.99", stock: 2, status: "active" },
  { id: "2", name: "Bearings - Premium Set", category: "Hardware", price: "$34.99", stock: 0, status: "out_of_stock" },
  { id: "3", name: "Wheels - 54mm", category: "Wheels", price: "$24.99", stock: 5, status: "active" },
  { id: "4", name: "Trucks - 149mm", category: "Trucks", price: "$54.99", stock: 1, status: "active" }
]

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "mario-badge mario-badge-yellow"
      case "processing":
        return "mario-badge mario-badge-blue"
      case "shipped":
        return "mario-badge mario-badge-green"
      case "delivered":
        return "mario-badge mario-badge-green"
      case "cancelled":
        return "mario-badge mario-badge-red"
      case "active":
        return "mario-badge mario-badge-green"
      case "inactive":
        return "mario-badge mario-badge-blue"
      case "out_of_stock":
        return "mario-badge mario-badge-red"
      default:
        return "mario-badge mario-badge-blue"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin" className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tighter text-foreground">
                ADMIN
              </span>
              <span className="text-xl font-black text-primary">
                .
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card border-b">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <h1 className="text-lg font-black text-foreground">Dashboard</h1>
            
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border bg-blue-500 text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {kpiData.map((kpi, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 pixel-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {kpi.icon}
                  </div>
                  <span className={`text-xs font-black ${
                    kpi.trend === 'up' ? 'text-green-600' : 
                    kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-foreground mb-1">{kpi.value}</p>
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-lg border bg-card mb-8">
            <div className="border-b bg-muted p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="border-r px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                    <th className="border-r px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                    <th className="border-r px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="border-r px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Total</th>
                    <th className="border-r px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                    <th className="text-left">STATUS</th>
                    <th className="text-right">COINS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <p className="pixel-heading text-[0.32rem] text-black">{order.id}</p>
                        <p className="text-xs text-[#555]">{order.customer}</p>
                      </td>
                      <td>
                        <span className={getStatusColor(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="coin-badge">🪙 ${order.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
