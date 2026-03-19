import "server-only"

import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin"
import {
  normalizeOrder,
  normalizeProduct,
  slugify,
  type AdminOrder,
  type AdminProduct,
} from "@/lib/admin"
import {
  DEFAULT_ADMIN_SETTINGS,
  normalizeAdminBanner,
  normalizeAdminDrop,
  normalizeAdminPost,
  normalizeAdminSettings,
  type AdminBanner,
  type AdminDrop,
  type AdminPost,
  type AdminSettingsData,
} from "@/lib/admin-content"
import { normalizeReview, type ProductReview } from "@/lib/reviews"
import { getYouTubeThumbnailUrl } from "@/lib/video"

type GenericRow = Record<string, unknown>

export interface AdminAuthUserSummary {
  id: string
  email: string
  role: string
  createdAt: string | null
  lastSignInAt: string | null
}

export interface AdminAuthUsersData {
  available: boolean
  errorMessage: string | null
  users: AdminAuthUserSummary[]
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

function buildCustomerLookupKey(phone: string, email: string): string {
  return phone !== "No phone" ? phone : email
}

function buildCustomerNoteSettingKey(lookupKey: string): string {
  return `customer_note:${encodeURIComponent(lookupKey)}`
}

async function getCustomerNotesMap(): Promise<Map<string, string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .like("key", "customer_note:%")

  if (error) {
    return new Map()
  }

  return new Map(
    (data ?? []).flatMap((row) => {
      const key = typeof row.key === "string" ? row.key : ""

      if (!key.startsWith("customer_note:")) {
        return []
      }

      const lookupKey = decodeURIComponent(key.replace("customer_note:", ""))
      const rawValue = row.value
      const note =
        typeof rawValue === "object" && rawValue !== null
          ? pickString(rawValue as GenericRow, ["note", "value", "text"])
          : asString(rawValue)

      return lookupKey && note ? ([[lookupKey, note]] as const) : []
    }),
  )
}

export interface AdminCustomerSummary {
  lookupKey: string
  phone: string
  customerName: string
  email: string
  city: string
  orderCount: number
  totalSpent: number
  averageOrderValue: number
  firstOrderAt: string | null
  lastOrderAt: string | null
  latestStatus: string
  note: string | null
  orders: AdminOrder[]
}

export interface AdminPark {
  id: string
  name: string
  slug: string
  description: string
  location: string
  city: string
  difficulty: string
  photos: string[]
  active: boolean
  createdAt: string | null
  raw: GenericRow
}

export interface AdminVideo {
  id: string
  title: string
  slug: string
  youtubeUrl: string
  thumbnailUrl: string | null
  category: string
  published: boolean
  createdAt: string | null
  raw: GenericRow
}

export interface AdminReviewEntry extends ProductReview {
  productName: string
  productSlug: string
}

export interface AdminNotifyEntry {
  id: string
  dropId: string | null
  dropTitle: string
  phone: string
  email: string
  createdAt: string | null
  raw: GenericRow
}

export interface AdminDiscount {
  id: string
  code: string
  type: string
  value: number
  minOrder: number
  maxUses: number
  usesCount: number
  active: boolean
  expiresAt: string | null
  createdAt: string | null
  raw: GenericRow
}

export interface AdminOrderLog {
  id: string
  orderId: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  note: string | null
  createdAt: string | null
}

export interface AdminStockLog {
  id: string
  productId: string
  productName: string
  oldStock: number
  newStock: number
  reason: string | null
  changedBy: string
  createdAt: string | null
}

export interface AdminDashboardTopProduct {
  key: string
  name: string
  category: string
  orderCount: number
  quantitySold: number
  lastOrderedAt: string | null
}

export interface AdminDashboardTopCategory {
  category: string
  count: number
  percent: number
}

export interface AdminDashboardActivityItem {
  id: string
  label: string
  detail: string
  createdAt: string | null
  tone: "pending" | "processing" | "active" | "cancelled" | "paid" | "unpaid"
}

export interface AdminDashboardRevenuePoint {
  label: string
  date: string
  amount: number
}

