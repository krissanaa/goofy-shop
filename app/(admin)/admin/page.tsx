import Link from "next/link"
import { AdminBadge } from "@/components/admin/admin-badge"
import { DashboardOrdersStatusChart } from "@/components/admin/dashboard-orders-status-chart"
import { DashboardRevenueChart } from "@/components/admin/dashboard-revenue-chart"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { getAdminDashboardData, type AdminDashboardActivityItem } from "@/lib/admin-data"
import { formatPrice } from "@/lib/utils/format"

function formatHeaderDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTableDate(value: string | null) {
  if (!value) {
    return "No date"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return "No time"
  }

  const parsed = new Date(value)
  const time = parsed.getTime()
  if (Number.isNaN(time)) {
    return value
  }

  const diffMs = Date.now() - time
  if (diffMs < 60_000) {
    return "Just now"
  }

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) {
    return `${minutes}min ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}hr ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}d ago`
  }

  return formatTableDate(value)
}

function formatCategoryLabel(value: string) {
  if (!value) {
    return "Unknown"
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getStatusTone(status: string) {
  switch (status) {
    case "FULFILLING":
      return "processing" as const
    case "SHIPPED":
      return "shipped" as const
    case "COMPLETED":
      return "delivered" as const
    case "CANCELED":
      return "cancelled" as const
    default:
      return "pending" as const
  }
}

function getPaymentTone(status: string) {
  return ["PAID", "SUCCEEDED", "SUCCESS"].includes(status.toUpperCase()) ? "paid" : "unpaid"
}

function getActivityTone(item: AdminDashboardActivityItem) {
  switch (item.tone) {
    case "processing":
      return "processing" as const
    case "active":
    case "paid":
      return "active" as const
    case "cancelled":
      return "cancelled" as const
    case "unpaid":
      return "unpaid" as const
    default:
      return "pending" as const
  }
}

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData()
  const today = new Date()

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle={formatHeaderDate(today)}
      />

      {dashboard.pendingOrders > 0 ? (
        <div className="alert alert-warning">
          <span>!</span>
          <span>
            {dashboard.pendingOrders} order{dashboard.pendingOrders === 1 ? "" : "s"} waiting for
            {" "}confirmation
          </span>
          <Link href="/admin/orders?status=PENDING">Review Now -{">"}</Link>
        </div>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card c-warning">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{dashboard.pendingOrders}</div>
          <div className="stat-delta">Needs action</div>
        </div>
        <div className="stat-card c-gold">
          <div className="stat-label">Revenue Paid</div>
          <div className="stat-value">{formatPrice(dashboard.revenue)}</div>
          <div className="stat-delta">Paid orders only</div>
        </div>
        <div className="stat-card c-success">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{dashboard.orders.length}</div>
          <div className="stat-delta">All order records</div>
        </div>
        <div className="stat-card c-danger">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value">{dashboard.lowStockCount}</div>
          <div className="stat-delta">Products {"<="} 3 left</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue // Last 30 Days</div>
          </div>
          <DashboardRevenueChart data={dashboard.revenueTimeline} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Orders // Last 7 Days</div>
          </div>
          <DashboardOrdersStatusChart data={dashboard.ordersStatusTimeline} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card c-gold">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{dashboard.quickStats.totalProducts}</div>
          <div className="stat-delta">Catalog items</div>
        </div>
        <div className="stat-card c-success">
          <div className="stat-label">Active Drops</div>
          <div className="stat-value">{dashboard.quickStats.activeDrops}</div>
          <div className="stat-delta">Live right now</div>
        </div>
        <div className="stat-card c-warning">
          <div className="stat-label">Published Posts</div>
          <div className="stat-value">{dashboard.quickStats.publishedPosts}</div>
          <div className="stat-delta">Editorial live</div>
        </div>
        <div className="stat-card c-danger">
          <div className="stat-label">Notify Signups</div>
          <div className="stat-value">{dashboard.quickStats.notifySignups}</div>
          <div className="stat-delta">Drop waitlist total</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
            <Link href="/admin/orders" className="card-action">
              View All -{">"}
            </Link>
          </div>
          {dashboard.recentOrders.length === 0 ? (
            <div className="card-body">
              <div className="page-title" style={{ fontSize: "34px" }}>
                No Orders Yet
              </div>
              <div className="page-sub">Orders will appear here once customers checkout.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="t-accent">{order.orderNumber}</td>
                    <td>
                      <div className="t-main">{order.customerName}</div>
                      <div className="t-muted">{formatTableDate(order.createdAt)}</div>
                    </td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <AdminBadge tone={getPaymentTone(order.paymentStatus)}>
                        {order.paymentStatus}
                      </AdminBadge>
                    </td>
                    <td>
                      <AdminBadge tone={getStatusTone(order.status)}>{order.status}</AdminBadge>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="t-link">
                        View -{">"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity Feed</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {dashboard.activityFeed.length === 0 ? (
              <div className="card-body">
                <div className="page-sub">No activity yet.</div>
              </div>
            ) : (
              dashboard.activityFeed.map((item) => (
                <div className="toggle-row" key={item.id}>
                  <div>
                    <div className="toggle-lbl">{item.label}</div>
                    <div className="toggle-sub">{item.detail}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <AdminBadge tone={getActivityTone(item)}>{item.tone}</AdminBadge>
                    <div className="toggle-sub">{formatRelativeTime(item.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Products</div>
            <Link href="/admin/products" className="card-action">
              View Products -{">"}
            </Link>
          </div>
          {dashboard.topProducts.length === 0 ? (
            <div className="card-body">
              <div className="page-sub">Top products will appear after sales come in.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Qty</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topProducts.map((product) => (
                  <tr key={product.key}>
                    <td className="t-main">{product.name}</td>
                    <td className="t-muted">{formatCategoryLabel(product.category)}</td>
                    <td>{product.orderCount}</td>
                    <td>{product.quantitySold}</td>
                    <td className="t-muted">{formatRelativeTime(product.lastOrderedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Categories</div>
          </div>
          <div className="card-body">
            {dashboard.topCategories.length === 0 ? (
              <div className="page-sub">Category performance will appear after orders are placed.</div>
            ) : (
              dashboard.topCategories.map((category) => (
                <div className="prog-row" key={category.category}>
                  <div className="prog-top">
                    <span className="prog-lbl">{formatCategoryLabel(category.category)}</span>
                    <span className="prog-val">{category.percent}%</span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: `${category.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
