import { formatPrice } from "@/lib/utils/format"

export const ADMIN_ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
] as const

export const ADMIN_PRODUCT_CATEGORIES = [
  "deck",
  "wheel",
  "truck",
  "bearing",
  "shoe",
  "apparel",
] as const

export const ADMIN_PRODUCT_BADGES = ["NEW", "HOT", "SALE", "COLLAB"] as const

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number]
export type AdminProductCategory = (typeof ADMIN_PRODUCT_CATEGORIES)[number]
export type AdminProductBadge = (typeof ADMIN_PRODUCT_BADGES)[number]
export type AdminOrderDateRange =
  | "ALL"
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "CUSTOM"
export type AdminProductSort = "NEWEST" | "NAME" | "PRICE" | "STOCK"
export type AdminProductActiveState = "ALL" | "ACTIVE" | "INACTIVE"

export type AdminActionState = {
  status: "idle" | "success" | "error"
  message?: string
  redirectTo?: string
  fieldErrors?: Record<string, string>
}

export const INITIAL_ACTION_STATE: AdminActionState = {
  status: "idle",
}

type GenericRow = Record<string, unknown>

export interface AdminOrder {
  id: string
  orderNumber: string
  status: AdminOrderStatus
  paymentStatus: string
  customerName: string
  email: string
  phone: string
  total: number
  itemCount: number
  createdAt: string | null
  slipUrl: string | null
  paymentMethod: string | null
  notes: string | null
  internalNote: string | null
  address: string | null
  city: string | null
  trackingNumber: string | null
  carrier: string | null
  subtotal: number
  shippingTotal: number
  discountTotal: number
  updatedAt: string | null
  items: Array<Record<string, unknown>>
  raw: GenericRow
}

export interface AdminProduct {
  id: string
  slug: string
  name: string
  price: number
  comparePrice: number | null
  images: string[]
  category: string
  brand: string
  badge: string | null
  stock: number
  sku: string | null
  lowStockThreshold: number | null
  description: string
  specs: Record<string, unknown> | null
  metaTitle: string | null
  metaDescription: string | null
  active: boolean
  createdAt: string | null
  updatedAt: string | null
  raw: GenericRow
}

export interface AdminProductFilters {
  search: string
  category: string
  brand: string
  badge: string
  activeState: AdminProductActiveState
  sort: AdminProductSort
}

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

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    return value === "true" || value === "1" || value.toLowerCase() === "active"
  }

  if (typeof value === "number") {
    return value > 0
  }

  return false
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
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

function pickNumber(row: GenericRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = asNumber(row[key])
    if (value !== null) {
      return value
    }
  }

  return null
}

function joinNameParts(parts: Array<string | null>): string | null {
  const joined = parts.filter(Boolean).join(" ").trim()
  return joined.length > 0 ? joined : null
}