export interface AdminDashboardOrdersStatusPoint {
  label: string
  date: string
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

function isPaidPaymentStatus(status: string): boolean {
  return ["PAID", "SUCCEEDED", "SUCCESS"].includes(status.toUpperCase())
}

function toTimestamp(value: string | null): number {
  if (!value) {
    return 0
  }

  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function makeDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function extractOrderItemSummary(
  item: Record<string, unknown>,
  productsById: Map<string, AdminProduct>,
  productsBySlug: Map<string, AdminProduct>,
  productsByName: Map<string, AdminProduct>,
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
    (directId ? productsById.get(directId) : null) ??
    (nestedId ? productsById.get(nestedId) : null) ??
    (directSlug ? productsBySlug.get(directSlug) : null) ??
    (nestedSlug ? productsBySlug.get(nestedSlug) : null) ??
    productsByName.get(directName.toLowerCase())

  const category =
    product?.category ??
    pickString(item, ["category"]) ??
    (nestedProduct ? pickString(nestedProduct, ["category"]) : null) ??
    "Unknown"

  const name = product?.name ?? directName
  const key = product?.id ?? directId ?? nestedId ?? directSlug ?? nestedSlug ?? name.toLowerCase()

  return {
    key,
    name,
    category,
    quantity,
  }
}

function normalizeAdminPark(row: GenericRow): AdminPark {
  const name = pickString(row, ["name", "title"]) ?? "Untitled Park"
  const photos = asArray(row.photos)
    .map((photo) => asString(photo))
    .filter((photo): photo is string => Boolean(photo))
  const fallbackPhoto = pickString(row, ["photo", "image", "image_url", "thumbnail"])

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    name,
    slug: pickString(row, ["slug"]) ?? slugify(name),
    description: pickString(row, ["description", "summary"]) ?? "",
    location: pickString(row, ["location", "address"]) ?? "",
    city: pickString(row, ["city", "district"]) ?? "Vientiane",
    difficulty: (pickString(row, ["difficulty"]) ?? "beginner").toLowerCase(),
    photos: photos.length > 0 ? photos : fallbackPhoto ? [fallbackPhoto] : [],
    active: asBoolean(row.active ?? row.open ?? row.is_open),
    createdAt: pickString(row, ["created_at", "createdAt"]),
    raw: row,
  }
}

function normalizeAdminVideo(row: GenericRow): AdminVideo {
  const title = pickString(row, ["title", "name"]) ?? "Untitled Video"
  const youtubeUrl = pickString(row, ["youtube_url", "url", "link"]) ?? ""
  const autoThumbnailUrl = getYouTubeThumbnailUrl(youtubeUrl)

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    title,
    slug: pickString(row, ["slug"]) ?? slugify(title),
    youtubeUrl,
    thumbnailUrl: pickString(row, [
      "thumbnail_url",
      "thumbnail",
      "image",
      "image_url",
      "cover",
    ]) ?? autoThumbnailUrl,
    category: (pickString(row, ["category", "tag", "type"]) ?? "community").toLowerCase(),
    published: asBoolean(row.published ?? row.active ?? row.is_active ?? true),
    createdAt: pickString(row, ["created_at", "published_at", "published_date"]),
    raw: row,
  }
}

function normalizeAdminDiscount(row: GenericRow): AdminDiscount {
  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    code: pickString(row, ["code", "coupon_code", "slug"]) ?? "UNTITLED",
    type: (pickString(row, ["type", "discount_type"]) ?? "fixed").toUpperCase(),
    value: asNumber(row.value ?? row.amount ?? row.percent ?? row.discount_value) ?? 0,
    minOrder: asNumber(row.min_order ?? row.minimum_order ?? row.minOrder) ?? 0,
    maxUses: asNumber(row.max_uses ?? row.maxUses) ?? 0,
    usesCount: asNumber(row.uses_count ?? row.usage_count ?? row.uses ?? row.used_count) ?? 0,
    active: asBoolean(row.active ?? row.enabled ?? row.is_active),
    expiresAt: pickString(row, ["expires_at", "ends_at", "end_date"]),
    createdAt: pickString(row, ["created_at", "createdAt"]),
    raw: row,
  }
}

