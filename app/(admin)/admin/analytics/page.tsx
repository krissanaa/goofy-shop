import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AnalyticsBarChart } from "@/components/admin/analytics-bar-chart"
import { AnalyticsDonutChart } from "@/components/admin/analytics-donut-chart"
import { AnalyticsHorizontalBarChart } from "@/components/admin/analytics-horizontal-bar-chart"
import { DashboardRevenueChart } from "@/components/admin/dashboard-revenue-chart"
import {
  getAdminAnalyticsData,
  type AdminAnalyticsFilters,
  type AdminAnalyticsRange,
} from "@/lib/admin-analytics"
import { formatRevenue } from "@/lib/admin"

interface AdminAnalyticsPageProps {
  searchParams: Promise<{
    range?: string
    from?: string
    to?: string
  }>
}

const RANGE_TABS: Array<{ value: AdminAnalyticsRange; label: string }> = [
  { value: "TODAY", label: "Today" },
  { value: "7D", label: "7 Days" },
  { value: "30D", label: "30 Days" },
  { value: "90D", label: "90 Days" },
  { value: "CUSTOM", label: "Custom" },
]

function normalizeRange(value?: string): AdminAnalyticsRange {
  const normalized = (value ?? "30D").toUpperCase()

  if (
    normalized === "TODAY" ||
    normalized === "7D" ||
    normalized === "30D" ||
    normalized === "90D" ||
    normalized === "CUSTOM"
  ) {
    return normalized
  }

  return "30D"
}

