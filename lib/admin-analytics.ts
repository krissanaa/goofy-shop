import "server-only"

import { type AdminOrder, type AdminProduct } from "@/lib/admin"
import { type AdminDrop } from "@/lib/admin-content"
import {
  getAdminDrops,
  getAdminNotifyEntries,
  getAdminOrders,
  getAdminProducts,
} from "@/lib/admin-data"

export type AdminAnalyticsRange = "TODAY" | "7D" | "30D" | "90D" | "CUSTOM"

export interface AdminAnalyticsFilters {
  range: AdminAnalyticsRange
  from?: string
  to?: string
}

export interface AdminAnalyticsChartDatum {
  label: string
  value: number
  color?: string
}

export interface AdminAnalyticsSeriesDatum {
  label: string
  date: string
  value: number
}

export interface AdminAnalyticsProductDatum {
  key: string
  name: string
  category: string
  quantity: number
  revenue: number
}

export interface AdminAnalyticsCustomerDatum {
  key: string
  name: string
  phone: string
  city: string
  orderCount: number
  totalSpent: number
}

export interface AdminAnalyticsDropDatum {
  id: string
  name: string
  slug: string
  value: number
}

export interface AdminAnalyticsData {
  filters: {
    range: AdminAnalyticsRange
    from: string
    to: string
    label: string
    days: number
  }
  summary: {
    totalRevenue: number
    paidOrders: number
    totalOrders: number
    averageOrderValue: number
    conversionRate: number
    newCustomers: number
    returningCustomers: number
  }
  revenueSeries: AdminAnalyticsSeriesDatum[]
  revenueByCategory: AdminAnalyticsChartDatum[]
  ordersSeries: AdminAnalyticsSeriesDatum[]
  ordersByStatus: AdminAnalyticsChartDatum[]
  topSellingProducts: AdminAnalyticsProductDatum[]
  topRevenueProducts: AdminAnalyticsProductDatum[]
  lowStockProducts: AdminProduct[]
  topCustomers: AdminAnalyticsCustomerDatum[]
  customerCities: AdminAnalyticsChartDatum[]
  notifySignupsByDrop: AdminAnalyticsDropDatum[]
  ordersByDrop: AdminAnalyticsDropDatum[]
  revenueByDrop: AdminAnalyticsDropDatum[]
}

type GenericRow = Record<string, unknown>

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--warning)",
  FULFILLING: "var(--info)",
  SHIPPED: "#a78bfa",
  COMPLETED: "var(--success)",
  CANCELED: "var(--danger)",
}

const CATEGORY_COLORS = [
  "var(--gold)",
  "var(--success)",
  "var(--info)",
  "#a78bfa",
  "var(--warning)",
  "var(--danger)",
]

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function pickString(row: GenericRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = asString(row[key])
    if (value) {
      return value
    }
  }

  return null
}

function isPaidPaymentStatus(status: string): boolean {
  return ["PAID", "SUCCEEDED", "SUCCESS"].includes(status.toUpperCase())
}

function buildCustomerKey(order: AdminOrder): string {
  return order.phone !== "No phone" ? order.phone : order.email
}