async function getDropProductRelations(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Array<{ dropId: string; productId: string }>> {
  const { data, error } = await supabase.from("drop_event_products").select("drop_id, product_id")

  if (error) {
    return []
  }

  return (data ?? []).flatMap((row) => {
    const genericRow = row as GenericRow
    const dropId = pickString(genericRow, ["drop_id", "dropId"])
    const productId = pickString(genericRow, ["product_id", "productId"])

    return dropId && productId ? [{ dropId, productId }] : []
  })
}

async function getDropNotifyMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Map<string, number>> {
  const { data, error } = await supabase.from("notify_list").select("drop_id, drop_event_id")

  if (error) {
    return new Map()
  }

  const counts = new Map<string, number>()

  for (const row of data ?? []) {
    const genericRow = row as GenericRow
    const dropId = pickString(genericRow, ["drop_id", "drop_event_id"])

    if (!dropId) {
      continue
    }

    counts.set(dropId, (counts.get(dropId) ?? 0) + 1)
  }

  return counts
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row, index) =>
    normalizeOrder(row as Record<string, unknown>, index),
  )
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (!data) {
    return null
  }

  return normalizeOrder(data as Record<string, unknown>, 0)
}

export async function getAdminOrderLogs(orderId: string): Promise<AdminOrderLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("order_logs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return (data ?? []).map((row) => {
    const genericRow = row as GenericRow

    return {
      id: pickString(genericRow, ["id"]) ?? crypto.randomUUID(),
      orderId: pickString(genericRow, ["order_id", "orderId"]) ?? orderId,
      fromStatus: pickString(genericRow, ["from_status", "fromStatus"]),
      toStatus: pickString(genericRow, ["to_status", "toStatus"]) ?? "PENDING",
      changedBy: pickString(genericRow, ["changed_by", "changedBy", "created_by"]) ?? "admin",
      note: pickString(genericRow, ["note", "notes"]),
      createdAt: pickString(genericRow, ["created_at", "createdAt"]),
    }
  })
}

export async function getAdminStockLogs(limit = 50): Promise<AdminStockLog[]> {
  const supabase = await createClient()
  const [{ data: logs, error }, { data: products }] = await Promise.all([
    supabase.from("stock_logs").select("*").order("created_at", { ascending: false }).limit(limit),
    supabase.from("products").select("id, name"),
  ])

  if (error) {
    return []
  }

  const productNames = new Map(
    (products ?? []).flatMap((product) =>
      typeof product.id === "string" && typeof product.name === "string"
        ? [[product.id, product.name] as const]
        : [],
    ),
  )

  return (logs ?? []).map((row) => {
    const genericRow = row as GenericRow
    const productId = pickString(genericRow, ["product_id", "productId"]) ?? ""

    return {
      id: pickString(genericRow, ["id"]) ?? crypto.randomUUID(),
      productId,
      productName:
        pickString(genericRow, ["product_name", "productName"]) ??
        productNames.get(productId) ??
        "Unknown product",
      oldStock: asNumber(genericRow.old_stock ?? genericRow.oldStock) ?? 0,
      newStock: asNumber(genericRow.new_stock ?? genericRow.newStock) ?? 0,
      reason: pickString(genericRow, ["reason", "note"]),
      changedBy: pickString(genericRow, ["changed_by", "changedBy"]) ?? "admin",
      createdAt: pickString(genericRow, ["created_at", "createdAt"]),
    }
  })
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>))
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (!data) {
    return null
  }

  return normalizeProduct(data as Record<string, unknown>)
}

export async function getAdminProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => normalizeReview(row as Record<string, unknown>))
}

export async function getAdminCustomers(): Promise<AdminCustomerSummary[]> {
  const [orders, notesMap] = await Promise.all([getAdminOrders(), getCustomerNotesMap()])
  const customers = new Map<string, AdminCustomerSummary>()

  for (const order of orders) {
    const key = buildCustomerLookupKey(order.phone, order.email)
    const existing = customers.get(key)

    if (!existing) {
      customers.set(key, {
        lookupKey: key,
        phone: order.phone,
        customerName: order.customerName,
        email: order.email,
        city: order.city ?? "No city",
        orderCount: 1,
        totalSpent: order.total,
        averageOrderValue: order.total,
        firstOrderAt: order.createdAt,
        lastOrderAt: order.createdAt,
        latestStatus: order.status,
        note: notesMap.get(key) ?? null,
        orders: [order],
      })
      continue
    }

    existing.orderCount += 1
    existing.totalSpent += order.total
    existing.orders.push(order)

    const existingDate = existing.lastOrderAt ? new Date(existing.lastOrderAt).getTime() : 0
    const nextDate = order.createdAt ? new Date(order.createdAt).getTime() : 0

    if (nextDate >= existingDate) {
      existing.lastOrderAt = order.createdAt
      existing.latestStatus = order.status
      existing.customerName = order.customerName
      existing.email = order.email
      existing.phone = order.phone
      existing.city = order.city ?? existing.city
    }

    const existingFirstDate = existing.firstOrderAt
      ? new Date(existing.firstOrderAt).getTime()
      : Number.POSITIVE_INFINITY

    if (nextDate > 0 && nextDate <= existingFirstDate) {
      existing.firstOrderAt = order.createdAt
    }
  }

  return Array.from(customers.values())
    .map((customer) => ({
      ...customer,
      averageOrderValue:
        customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0,
    }))
    .sort((a, b) => {
      const aTime = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0
      const bTime = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0
      return bTime - aTime
    })
}