function buildAnalyticsHref(
  filters: AdminAnalyticsFilters,
  overrides: Partial<AdminAnalyticsFilters> = {},
  basePath = "/admin/analytics",
) {
  const nextFilters = { ...filters, ...overrides }
  const query = new URLSearchParams()

  if (nextFilters.range !== "30D") {
    query.set("range", nextFilters.range)
  }

  if (nextFilters.range === "CUSTOM") {
    if (nextFilters.from) query.set("from", nextFilters.from)
    if (nextFilters.to) query.set("to", nextFilters.to)
  }

  const queryString = query.toString()
  return `${basePath}${queryString ? `?${queryString}` : ""}`
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const params = await searchParams
  const filters: AdminAnalyticsFilters = {
    range: normalizeRange(params.range),
    from: params.from?.trim() ?? "",
    to: params.to?.trim() ?? "",
  }

  const analytics = await getAdminAnalyticsData(filters)
  const revenueChartData = analytics.revenueSeries.map((entry) => ({
    label: entry.label,
    amount: entry.value,
  }))
  const ordersChartData = analytics.ordersSeries.map((entry) => ({
    label: entry.label,
    value: entry.value,
  }))
  const categoryChartData = analytics.revenueByCategory.map((entry) => ({
    label: entry.label,
    value: entry.value,
    color: entry.color,
  }))
  const ordersStatusData = analytics.ordersByStatus.map((entry) => ({
    label: entry.label,
    value: entry.value,
    color: entry.color,
  }))
  const topSellingChartData = analytics.topSellingProducts.map((product) => ({
    label: product.name.length > 16 ? `${product.name.slice(0, 16)}...` : product.name,
    value: product.quantity,
  }))
  const topRevenueChartData = analytics.topRevenueProducts.map((product) => ({
    label: product.name.length > 16 ? `${product.name.slice(0, 16)}...` : product.name,
    value: product.revenue,
  }))
  const citiesChartData = analytics.customerCities.map((entry) => ({
    label: entry.label.length > 14 ? `${entry.label.slice(0, 14)}...` : entry.label,
    value: entry.value,
  }))
  const notifyByDropChartData = analytics.notifySignupsByDrop.map((entry) => ({
    label: entry.name.length > 14 ? `${entry.name.slice(0, 14)}...` : entry.name,
    value: entry.value,
  }))
  const ordersByDropChartData = analytics.ordersByDrop.map((entry) => ({
    label: entry.name.length > 14 ? `${entry.name.slice(0, 14)}...` : entry.name,
    value: entry.value,
    color: "var(--info)",
  }))
  const revenueByDropChartData = analytics.revenueByDrop.map((entry) => ({
    label: entry.name.length > 14 ? `${entry.name.slice(0, 14)}...` : entry.name,
    value: entry.value,
    color: "var(--success)",
  }))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Analytics"
        subtitle={analytics.filters.label}
        actions={
          <Link
            href={buildAnalyticsHref(filters, {}, "/admin/analytics/export")}
            className="btn btn-primary inline-flex items-center justify-center"
          >
            Export CSV
          </Link>
        }
      />

      <div className="filter-bar">
        {RANGE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildAnalyticsHref(filters, {
              range: tab.value,
              from: tab.value === "CUSTOM" ? filters.from : "",
              to: tab.value === "CUSTOM" ? filters.to : "",
            })}
            className={`ftab ${filters.range === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filters.range === "CUSTOM" ? (
        <form className="filter-bar" action="/admin/analytics">
          <input type="hidden" name="range" value="CUSTOM" />
          <input className="fi" type="date" name="from" defaultValue={filters.from} style={{ width: 180 }} />
          <input className="fi" type="date" name="to" defaultValue={filters.to} style={{ width: 180 }} />
          <button type="submit" className="btn btn-primary">
            Apply Range
          </button>
        </form>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card c-gold">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatRevenue(analytics.summary.totalRevenue)}</div>
          <div className="stat-delta up">Paid orders only</div>
        </div>
        <div className="stat-card c-success">
          <div className="stat-label">Paid Orders</div>
          <div className="stat-value">{analytics.summary.paidOrders}</div>
          <div className="stat-delta up">{analytics.summary.totalOrders} placed in period</div>
        </div>
        <div className="stat-card c-warning">
          <div className="stat-label">AOV</div>
          <div className="stat-value">{formatRevenue(analytics.summary.averageOrderValue)}</div>
          <div className="stat-delta">Average paid order value</div>
        </div>
        <div className="stat-card c-danger">
          <div className="stat-label">Conversion</div>
          <div className="stat-value">{analytics.summary.conversionRate}%</div>
          <div className="stat-delta down">Placed vs paid orders</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue Trend</div>
          </div>
          <DashboardRevenueChart data={revenueChartData} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Category</div>
          </div>
          <div className="card-body">
            <AnalyticsDonutChart data={categoryChartData} format="currency" />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Orders by Day</div>
          </div>
          <div className="card-body">
            <AnalyticsBarChart data={ordersChartData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Orders by Status</div>
          </div>
          <div className="card-body">
            <div className="info-grid" style={{ marginBottom: 16 }}>
              <div>
                <div className="info-lbl">Orders Placed</div>
                <div className="info-val">{analytics.summary.totalOrders}</div>
              </div>
              <div>
                <div className="info-lbl">Paid Conversion</div>
                <div className="info-val">{analytics.summary.conversionRate}%</div>
              </div>
            </div>
            <AnalyticsDonutChart data={ordersStatusData} />
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 22, marginBottom: 16 }}>
        <div>
          <div className="page-eyebrow">Products</div>
          <div className="page-title" style={{ fontSize: 34 }}>
            Product Performance
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top 10 Selling Products</div>
          </div>
          <div className="card-body">
            <AnalyticsHorizontalBarChart data={topSellingChartData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top 10 by Revenue</div>
          </div>
          <div className="card-body">
            <AnalyticsHorizontalBarChart data={topRevenueChartData} format="currency" />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Low Stock List</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {analytics.lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="t-muted">
                    No low stock products in the current catalog.
                  </td>
                </tr>
              ) : (
                analytics.lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="t-main">{product.name}</td>
                    <td className="t-muted">{product.category}</td>
                    <td className={product.stock === 0 ? "stock-lo" : product.stock <= 2 ? "stock-md" : "stock-hi"}>
                      {product.stock === 0 ? "OUT" : product.stock}
                    </td>
                    <td className="t-muted">{product.lowStockThreshold ?? 3}</td>
                    <td>
                      <Link href={`/admin/products/${product.id}`} className="t-link">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Most Viewed</div>
          </div>
          <div className="card-body">
            <div className="page-sub">View tracking is not wired yet.</div>
            <div className="info-grid" style={{ marginTop: 16 }}>
              <div>
                <div className="info-lbl">Status</div>
                <div className="info-val">Placeholder</div>
              </div>
              <div>
                <div className="info-lbl">Next Step</div>
                <div className="info-val">Add storefront view events</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-eyebrow">Customers</div>
          <div className="page-title" style={{ fontSize: 34 }}>
            Customer Breakdown
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top 10 Customers by Spend</div>
            <Link href="/admin/customers" className="card-action">
              View All -{">"}
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="t-muted">
                    No customer spend data in this period.
                  </td>
                </tr>
              ) : (
                analytics.topCustomers.map((customer) => (
                  <tr key={customer.key}>
                    <td>
                      <div className="t-main">{customer.name}</div>
                      <div className="t-muted">{customer.phone}</div>
                    </td>
                    <td className="t-muted">{customer.city}</td>
                    <td>{customer.orderCount}</td>
                    <td>{formatRevenue(customer.totalSpent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-col">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Customer Summary</div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div>
                  <div className="info-lbl">New Customers</div>
                  <div className="info-val">{analytics.summary.newCustomers}</div>
                </div>
                <div>
                  <div className="info-lbl">Returning Customers</div>
                  <div className="info-val">{analytics.summary.returningCustomers}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Customer Cities</div>
            </div>
            <div className="card-body">
              <AnalyticsBarChart data={citiesChartData} />
            </div>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 22, marginBottom: 16 }}>
        <div>
          <div className="page-eyebrow">Drops</div>
          <div className="page-title" style={{ fontSize: 34 }}>
            Drop Performance
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Notify Signups per Drop</div>
          </div>
          <div className="card-body">
            <AnalyticsBarChart data={notifyByDropChartData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Orders per Drop</div>
          </div>
          <div className="card-body">
            <AnalyticsBarChart data={ordersByDropChartData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue per Drop</div>
          </div>
          <div className="card-body">
            <AnalyticsBarChart data={revenueByDropChartData} format="currency" />
          </div>
        </div>
      </div>
    </div>
  )
}
