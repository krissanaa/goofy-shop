import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { OrdersDataTable } from "@/components/admin/orders-data-table"
import {
  filterOrders,
  type AdminOrderDateRange,
  type AdminOrderFilters,
} from "@/lib/admin"
import { getAdminOrders } from "@/lib/admin-data"

interface OrdersPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    payment?: string
    date?: string
    from?: string
    to?: string
  }>
}

const ORDER_TABS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "FULFILLING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Delivered" },
  { value: "CANCELED", label: "Cancelled" },
] as const

const PAYMENT_TABS = [
  { value: "ALL", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
] as const

const DATE_TABS = [
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "CUSTOM", label: "Custom" },
] as const

function buildOrdersHref(
  filters: AdminOrderFilters,
  overrides: Partial<AdminOrderFilters> = {},
  basePath = "/admin/orders",
) {
  const nextFilters = { ...filters, ...overrides }
  const query = new URLSearchParams()

  if (nextFilters.search) query.set("q", nextFilters.search)
  if (nextFilters.status && nextFilters.status !== "ALL") query.set("status", nextFilters.status)
  if (nextFilters.payment && nextFilters.payment !== "ALL") {
    query.set("payment", nextFilters.payment)
  }
  if (nextFilters.dateRange && nextFilters.dateRange !== "ALL") {
    query.set("date", nextFilters.dateRange)
  }
  if (nextFilters.from) query.set("from", nextFilters.from)
  if (nextFilters.to) query.set("to", nextFilters.to)

  const queryString = query.toString()
  return `${basePath}${queryString ? `?${queryString}` : ""}`
}

function normalizeDateRange(value: string | undefined): AdminOrderDateRange {
  const normalized = (value ?? "ALL").toUpperCase()

  if (
    normalized === "TODAY" ||
    normalized === "THIS_WEEK" ||
    normalized === "THIS_MONTH" ||
    normalized === "CUSTOM"
  ) {
    return normalized
  }

  return "ALL"
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const filters: AdminOrderFilters = {
    search: params.q?.trim() ?? "",
    status: (params.status ?? "ALL").toUpperCase(),
    payment: (params.payment ?? "ALL").toUpperCase(),
    dateRange: normalizeDateRange(params.date),
    from: params.from?.trim() ?? "",
    to: params.to?.trim() ?? "",
  }

  const allOrders = await getAdminOrders()
  const orders = filterOrders(allOrders, filters)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Orders"
        subtitle={`${orders.length} filtered / ${allOrders.length} total`}
        actions={
          <Link
            href={buildOrdersHref(filters, {}, "/admin/orders/export")}
            className="btn btn-primary inline-flex items-center justify-center"
          >
            Export CSV
          </Link>
        }
      />

      <div className="filter-bar">
        {ORDER_TABS.map((tab) => {
          const count = filterOrders(allOrders, { ...filters, status: tab.value }).length

          return (
            <Link
              key={tab.value}
              href={buildOrdersHref(filters, { status: tab.value })}
              className={`ftab ${filters.status === tab.value ? "active" : ""}`}
            >
              {tab.label} ({count})
            </Link>
          )
        })}

        {PAYMENT_TABS.map((tab) => {
          const count = filterOrders(allOrders, { ...filters, payment: tab.value }).length

          return (
            <Link
              key={tab.value}
              href={buildOrdersHref(filters, { payment: tab.value })}
              className={`ftab ${filters.payment === tab.value ? "active" : ""}`}
            >
              {tab.label} ({count})
            </Link>
          )
        })}

        {DATE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildOrdersHref(filters, {
              dateRange: tab.value as AdminOrderDateRange,
              from: tab.value === "CUSTOM" ? filters.from : "",
              to: tab.value === "CUSTOM" ? filters.to : "",
            })}
            className={`ftab ${filters.dateRange === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}

        <form className="ml-auto">
          {filters.status !== "ALL" ? <input type="hidden" name="status" value={filters.status} /> : null}
          {filters.payment !== "ALL" ? (
            <input type="hidden" name="payment" value={filters.payment} />
          ) : null}
          {filters.dateRange !== "ALL" ? (
            <input type="hidden" name="date" value={filters.dateRange} />
          ) : null}
          {filters.from ? <input type="hidden" name="from" value={filters.from} /> : null}
          {filters.to ? <input type="hidden" name="to" value={filters.to} /> : null}
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={filters.search}
            placeholder="Search order #, customer, or phone..."
          />
        </form>
      </div>

      {filters.dateRange === "CUSTOM" ? (
        <form className="filter-bar" action="/admin/orders">
          {filters.search ? <input type="hidden" name="q" value={filters.search} /> : null}
          {filters.status !== "ALL" ? <input type="hidden" name="status" value={filters.status} /> : null}
          {filters.payment !== "ALL" ? (
            <input type="hidden" name="payment" value={filters.payment} />
          ) : null}
          <input type="hidden" name="date" value="CUSTOM" />

          <input className="fi" type="date" name="from" defaultValue={filters.from} style={{ width: 180 }} />
          <input className="fi" type="date" name="to" defaultValue={filters.to} style={{ width: 180 }} />
          <button type="submit" className="btn btn-primary">
            Apply Range
          </button>
        </form>
      ) : null}

      <div className="card">
        {orders.length === 0 ? (
          <div className="card-body">
            <div className="page-title" style={{ fontSize: "34px" }}>
              No Orders
            </div>
            <div className="page-sub">Try another status, payment, date, or search filter.</div>
          </div>
        ) : (
          <OrdersDataTable
            orders={orders}
            exportParams={{
              q: filters.search,
              status: filters.status,
              payment: filters.payment,
              date: filters.dateRange,
              from: filters.from,
              to: filters.to,
            }}
          />
        )}
      </div>
    </div>
  )
}