export async function getAdminCustomer(phone: string): Promise<AdminCustomerSummary | null> {
  const customers = await getAdminCustomers()
  const normalizedPhone = decodeURIComponent(phone)
  return (
    customers.find(
      (customer) =>
        customer.lookupKey === normalizedPhone ||
        customer.phone === normalizedPhone ||
        customer.email === normalizedPhone,
    ) ?? null
  )
}

export async function getAdminDrop(id: string): Promise<AdminDrop | null> {
  const supabase = await createClient()
  const [{ data, error }, relations, notifyMap] = await Promise.all([
    supabase.from("drop_events").select("*").eq("id", id).single(),
    getDropProductRelations(supabase),
    getDropNotifyMap(supabase),
  ])

  if (error || !data) {
    return null
  }

  const productIds = relations
    .filter((relation) => relation.dropId === id)
    .map((relation) => relation.productId)

  return normalizeAdminDrop({
    ...(data as GenericRow),
    product_ids: productIds,
    products_count: productIds.length,
    notify_signups: notifyMap.get(id) ?? 0,
  })
}

export async function getAdminDrops(): Promise<AdminDrop[]> {
  const supabase = await createClient()
  const [{ data, error }, relations, notifyMap] = await Promise.all([
    supabase.from("drop_events").select("*").order("drop_date", { ascending: false }),
    getDropProductRelations(supabase),
    getDropNotifyMap(supabase),
  ])

  if (error) {
    return []
  }

  const productsByDrop = new Map<string, string[]>()

  for (const relation of relations) {
    const existing = productsByDrop.get(relation.dropId) ?? []
    existing.push(relation.productId)
    productsByDrop.set(relation.dropId, existing)
  }

  return (data ?? []).map((row) => {
    const genericRow = row as GenericRow
    const dropId = pickString(genericRow, ["id"]) ?? ""
    const productIds = dropId ? productsByDrop.get(dropId) ?? [] : []

    return normalizeAdminDrop({
      ...genericRow,
      product_ids: productIds,
      products_count: productIds.length,
      notify_signups: dropId ? notifyMap.get(dropId) ?? 0 : 0,
    })
  })
}

export async function getAdminPost(id: string): Promise<AdminPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return normalizeAdminPost(data as GenericRow)
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return (data ?? []).map((row) => normalizeAdminPost(row as Record<string, unknown>))
}

export async function getAdminBanners(): Promise<AdminBanner[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return (data ?? []).map((row) => normalizeAdminBanner(row as Record<string, unknown>))
}

export async function getAdminParks(): Promise<AdminPark[]> {
  const supabase = await createClient()
  const primary = await supabase.from("parks").select("*").order("name")

  if (!primary.error) {
    return (primary.data ?? []).map((row) => normalizeAdminPark(row as GenericRow))
  }

  const fallback = await supabase.from("skateparks").select("*").order("name")

  if (fallback.error) {
    return []
  }

  return (fallback.data ?? []).map((row) => normalizeAdminPark(row as GenericRow))
}

export async function getAdminVideos(): Promise<AdminVideo[]> {
  const supabase = await createClient()
  const primary = await supabase
    .from("videos")
    .select("*")
    .order("published_date", { ascending: false })

  if (primary.error) {
    const fallback = await supabase.from("videos").select("*").order("created_at", {
      ascending: false,
    })

    if (fallback.error) {
      return []
    }

    return (fallback.data ?? []).map((row) => normalizeAdminVideo(row as GenericRow))
  }

  return (primary.data ?? []).map((row) => normalizeAdminVideo(row as GenericRow))
}