export function buildOrderNumber(index: number): string {
  return `GFW-${String(index + 1).padStart(3, "0")}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function parseSpecsInput(value: string): Record<string, unknown> | null {
  if (!value.trim()) {
    return null
  }

  return JSON.parse(value) as Record<string, unknown>
}

export function formatAdminDate(value: string | null): string {
  if (!value) {
    return "No date"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getOrderStatusTone(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-[color:var(--admin-warning-soft)] text-[color:var(--admin-warning)]"
    case "PAID":
      return "bg-[var(--gold)] text-[var(--admin-bg)]"
    case "FULFILLING":
      return "bg-[color:var(--admin-info-soft)] text-[color:var(--admin-info)]"
    case "SHIPPED":
      return "bg-[color:var(--admin-violet-soft)] text-[color:var(--admin-violet)]"
    case "COMPLETED":
      return "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"
    case "CANCELED":
      return "bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"
    case "REFUNDED":
      return "bg-[color:var(--admin-panel-2)] text-[var(--admin-muted)]"
    default:
      return "bg-[color:var(--admin-panel-2)] text-[var(--admin-muted)]"
  }
}

export function getPaymentStatusTone(status: string): string {
  switch (status) {
    case "PAID":
    case "SUCCEEDED":
    case "SUCCESS":
      return "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"
    case "FAILED":
    case "REFUNDED":
      return "bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"
    case "PENDING":
    case "UNPAID":
    default:
      return "bg-[color:var(--admin-warning-soft)] text-[color:var(--admin-warning)]"
  }
}

export function getProductBadgeTone(badge: string | null): string {
  if ((badge ?? "").toUpperCase() === "SALE") {
    return "bg-white/10 text-[var(--admin-fg)]"
  }

  return "bg-[var(--gold)] text-[var(--admin-bg)]"
}

export function normalizeOrder(row: GenericRow, index: number): AdminOrder {
  const items = asArray(
    row.items ?? row.order_items ?? row.products ?? row.line_items ?? row.cart_items,
  ).filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)

  const customerName =
    pickString(row, ["customer_name", "customerName", "full_name", "name"]) ??
    joinNameParts([
      pickString(row, ["first_name", "firstName"]),
      pickString(row, ["last_name", "lastName"]),
    ]) ??
    "Walk-in Customer"

  const address =
    pickString(row, ["shipping_address", "shippingAddress", "address"]) ??
    joinNameParts([
      pickString(row, ["city"]),
      pickString(row, ["state", "province"]),
      pickString(row, ["country"]),
    ])

  const status = (pickString(row, ["status"]) ?? "PENDING").toUpperCase() as AdminOrderStatus
  const paymentStatus = (
    pickString(row, ["payment_status", "paymentStatus", "payment_state"]) ??
    (status === "PAID" ? "PAID" : "UNPAID")
  ).toUpperCase()

  return {
    id: pickString(row, ["id"]) ?? `order-${index + 1}`,
    orderNumber:
      pickString(row, ["order_number", "orderNumber", "reference", "ref"]) ??
      buildOrderNumber(index),
    status,
    paymentStatus,
    customerName,
    email: pickString(row, ["email", "customer_email", "customerEmail"]) ?? "No email",
    phone: pickString(row, ["phone", "customer_phone", "customerPhone"]) ?? "No phone",
    total: pickNumber(row, ["total", "grand_total", "grandTotal", "amount", "total_amount"]) ?? 0,
    itemCount:
      pickNumber(row, ["item_count", "itemCount", "items_count", "quantity"]) ??
      items.length,
    createdAt: pickString(row, ["created_at", "createdAt", "date"]),
    slipUrl:
      pickString(row, [
        "slip_image",
        "slip_url",
        "payment_slip",
        "payment_slip_url",
        "slip",
        "proof_url",
      ]),
    paymentMethod: pickString(row, ["payment_method", "paymentMethod"]),
    notes: pickString(row, ["notes", "customer_note", "customerNote"]),
    internalNote: pickString(row, [
      "internal_note",
      "internal_notes",
      "admin_note",
      "admin_notes",
      "staff_note",
      "staff_notes",
    ]),
    address,
    city: pickString(row, ["city", "province", "state"]),
    trackingNumber: pickString(row, ["tracking_number", "trackingNumber"]),
    carrier: pickString(row, ["carrier", "shipping_carrier", "courier"]),
    subtotal: pickNumber(row, ["subtotal", "sub_total", "subTotal"]) ?? 0,
    shippingTotal: pickNumber(row, ["shipping_total", "shippingTotal", "shipping_fee"]) ?? 0,
    discountTotal: pickNumber(row, ["discount_total", "discountTotal", "discount"]) ?? 0,
    updatedAt: pickString(row, ["updated_at", "updatedAt"]),
    items,
    raw: row,
  }
}

export function normalizeProduct(row: GenericRow): AdminProduct {
  const images = asArray(row.images)
    .map((image) => asString(image))
    .filter((image): image is string => Boolean(image))

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    slug: pickString(row, ["slug"]) ?? "untitled",
    name: pickString(row, ["name"]) ?? "Untitled product",
    price: pickNumber(row, ["price"]) ?? 0,
    comparePrice: pickNumber(row, ["compare_price", "original_price"]),
    images,
    category: pickString(row, ["category"]) ?? "deck",
    brand: pickString(row, ["brand"]) ?? "GOOFY.",
    badge: pickString(row, ["badge"]),
    stock: pickNumber(row, ["stock"]) ?? 0,
    sku: pickString(row, ["sku"]),
    lowStockThreshold: pickNumber(row, ["low_stock_threshold", "lowStockThreshold"]),
    description: pickString(row, ["description"]) ?? "",
    specs:
      typeof row.specs === "object" && row.specs !== null && !Array.isArray(row.specs)
        ? (row.specs as Record<string, unknown>)
        : null,
    metaTitle: pickString(row, ["meta_title", "metaTitle"]),
    metaDescription: pickString(row, ["meta_description", "metaDescription"]),
    active: asBoolean(row.active),
    createdAt: pickString(row, ["created_at", "createdAt"]),
    updatedAt: pickString(row, ["updated_at", "updatedAt"]),
    raw: row,
  }
}

export interface AdminOrderFilters {
  search: string
  status: string
  payment: string
  dateRange: AdminOrderDateRange
  from?: string
  to?: string
}

export function matchesOrderDateRange(
  value: string | null,
  dateRange: AdminOrderDateRange,
  from?: string,
  to?: string,
): boolean {
  if (dateRange === "ALL") {
    return true
  }

  if (!value) {
    return false
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const orderDate = new Date(parsed)
  orderDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (dateRange === "TODAY") {
    return orderDate.getTime() === today.getTime()
  }

  if (dateRange === "THIS_WEEK") {
    const weekStart = new Date(today)
    const day = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1))

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    return parsed >= weekStart && parsed <= weekEnd
  }

  if (dateRange === "THIS_MONTH") {
    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth()
    )
  }

  if (dateRange === "CUSTOM") {
    const fromDate = from ? new Date(from) : null
    const toDate = to ? new Date(to) : null

    if (fromDate && !Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0)
      if (parsed < fromDate) {
        return false
      }
    }

    if (toDate && !Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999)
      if (parsed > toDate) {
        return false
      }
    }
  }

  return true
}

export function filterOrders(orders: AdminOrder[], filters: AdminOrderFilters): AdminOrder[] {
  const query = filters.search.trim().toLowerCase()
  const normalizedStatus = filters.status.toUpperCase()
  const normalizedPayment = filters.payment.toUpperCase()

  return orders.filter((order) => {
    const matchesStatus =
      !normalizedStatus || normalizedStatus === "ALL" || order.status === normalizedStatus
    if (!matchesStatus) {
      return false
    }

    const orderPaymentStatus = order.paymentStatus.toUpperCase()
    const matchesPayment =
      !normalizedPayment ||
      normalizedPayment === "ALL" ||
      (normalizedPayment === "PAID"
        ? ["PAID", "SUCCEEDED", "SUCCESS"].includes(orderPaymentStatus)
        : normalizedPayment === "UNPAID"
          ? !["PAID", "SUCCEEDED", "SUCCESS"].includes(orderPaymentStatus)
          : orderPaymentStatus === normalizedPayment)

    if (!matchesPayment) {
      return false
    }

    if (
      !matchesOrderDateRange(
        order.createdAt,
        filters.dateRange,
        filters.from,
        filters.to,
      )
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      order.orderNumber,
      order.customerName,
      order.email,
      order.phone,
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function filterProducts(products: AdminProduct[], search: string): AdminProduct[] {
  const query = search.trim().toLowerCase()

  if (!query) {
    return products
  }

  return products.filter((product) =>
    [product.name, product.slug, product.brand, product.category]
      .join(" ")
      .toLowerCase()
      .includes(query),
  )
}

export function filterAdminProducts(
  products: AdminProduct[],
  filters: AdminProductFilters,
): AdminProduct[] {
  const query = filters.search.trim().toLowerCase()
  const category = filters.category.trim().toLowerCase()
  const brand = filters.brand.trim().toLowerCase()
  const badge = filters.badge.trim().toUpperCase()

  return products.filter((product) => {
    if (category && category !== "all" && product.category.toLowerCase() !== category) {
      return false
    }

    if (brand && brand !== "all" && product.brand.toLowerCase() !== brand) {
      return false
    }

    if (badge && badge !== "ALL" && (product.badge ?? "").toUpperCase() !== badge) {
      return false
    }

    if (filters.activeState === "ACTIVE" && !product.active) {
      return false
    }

    if (filters.activeState === "INACTIVE" && product.active) {
      return false
    }

    if (!query) {
      return true
    }

    return [product.name, product.slug, product.brand]
      .join(" ")
      .toLowerCase()
      .includes(query)
  })
}

export function sortAdminProducts(
  products: AdminProduct[],
  sort: AdminProductSort,
): AdminProduct[] {
  const copy = [...products]

  switch (sort) {
    case "NAME":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "PRICE":
      return copy.sort((a, b) => a.price - b.price)
    case "STOCK":
      return copy.sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
    case "NEWEST":
    default:
      return copy.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
  }
}

export function getProductDiscountPercent(product: AdminProduct): number | null {
  if (!product.comparePrice || product.comparePrice <= product.price || product.price <= 0) {
    return null
  }

  return Math.round((1 - product.price / product.comparePrice) * 100)
}

export function isImageUrl(url: string | null): boolean {
  if (!url) {
    return false
  }

  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url)
}

export function formatRevenue(value: number): string {
  return formatPrice(value)
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`
  }

  return value
}

