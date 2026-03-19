"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Newspaper,
  Settings2,
  PanelsTopLeft,
  Zap,
  Bell,
  BarChart3,
  Boxes,
  Users,
  TicketPercent,
  MapPinned,
  Clapperboard,
  Star,
  ListChecks,
} from "lucide-react"
import { logoutAction } from "@/app/(admin)/admin/actions"
import { ThemeToggle } from "@/components/admin/theme-toggle"

interface AdminShellProps {
  userEmail: string
  pendingOrders?: number
  children: React.ReactNode
}

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Ecommerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badgeKey: "pendingOrders" },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: TicketPercent },
    ],
  },
  {
    label: "Drops",
    items: [
      { href: "/admin/drops", label: "Drops", icon: Zap },
      { href: "/admin/notify", label: "Notify List", icon: ListChecks },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/parks", label: "Parks", icon: MapPinned },
      { href: "/admin/videos", label: "Videos", icon: Clapperboard },
      { href: "/admin/banners", label: "Banners", icon: PanelsTopLeft },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings2 }],
  },
] as const

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard"
  if (pathname === "/admin/analytics") return "Analytics"
  if (pathname.startsWith("/admin/orders/")) return "Order Detail"
  if (pathname === "/admin/orders") return "Orders"
  if (pathname === "/admin/products/new") return "Add Product"
  if (pathname.startsWith("/admin/products/")) return "Edit Product"
  if (pathname === "/admin/products") return "Products"
  if (pathname === "/admin/inventory") return "Inventory"
  if (pathname.startsWith("/admin/customers/")) return "Customer Detail"
  if (pathname === "/admin/customers") return "Customers"
  if (pathname === "/admin/discounts") return "Discounts"
  if (pathname === "/admin/notify") return "Notify List"
  if (pathname === "/admin/drops/new") return "Create Drop"
  if (pathname.startsWith("/admin/drops/")) return "Edit Drop"
  if (pathname === "/admin/drops") return "Drops"
  if (pathname === "/admin/posts/new") return "Create Post"
  if (pathname.startsWith("/admin/posts/")) return "Edit Post"
  if (pathname === "/admin/posts") return "Posts"
  if (pathname === "/admin/parks") return "Parks"
  if (pathname === "/admin/videos") return "Videos"
  if (pathname === "/admin/banners") return "Hero Banners"
  if (pathname === "/admin/reviews") return "Reviews"
  if (pathname === "/admin/settings") return "Settings"
  return "Admin"
}

function getInitials(email: string): string {
  const [first = "A", second = "D"] = email.toUpperCase().replace(/[^A-Z0-9]/g, "").split("")
  return `${first}${second}`
}

export function AdminShell({
  userEmail,
  pendingOrders = 0,
  children,
}: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="admin-root">
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sidebar-logo">
          <div>
            <Link href="/admin" className="logo-text">
              GOOFY.
            </Link>
            <span className="logo-badge">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="grid h-8 w-8 place-items-center border border-[var(--border)] text-[var(--text2)] lg:hidden"
              aria-label="Close admin menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label} className="nav-section">
              <p className="nav-label">
                {section.label}
              </p>

              <div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.href === "/admin"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const badge =
                    item.badgeKey === "pendingOrders" && pendingOrders > 0
                      ? pendingOrders
                      : null

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${active ? "active" : ""}`}
                    >
                      <Icon className="nav-icon" strokeWidth={1.5} />
                      <span>
                        {item.label}
                      </span>
                      {badge ? (
                        <span className="nav-badge">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-row">
            <div className="user-avatar">
              {getInitials(userEmail)}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="user-name">
                {userEmail}
              </p>
              <p className="user-role">
                Super Admin
              </p>
            </div>
          </div>

          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="btn w-full justify-start gap-3"
            >
              <LogOut className="h-4 w-4" />
              <span>
                Sign Out
              </span>
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close admin sidebar"
        />
      ) : null}

      <div className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-8 w-8 place-items-center border border-[var(--border)] text-[var(--text2)] lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <p className="breadcrumb">
              GOOFY. / <span className="text-[var(--admin-accent)]">{pageTitle}</span>
            </p>
          </div>

          <div className="topbar-right">
            <Link href="/admin/orders?status=PENDING" className="btn relative px-3" aria-label="Pending orders">
              <Bell className="h-4 w-4" />
              {pendingOrders > 0 ? <span className="nav-badge">{pendingOrders}</span> : null}
            </Link>
            <ThemeToggle compact />
            <div className="user-row">
              <div className="user-avatar">
                {getInitials(userEmail)}
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