export async function getAdminReviews(): Promise<AdminReviewEntry[]> {
  const [products, supabase] = await Promise.all([getAdminProducts(), createClient()])
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", {
    ascending: false,
  })

  if (error) {
    return []
  }

  const productMap = new Map<string, AdminProduct>(
    products.map((product) => [product.id, product]),
  )

  return (data ?? []).map((row) => {
    const review = normalizeReview(row as GenericRow)
    const product = productMap.get(review.productId)

    return {
      ...review,
      productName: product?.name ?? "Unknown product",
      productSlug: product?.slug ?? "",
    }
  })
}

export async function getAdminNotifyEntries(): Promise<AdminNotifyEntry[]> {
  const [drops, supabase] = await Promise.all([getAdminDrops(), createClient()])
  const { data, error } = await supabase.from("notify_list").select("*").order("created_at", {
    ascending: false,
  })

  if (error) {
    return []
  }

  const dropMap = new Map(drops.map((drop) => [drop.id, drop.title]))

  return (data ?? []).map((row) => {
    const genericRow = row as GenericRow
    const dropId = pickString(genericRow, ["drop_id", "drop_event_id"])

    return {
      id: pickString(genericRow, ["id"]) ?? crypto.randomUUID(),
      dropId,
      dropTitle: (dropId ? dropMap.get(dropId) : null) ?? "Unknown Drop",
      phone: pickString(genericRow, ["phone"]) ?? "-",
      email: pickString(genericRow, ["email"]) ?? "-",
      createdAt: pickString(genericRow, ["created_at"]),
      raw: genericRow,
    }
  })
}

export async function getAdminDiscounts(): Promise<AdminDiscount[]> {
  const supabase = await createClient()
  const primary = await supabase.from("discount_codes").select("*").order("created_at", {
    ascending: false,
  })

  if (!primary.error) {
    return (primary.data ?? []).map((row) => normalizeAdminDiscount(row as GenericRow))
  }

  const fallback = await supabase.from("discounts").select("*").order("created_at", {
    ascending: false,
  })

  if (fallback.error) {
    return []
  }

  return (fallback.data ?? []).map((row) => normalizeAdminDiscount(row as GenericRow))
}

export async function getAdminSettings(): Promise<AdminSettingsData> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("settings").select("*")

  if (error) {
    return DEFAULT_ADMIN_SETTINGS
  }

  return normalizeAdminSettings((data ?? []) as Array<Record<string, unknown>>)
}

export async function getAdminAuthUsers(): Promise<AdminAuthUsersData> {
  if (!isSupabaseAdminConfigured()) {
    return {
      available: false,
      errorMessage: "Set SUPABASE_SERVICE_ROLE_KEY to manage admin users.",
      users: [],
    }
  }

  const adminClient = getSupabaseAdminClient()

  if (!adminClient) {
    return {
      available: false,
      errorMessage: "Supabase admin client is not configured.",
      users: [],
    }
  }

  const { data, error } = await adminClient.auth.admin.listUsers()

  if (error) {
    return {
      available: false,
      errorMessage: error.message || "Unable to load admin users.",
      users: [],
    }
  }

  return {
    available: true,
    errorMessage: null,
    users: (data.users ?? [])
      .map((user) => ({
        id: user.id,
        email: user.email ?? "No email",
        role:
          typeof user.app_metadata?.role === "string"
            ? user.app_metadata.role
            : user.role ?? "authenticated",
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      }))
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      }),
  }
}

