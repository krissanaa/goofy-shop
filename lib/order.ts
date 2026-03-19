export type TrackedOrderStatus =
  | "PENDING"
  | "PAID"
  | "FULFILLING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED"

export type TrackedPaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"

export interface TrackedOrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
  image: string | null
}

export interface TrackedOrder {
  id: string
  orderNumber: string
  status: TrackedOrderStatus
  paymentStatus: TrackedPaymentStatus
  paymentMethod: string | null
  createdAt: string | null
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  subtotal: number
  shippingTotal: number
  total: number
  slipUrl: string | null
  items: TrackedOrderItem[]
}

export interface OrderLookupSummary {
  id: string
  orderNumber: string
  createdAt: string | null
  total: number
  status: TrackedOrderStatus
  paymentStatus: TrackedPaymentStatus
  itemCount: number
}

type GenericRow = Record<string, unknown>

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

function normalizeItem(row: GenericRow, index: number): TrackedOrderItem {
  const quantity = pickNumber(row, ["quantity", "qty"]) ?? 1
  const unitPrice = pickNumber(row, ["unit_price", "unitPrice", "price"]) ?? 0
  const lineTotal = pickNumber(row, ["line_total", "lineTotal", "total"]) ?? unitPrice * quantity

  return {
    id: pickString(row, ["id", "sku", "product_id", "productId"]) ?? `item-${index + 1}`,
    name:
      pickString(row, ["product_name", "productName", "name", "title", "variant_title"]) ??
      "Product",
    quantity,
    unitPrice,
    lineTotal,
    image:
      pickString(row, ["image", "image_url", "imageUrl", "product_image", "productImage"]) ??
      null,
  }
}

export function normalizeTrackedOrder(row: GenericRow): TrackedOrder {
  const items = asArray(
    row.items ?? row.order_items ?? row.products ?? row.line_items ?? row.cart_items,
  )
    .filter((item): item is GenericRow => typeof item === "object" && item !== null)
    .map(normalizeItem)

  const status = (pickString(row, ["status"]) ?? "PENDING").toUpperCase() as TrackedOrderStatus
  const rawPaymentStatus = pickString(row, ["payment_status", "paymentStatus"])
  const paymentStatus = (
    rawPaymentStatus ??
    (status === "PAID" ||
    status === "FULFILLING" ||
    status === "SHIPPED" ||
    status === "COMPLETED"
      ? "PAID"
      : "UNPAID")
  ).toUpperCase() as TrackedPaymentStatus

  return {
    id: pickString(row, ["id"]) ?? "order",
    orderNumber: pickString(row, ["order_number", "orderNumber", "reference", "ref"]) ?? "GFW-000",
    status,
    paymentStatus,
    paymentMethod: pickString(row, ["payment_method", "paymentMethod"]),
    createdAt: pickString(row, ["created_at", "createdAt", "date"]),
    customerName:
      pickString(row, ["customer_name", "customerName", "full_name", "name"]) ??
      joinNameParts([
        pickString(row, ["first_name", "firstName"]),
        pickString(row, ["last_name", "lastName"]),
      ]) ??
      "Walk-in Customer",
    email: pickString(row, ["email", "customer_email", "customerEmail"]) ?? "No email",
    phone: pickString(row, ["phone", "customer_phone", "customerPhone"]) ?? "No phone",
    address:
      pickString(row, ["shipping_address", "shippingAddress", "address"]) ?? "No address provided",
    city: pickString(row, ["city", "province", "state"]) ?? "No city",
    subtotal: pickNumber(row, ["subtotal", "sub_total", "subTotal"]) ?? 0,
    shippingTotal: pickNumber(row, ["shipping_total", "shippingTotal"]) ?? 0,
    total: pickNumber(row, ["total", "grand_total", "grandTotal", "amount", "total_amount"]) ?? 0,
    slipUrl:
      pickString(row, [
        "slip_image",
        "slip_url",
        "payment_slip",
        "payment_slip_url",
        "slip",
        "proof_url",
      ]) ?? null,
    items,
  }
}

export function normalizeOrderLookupSummary(row: GenericRow): OrderLookupSummary {
  const trackedOrder = normalizeTrackedOrder(row)

  return {
    id: trackedOrder.id,
    orderNumber: trackedOrder.orderNumber,
    createdAt: trackedOrder.createdAt,
    total: trackedOrder.total,
    status: trackedOrder.status,
    paymentStatus: trackedOrder.paymentStatus,
    itemCount: trackedOrder.items.length,
  }
}

export function getTrackingStepIndex(status: TrackedOrderStatus): number {
  switch (status) {
    case "PAID":
    case "FULFILLING":
      return 1
    case "SHIPPED":
      return 2
    case "COMPLETED":
      return 3
    case "CANCELED":
    case "REFUNDED":
    case "PENDING":
    default:
      return 0
  }
}

export function formatTrackingDate(value: string | null): string {
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