function parseDateInput(value?: string): Date | null {
  if (!value) {
    return null
  }

  const [year, month, day] = value.split("-").map((part) => Number(part))

  if (!year || !month || !day) {
    return null
  }

  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function startOfDay(value: Date): Date {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfDay(value: Date): Date {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date
}

function addDays(value: Date, amount: number): Date {
  const date = new Date(value)
  date.setDate(date.getDate() + amount)
  return date
}

function makeDayKey(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatRangeLabel(start: Date, end: Date, range: AdminAnalyticsRange) {
  if (range === "TODAY") {
    return "Today"
  }

  const startLabel = start.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })
  const endLabel = end.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return `${startLabel} - ${endLabel}`
}

function resolveAnalyticsWindow(filters: AdminAnalyticsFilters) {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  let range = filters.range
  let start = todayStart
  let end = todayEnd

  if (range === "TODAY") {
    start = todayStart
    end = todayEnd
  } else if (range === "7D") {
    start = addDays(todayStart, -6)
    end = todayEnd
  } else if (range === "30D") {
    start = addDays(todayStart, -29)
    end = todayEnd
  } else if (range === "90D") {
    start = addDays(todayStart, -89)
    end = todayEnd
  } else {
    const parsedFrom = parseDateInput(filters.from)
    const parsedTo = parseDateInput(filters.to)

    if (parsedFrom) {
      start = startOfDay(parsedFrom)
    } else if (parsedTo) {
      start = startOfDay(parsedTo)
    } else {
      range = "30D"
      start = addDays(todayStart, -29)
      end = todayEnd
    }

    if (parsedTo) {
      end = endOfDay(parsedTo)
    } else {
      end = todayEnd
    }
  }

  if (start.getTime() > end.getTime()) {
    const nextStart = startOfDay(end)
    const nextEnd = endOfDay(start)
    start = nextStart
    end = nextEnd
  }

  const days = Math.max(
    1,
    Math.round((endOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000) + 1,
  )

  return {
    range,
    start,
    end,
    days,
    label: formatRangeLabel(start, end, range),
    from: makeDayKey(start),
    to: makeDayKey(end),
  }
}

function isWithinWindow(value: string | null, start: Date, end: Date) {
  if (!value) {
    return false
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return parsed >= start && parsed <= end
}

function buildDailySeries(
  start: Date,
  days: number,
  formatter: (dayKey: string) => number,
): AdminAnalyticsSeriesDatum[] {
  return Array.from({ length: days }, (_, index) => {
    const current = addDays(start, index)
    const dayKey = makeDayKey(current)

    return {
      label:
        days <= 7
          ? current.toLocaleDateString("en-GB", { weekday: "short" })
          : current.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      date: dayKey,
      value: formatter(dayKey),
    }
  })
}

function buildProductMaps(products: AdminProduct[]) {
  return {
    byId: new Map(products.map((product) => [product.id, product])),
    bySlug: new Map(products.map((product) => [product.slug, product])),
    byName: new Map(products.map((product) => [product.name.toLowerCase(), product])),
  }
}

function extractOrderItemMetric(
  item: Record<string, unknown>,
  productMaps: ReturnType<typeof buildProductMaps>,
) {
  const nestedProduct =
    typeof item.product === "object" && item.product !== null
      ? (item.product as GenericRow)
      : null

  const directId = pickString(item, ["product_id", "productId"])
  const nestedId = nestedProduct ? pickString(nestedProduct, ["id"]) : null
  const directSlug = pickString(item, ["product_slug", "productSlug", "slug", "sku"])
  const nestedSlug = nestedProduct ? pickString(nestedProduct, ["slug", "sku"]) : null
  const directName =
    pickString(item, ["product_name", "productName", "name", "title", "variant_title"]) ??
    (nestedProduct ? pickString(nestedProduct, ["name", "title"]) : null) ??
    "Product"
  const quantity = Math.max(1, asNumber(item.quantity ?? item.qty ?? item.count) ?? 1)

  const product =
    (directId ? productMaps.byId.get(directId) : null) ??
    (nestedId ? productMaps.byId.get(nestedId) : null) ??
    (directSlug ? productMaps.bySlug.get(directSlug) : null) ??
    (nestedSlug ? productMaps.bySlug.get(nestedSlug) : null) ??
    productMaps.byName.get(directName.toLowerCase()) ??
    null

  const category =
    product?.category ??
    pickString(item, ["category"]) ??
    (nestedProduct ? pickString(nestedProduct, ["category"]) : null) ??
    "unknown"
  const key =
    product?.id ??
    directId ??
    nestedId ??
    directSlug ??
    nestedSlug ??
    directName.toLowerCase()
  const rawSubtotal =
    asNumber(
      item.subtotal ??
        item.line_total ??
        item.lineTotal ??
        item.total ??
        item.total_amount ??
        item.extended_price,
    ) ?? null
  const unitPrice =
    asNumber(item.price ?? item.unit_price ?? item.unitPrice ?? item.amount) ??
    (rawSubtotal !== null ? Math.round(rawSubtotal / quantity) : null) ??
    product?.price ??
    0
  const subtotal = rawSubtotal ?? unitPrice * quantity

  return {
    key,
    productId: product?.id ?? directId ?? nestedId ?? null,
    productSlug: product?.slug ?? directSlug ?? nestedSlug ?? null,
    name: product?.name ?? directName,
    category,
    quantity,
    subtotal,
  }
}

function sortChartData<T extends { value: number }>(rows: T[]) {
  return [...rows].sort((a, b) => b.value - a.value)
}

function buildDropProductIndex(drops: AdminDrop[]) {
  const index = new Map<string, string[]>()

  for (const drop of drops) {
    for (const productId of drop.productIds) {
      const existing = index.get(productId) ?? []
      existing.push(drop.id)
      index.set(productId, existing)
    }
  }

  return index
}

export async function getAdminAnalyticsData(filters: AdminAnalyticsFilters): Promise<AdminAnalyticsData> {
  const [orders, products, drops, notifyEntries] = await Promise.all([
    getAdminOrders(),
    getAdminProducts(),
    getAdminDrops(),
    getAdminNotifyEntries(),
  ])

  const window = resolveAnalyticsWindow(filters)
  const filteredOrders = orders.filter((order) => isWithinWindow(order.createdAt, window.start, window.end))
  const paidOrders = filteredOrders.filter((order) => isPaidPaymentStatus(order.paymentStatus))
  const productMaps = buildProductMaps(products)
  const dropProductIndex = buildDropProductIndex(drops)

  const revenueSeriesMap = new Map<string, number>()
  const ordersSeriesMap = new Map<string, number>()
  const revenueByCategoryMap = new Map<string, number>()
  const ordersByStatusMap = new Map<string, number>()
  const sellingProductsMap = new Map<string, AdminAnalyticsProductDatum>()
  const revenueProductsMap = new Map<string, AdminAnalyticsProductDatum>()
  const topCustomersMap = new Map<string, AdminAnalyticsCustomerDatum>()
  const customerCitiesMap = new Map<string, Set<string>>()
  const dropOrderCountMap = new Map<string, number>()
  const dropRevenueMap = new Map<string, number>()

  for (const order of filteredOrders) {
    const dayKey = order.createdAt ? order.createdAt.slice(0, 10) : ""
    if (dayKey) {
      ordersSeriesMap.set(dayKey, (ordersSeriesMap.get(dayKey) ?? 0) + 1)
    }

    ordersByStatusMap.set(order.status, (ordersByStatusMap.get(order.status) ?? 0) + 1)

    const customerKey = buildCustomerKey(order)
    const city = order.city || "Unknown"

    if (!customerCitiesMap.has(city)) {
      customerCitiesMap.set(city, new Set())
    }
    customerCitiesMap.get(city)?.add(customerKey)

    if (isPaidPaymentStatus(order.paymentStatus)) {
      if (dayKey) {
        revenueSeriesMap.set(dayKey, (revenueSeriesMap.get(dayKey) ?? 0) + order.total)
      }

      const existingCustomer = topCustomersMap.get(customerKey)
      if (!existingCustomer) {
        topCustomersMap.set(customerKey, {
          key: customerKey,
          name: order.customerName,
          phone: order.phone,
          city,
          orderCount: 1,
          totalSpent: order.total,
        })
      } else {
        existingCustomer.orderCount += 1
        existingCustomer.totalSpent += order.total
      }
    }

    const orderDropIds = new Set<string>()

    for (const rawItem of order.items) {
      const item = extractOrderItemMetric(rawItem, productMaps)
      const matchingDropIds = item.productId ? dropProductIndex.get(item.productId) ?? [] : []

      if (isPaidPaymentStatus(order.paymentStatus)) {
        revenueByCategoryMap.set(
          item.category,
          (revenueByCategoryMap.get(item.category) ?? 0) + item.subtotal,
        )

        const sellingProduct = sellingProductsMap.get(item.key)
        if (!sellingProduct) {
          sellingProductsMap.set(item.key, {
            key: item.key,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            revenue: item.subtotal,
          })
        } else {
          sellingProduct.quantity += item.quantity
          sellingProduct.revenue += item.subtotal
        }

        const revenueProduct = revenueProductsMap.get(item.key)
        if (!revenueProduct) {
          revenueProductsMap.set(item.key, {
            key: item.key,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            revenue: item.subtotal,
          })
        } else {
          revenueProduct.quantity += item.quantity
          revenueProduct.revenue += item.subtotal
        }
      }

      for (const dropId of matchingDropIds) {
        orderDropIds.add(dropId)

        if (isPaidPaymentStatus(order.paymentStatus)) {
          dropRevenueMap.set(dropId, (dropRevenueMap.get(dropId) ?? 0) + item.subtotal)
        }
      }
    }

    for (const dropId of orderDropIds) {
      dropOrderCountMap.set(dropId, (dropOrderCountMap.get(dropId) ?? 0) + 1)
    }
  }

  const revenueSeries = buildDailySeries(window.start, window.days, (dayKey) => revenueSeriesMap.get(dayKey) ?? 0)
  const ordersSeries = buildDailySeries(window.start, window.days, (dayKey) => ordersSeriesMap.get(dayKey) ?? 0)

  const revenueByCategory = sortChartData(
    Array.from(revenueByCategoryMap.entries()).map(([label, value], index) => ({
      label: label.toUpperCase(),
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })),
  )

  const ordersByStatus = sortChartData(
    Array.from(ordersByStatusMap.entries()).map(([label, value]) => ({
      label:
        label === "FULFILLING"
          ? "Processing"
          : label === "COMPLETED"
            ? "Delivered"
            : label === "CANCELED"
              ? "Cancelled"
              : label.charAt(0) + label.slice(1).toLowerCase(),
      value,
      color: STATUS_COLORS[label] ?? "var(--gold)",
    })),
  )

  const topSellingProducts = Array.from(sellingProductsMap.values())
    .sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity
      return b.revenue - a.revenue
    })
    .slice(0, 10)

  const topRevenueProducts = Array.from(revenueProductsMap.values())
    .sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue
      return b.quantity - a.quantity
    })
    .slice(0, 10)

  const lowStockProducts = products
    .filter((product) => product.active && product.stock <= (product.lowStockThreshold ?? 3))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)

  const allOrdersByCustomer = new Map<string, AdminOrder[]>()
  for (const order of orders) {
    const key = buildCustomerKey(order)
    const existing = allOrdersByCustomer.get(key) ?? []
    existing.push(order)
    allOrdersByCustomer.set(key, existing)
  }

  let newCustomers = 0
  let returningCustomers = 0

  for (const [customerKey, customerOrders] of allOrdersByCustomer.entries()) {
    const sortedOrders = [...customerOrders].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return aTime - bTime
    })

    const hasOrderInWindow = sortedOrders.some((order) =>
      isWithinWindow(order.createdAt, window.start, window.end),
    )

    if (!hasOrderInWindow) {
      continue
    }

    const firstOrder = sortedOrders[0]
    if (isWithinWindow(firstOrder.createdAt, window.start, window.end)) {
      newCustomers += 1
    } else if (customerKey) {
      returningCustomers += 1
    }
  }

  const topCustomers = Array.from(topCustomersMap.values())
    .sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent
      return b.orderCount - a.orderCount
    })
    .slice(0, 10)

  const customerCities = sortChartData(
    Array.from(customerCitiesMap.entries()).map(([label, customerKeys]) => ({
      label,
      value: customerKeys.size,
    })),
  ).slice(0, 10)

  const filteredNotifyEntries = notifyEntries.filter((entry) =>
    isWithinWindow(entry.createdAt, window.start, window.end),
  )

  const notifySignupsMap = new Map<string, number>()
  for (const entry of filteredNotifyEntries) {
    const key = entry.dropId ?? entry.dropTitle
    notifySignupsMap.set(key, (notifySignupsMap.get(key) ?? 0) + 1)
  }

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const paidOrdersCount = paidOrders.length
  const totalOrdersCount = filteredOrders.length

  const notifySignupsByDrop = sortChartData(
    drops.map((drop) => ({
      id: drop.id,
      slug: drop.slug,
      name: drop.title,
      value: notifySignupsMap.get(drop.id) ?? notifySignupsMap.get(drop.title) ?? 0,
    })),
  ).slice(0, 10)

  const ordersByDrop = sortChartData(
    drops.map((drop) => ({
      id: drop.id,
      slug: drop.slug,
      name: drop.title,
      value: dropOrderCountMap.get(drop.id) ?? 0,
    })),
  ).slice(0, 10)

  const revenueByDrop = sortChartData(
    drops.map((drop) => ({
      id: drop.id,
      slug: drop.slug,
      name: drop.title,
      value: dropRevenueMap.get(drop.id) ?? 0,
    })),
  ).slice(0, 10)

  return {
    filters: {
      range: window.range,
      from: window.from,
      to: window.to,
      label: window.label,
      days: window.days,
    },
    summary: {
      totalRevenue,
      paidOrders: paidOrdersCount,
      totalOrders: totalOrdersCount,
      averageOrderValue: paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0,
      conversionRate: totalOrdersCount > 0 ? Math.round((paidOrdersCount / totalOrdersCount) * 100) : 0,
      newCustomers,
      returningCustomers,
    },
    revenueSeries,
    revenueByCategory,
    ordersSeries,
    ordersByStatus,
    topSellingProducts,
    topRevenueProducts,
    lowStockProducts,
    topCustomers,
    customerCities,
    notifySignupsByDrop,
    ordersByDrop,
    revenueByDrop,
  }
}

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`
  }

  return value
}

export function serializeAnalyticsToCsv(data: AdminAnalyticsData): string {
  const rows: string[][] = []
  const pushSection = (title: string, header: string[], values: string[][]) => {
    rows.push([title])
    rows.push(header)
    rows.push(...values)
    rows.push([])
  }

  pushSection("Summary", ["Metric", "Value"], [
    ["Range", data.filters.label],
    ["Total Revenue", String(data.summary.totalRevenue)],
    ["Paid Orders", String(data.summary.paidOrders)],
    ["Total Orders", String(data.summary.totalOrders)],
    ["Average Order Value", String(data.summary.averageOrderValue)],
    ["Conversion Rate", `${data.summary.conversionRate}%`],
    ["New Customers", String(data.summary.newCustomers)],
    ["Returning Customers", String(data.summary.returningCustomers)],
  ])

  pushSection(
    "Revenue By Day",
    ["Date", "Revenue"],
    data.revenueSeries.map((row) => [row.date, String(row.value)]),
  )
  pushSection(
    "Revenue By Category",
    ["Category", "Revenue"],
    data.revenueByCategory.map((row) => [row.label, String(row.value)]),
  )
  pushSection(
    "Orders By Day",
    ["Date", "Orders"],
    data.ordersSeries.map((row) => [row.date, String(row.value)]),
  )
  pushSection(
    "Orders By Status",
    ["Status", "Count"],
    data.ordersByStatus.map((row) => [row.label, String(row.value)]),
  )
  pushSection(
    "Top Selling Products",
    ["Product", "Category", "Quantity", "Revenue"],
    data.topSellingProducts.map((row) => [
      row.name,
      row.category,
      String(row.quantity),
      String(row.revenue),
    ]),
  )
  pushSection(
    "Top Revenue Products",
    ["Product", "Category", "Quantity", "Revenue"],
    data.topRevenueProducts.map((row) => [
      row.name,
      row.category,
      String(row.quantity),
      String(row.revenue),
    ]),
  )
  pushSection(
    "Low Stock Products",
    ["Product", "Category", "Stock"],
    data.lowStockProducts.map((product) => [product.name, product.category, String(product.stock)]),
  )
  pushSection(
    "Top Customers",
    ["Customer", "Phone", "City", "Orders", "Total Spent"],
    data.topCustomers.map((customer) => [
      customer.name,
      customer.phone,
      customer.city,
      String(customer.orderCount),
      String(customer.totalSpent),
    ]),
  )
  pushSection(
    "Customer Cities",
    ["City", "Customers"],
    data.customerCities.map((row) => [row.label, String(row.value)]),
  )
  pushSection(
    "Notify Signups By Drop",
    ["Drop", "Signups"],
    data.notifySignupsByDrop.map((row) => [row.name, String(row.value)]),
  )
  pushSection(
    "Orders By Drop",
    ["Drop", "Orders"],
    data.ordersByDrop.map((row) => [row.name, String(row.value)]),
  )
  pushSection(
    "Revenue By Drop",
    ["Drop", "Revenue"],
    data.revenueByDrop.map((row) => [row.name, String(row.value)]),
  )

  return rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\n")
}