export async function getAdminDashboardData() {
  const [orders, products, drops, posts, notifyEntries] = await Promise.all([
    getAdminOrders(),
    getAdminProducts(),
    getAdminDrops(),
    getAdminPosts(),
    getAdminNotifyEntries(),
  ])

  const revenue = orders
    .filter((order) => isPaidPaymentStatus(order.paymentStatus))
    .reduce((total, order) => total + order.total, 0)

  const lowStockProducts = products
    .filter((product) => product.active && product.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)

  const pendingOrders = orders.filter((order) => order.status === "PENDING").length
  const recentOrders = orders.slice(0, 5)

  const productsById = new Map(products.map((product) => [product.id, product]))
  const productsBySlug = new Map(products.map((product) => [product.slug, product]))
  const productsByName = new Map(products.map((product) => [product.name.toLowerCase(), product]))

  const topProductsMap = new Map<string, AdminDashboardTopProduct>()
  const topCategoryCounts = new Map<string, number>()

  for (const order of orders) {
    for (const rawItem of order.items) {
      const item = extractOrderItemSummary(
        rawItem,
        productsById,
        productsBySlug,
        productsByName,
      )
      const existing = topProductsMap.get(item.key)

      if (!existing) {
        topProductsMap.set(item.key, {
          key: item.key,
          name: item.name,
          category: item.category,
          orderCount: 1,
          quantitySold: item.quantity,
          lastOrderedAt: order.createdAt,
        })
      } else {
        existing.orderCount += 1
        existing.quantitySold += item.quantity
        if (toTimestamp(order.createdAt) >= toTimestamp(existing.lastOrderedAt)) {
          existing.lastOrderedAt = order.createdAt
        }
      }

      topCategoryCounts.set(
        item.category,
        (topCategoryCounts.get(item.category) ?? 0) + item.quantity,
      )
    }
  }

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => {
      if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount
      if (b.quantitySold !== a.quantitySold) return b.quantitySold - a.quantitySold
      return toTimestamp(b.lastOrderedAt) - toTimestamp(a.lastOrderedAt)
    })
    .slice(0, 5)

  const totalCategoryCount = Math.max(
    Array.from(topCategoryCounts.values()).reduce((sum, count) => sum + count, 0),
    1,
  )

  const topCategories = Array.from(topCategoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / totalCategoryCount) * 100),
    }))

  const today = new Date()
  const revenueTimeline: AdminDashboardRevenuePoint[] = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - (29 - index))
    const dayKey = makeDayKey(date)
    const amount = orders
      .filter(
        (order) =>
          isPaidPaymentStatus(order.paymentStatus) &&
          (order.createdAt ?? "").slice(0, 10) === dayKey,
      )
      .reduce((sum, order) => sum + order.total, 0)

    return {
      label: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      date: dayKey,
      amount,
    }
  })

  const ordersStatusTimeline: AdminDashboardOrdersStatusPoint[] = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(today.getDate() - (6 - index))
      const dayKey = makeDayKey(date)
      const dayOrders = orders.filter((order) => (order.createdAt ?? "").slice(0, 10) === dayKey)

      return {
        label: date.toLocaleDateString("en-GB", { weekday: "short" }),
        date: dayKey,
        pending: dayOrders.filter((order) => order.status === "PENDING").length,
        processing: dayOrders.filter((order) => order.status === "FULFILLING").length,
        shipped: dayOrders.filter((order) => order.status === "SHIPPED").length,
        delivered: dayOrders.filter((order) => order.status === "COMPLETED").length,
        cancelled: dayOrders.filter((order) => order.status === "CANCELED").length,
      }
    },
  )

  const activityFeed = [
    ...orders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      label: `New order ${order.orderNumber}`,
      detail: order.customerName,
      createdAt: order.createdAt,
      tone: "pending" as const,
    })),
    ...orders
      .filter((order) => Boolean(order.slipUrl))
      .slice(0, 3)
      .map((order) => ({
        id: `slip-${order.id}`,
        label: `${order.customerName} uploaded slip`,
        detail: order.orderNumber,
        createdAt:
          pickString(order.raw, ["updated_at", "slip_uploaded_at", "payment_confirmed_at"]) ??
          order.createdAt,
        tone: "paid" as const,
      })),
    ...lowStockProducts.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      label: `Stock low: ${product.name}`,
      detail: `${product.stock} left`,
      createdAt: pickString(product.raw, ["updated_at", "created_at"]) ?? product.createdAt,
      tone: "cancelled" as const,
    })),
  ]
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
    .slice(0, 8)

  return {
    orders,
    products,
    revenue,
    pendingOrders,
    lowStockCount: products.filter((product) => product.active && product.stock <= 3).length,
    lowStockProducts,
    recentOrders,
    revenueTimeline,
    ordersStatusTimeline,
    quickStats: {
      totalProducts: products.length,
      activeDrops: drops.filter((drop) => drop.status === "LIVE").length,
      publishedPosts: posts.filter((post) => post.published).length,
      notifySignups: notifyEntries.length,
    },
    topProducts,
    topCategories,
    activityFeed,
  }
}