export function serializeOrdersToCsv(orders: AdminOrder[]): string {
  const header = [
    "Order #",
    "Date",
    "Customer",
    "Phone",
    "Email",
    "Items",
    "Subtotal",
    "Shipping",
    "Discount",
    "Total",
    "Payment",
    "Status",
    "Tracking",
  ]

  const rows = orders.map((order) => [
    order.orderNumber,
    order.createdAt ?? "",
    order.customerName,
    order.phone,
    order.email,
    String(order.itemCount),
    String(order.subtotal),
    String(order.shippingTotal),
    String(order.discountTotal),
    String(order.total),
    order.paymentStatus,
    order.status,
    order.trackingNumber ?? "",
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n")
}

export function serializeProductsToCsv(products: AdminProduct[]): string {
  const header = [
    "Name",
    "Slug",
    "Category",
    "Brand",
    "Price",
    "Compare Price",
    "Stock",
    "Badge",
    "Active",
    "SKU",
  ]

  const rows = products.map((product) => [
    product.name,
    product.slug,
    product.category,
    product.brand,
    String(product.price),
    product.comparePrice ? String(product.comparePrice) : "",
    String(product.stock),
    product.badge ?? "",
    product.active ? "ACTIVE" : "INACTIVE",
    product.sku ?? "",
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n")
}
