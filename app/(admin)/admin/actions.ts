"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PRODUCT_BADGES,
  ADMIN_PRODUCT_CATEGORIES,
  buildOrderNumber,
  parseSpecsInput,
  slugify,
  type AdminActionState,
} from "@/lib/admin"
import {
  ADMIN_DROP_STATUSES,
  ADMIN_POST_CATEGORIES,
} from "@/lib/admin-content"
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/video"

type GenericRow = Record<string, unknown>

function normalizeOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeRequiredString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

function normalizeNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeUnknownString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function hasOwnKey(row: GenericRow, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(row, key)
}

function findExistingKey(row: GenericRow, keys: string[]): string | null {
  for (const key of keys) {
    if (hasOwnKey(row, key)) {
      return key
    }
  }

  return null
}

function setExistingValue(
  payload: Record<string, unknown>,
  row: GenericRow,
  keys: string[],
  value: unknown,
) {
  const key = findExistingKey(row, keys)

  if (key) {
    payload[key] = value
  }
}

function parseJsonStringArray(value: string): string[] {
  if (!value.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    }
  } catch {
    return value
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

type ProductImageOrderItem = {
  kind: "existing" | "new"
  value: string
}

function parseProductImageOrder(value: string): ProductImageOrderItem[] {
  if (!value.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.flatMap((entry) => {
      if (
        typeof entry === "object" &&
        entry !== null &&
        "kind" in entry &&
        "value" in entry &&
        (entry.kind === "existing" || entry.kind === "new") &&
        typeof entry.value === "string" &&
        entry.value.trim()
      ) {
        return [{ kind: entry.kind, value: entry.value.trim() }]
      }

      return []
    })
  } catch {
    return []
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function buildCustomerNoteSettingKey(lookupKey: string): string {
  return `customer_note:${encodeURIComponent(lookupKey)}`
}

async function getSupportedProductColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Set<string>> {
  const supported = new Set<string>()
  const columns = [
    "sku",
    "low_stock_threshold",
    "meta_title",
    "meta_description",
    "updated_at",
  ]

  await Promise.all(
    columns.map(async (column) => {
      const { error } = await supabase.from("products").select(column).limit(1)
      if (!error) {
        supported.add(column)
      }
    }),
  )

  return supported
}

async function getSupportedDropColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Set<string>> {
  const supported = new Set<string>()
  const columns = ["is_featured", "featured", "end_date", "teaser_image", "updated_at"]

  await Promise.all(
    columns.map(async (column) => {
      const { error } = await supabase.from("drop_events").select(column).limit(1)
      if (!error) {
        supported.add(column)
      }
    }),
  )

  return supported
}

async function getParkTableName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id?: string | null,
): Promise<"parks" | "skateparks"> {
  if (id) {
    const parkMatch = await supabase.from("parks").select("id").eq("id", id).maybeSingle()
    if (!parkMatch.error && parkMatch.data) {
      return "parks"
    }

    const skateparkMatch = await supabase
      .from("skateparks")
      .select("id")
      .eq("id", id)
      .maybeSingle()

    if (!skateparkMatch.error && skateparkMatch.data) {
      return "skateparks"
    }
  }

  const parksProbe = await supabase.from("parks").select("id", { count: "exact", head: true })
  return parksProbe.error ? "skateparks" : "parks"
}

async function getSupportedParkColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tableName: "parks" | "skateparks",
): Promise<Set<string>> {
  const supported = new Set<string>()
  const columns = [
    "slug",
    "description",
    "location",
    "city",
    "difficulty",
    "photos",
    "active",
    "updated_at",
    "address",
    "photo",
    "image",
    "image_url",
    "thumbnail",
    "open",
    "is_open",
  ]

  await Promise.all(
    columns.map(async (column) => {
      const { error } = await supabase.from(tableName).select(column).limit(1)
      if (!error) {
        supported.add(column)
      }
    }),
  )

  return supported
}

function setParkValue(
  payload: Record<string, unknown>,
  row: GenericRow | null,
  supportedColumns: Set<string>,
  keys: string[],
  value: unknown,
) {
  if (row) {
    const rowKey = findExistingKey(row, keys)
    if (rowKey) {
      payload[rowKey] = value
      return
    }
  }

  const supportedKey = keys.find((key) => supportedColumns.has(key))
  if (supportedKey) {
    payload[supportedKey] = value
  }
}

function setDropValue(
  payload: Record<string, unknown>,
  row: GenericRow | null,
  supportedColumns: Set<string>,
  keys: string[],
  value: unknown,
) {
  if (row) {
    const rowKey = findExistingKey(row, keys)
    if (rowKey) {
      payload[rowKey] = value
      return
    }
  }

  const supportedKey = keys.find((key) => supportedColumns.has(key))
  if (supportedKey) {
    payload[supportedKey] = value
  }
}

function setProductValue(
  payload: Record<string, unknown>,
  row: GenericRow | null,
  supportedColumns: Set<string>,
  keys: string[],
  value: unknown,
) {
  if (row) {
    const rowKey = findExistingKey(row, keys)
    if (rowKey) {
      payload[rowKey] = value
      return
    }
  }

  const supportedKey = keys.find((key) => supportedColumns.has(key))
  if (supportedKey) {
    payload[supportedKey] = value
  }
}

async function getSupportedVideoColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Set<string>> {
  const supported = new Set<string>()
  const columns = [
    "slug",
    "thumbnail_url",
    "thumbnail",
    "image_url",
    "image",
    "published",
    "active",
    "published_at",
    "published_date",
    "updated_at",
  ]

  await Promise.all(
    columns.map(async (column) => {
      const { error } = await supabase.from("videos").select(column).limit(1)
      if (!error) {
        supported.add(column)
      }
    }),
  )

  return supported
}

function setVideoValue(
  payload: Record<string, unknown>,
  row: GenericRow | null,
  supportedColumns: Set<string>,
  keys: string[],
  value: unknown,
) {
  if (row) {
    const rowKey = findExistingKey(row, keys)
    if (rowKey) {
      payload[rowKey] = value
      return
    }
  }

  const supportedKey = keys.find((key) => supportedColumns.has(key))
  if (supportedKey) {
    payload[supportedKey] = value
  }
}

async function getProductRow(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()

  return {
    supabase,
    row: (data as GenericRow | null) ?? null,
    error,
  }
}

async function insertStockLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    productId: string
    oldStock: number
    newStock: number
    reason: string | null
    changedBy: string
  },
) {
  await supabase.from("stock_logs").insert({
    product_id: input.productId,
    old_stock: input.oldStock,
    new_stock: input.newStock,
    reason: input.reason,
    changed_by: input.changedBy,
    created_at: new Date().toISOString(),
  })
}

async function saveProductStockChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: GenericRow,
  input: {
    stock: number
    reason: string | null
    changedBy: string
  },
) {
  const id = typeof row.id === "string" ? row.id : ""

  if (!id) {
    throw new Error("Product id is missing.")
  }

  const oldStock =
    typeof row.stock === "number"
      ? row.stock
      : typeof row.stock === "string"
        ? Number(row.stock) || 0
        : 0

  const { error } = await supabase
    .from("products")
    .update({
      stock: input.stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message || "Unable to update stock.")
  }

  if (oldStock !== input.stock) {
    await insertStockLog(supabase, {
      productId: id,
      oldStock,
      newStock: input.stock,
      reason: input.reason,
      changedBy: input.changedBy,
    })
  }

  revalidatePaths([
    "/admin",
    "/admin/products",
    "/admin/inventory",
    `/admin/products/${id}`,
    "/shop",
  ])
}

async function getAdminActorEmail() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.email || "admin@goofy.la"
}

async function getOrderRow(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

  return {
    supabase,
    row: (data as GenericRow | null) ?? null,
    error,
  }
}

async function insertOrderLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    orderId: string
    fromStatus: string | null
    toStatus: string
    changedBy: string
    note?: string | null
  },
) {
  await supabase.from("order_logs").insert({
    order_id: input.orderId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    changed_by: input.changedBy,
    note: input.note ?? null,
    created_at: new Date().toISOString(),
  })
}

async function uploadImageToBucket(
  bucket: string,
  file: File,
  slug: string,
): Promise<string> {
  const supabase = await createClient()
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${slug}-${Date.now()}.${extension}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function upsertSettingsRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: Array<{
    key: string
    value: Record<string, unknown>
  }>,
) {
  const { data: existingRows, error: selectError } = await supabase
    .from("settings")
    .select("key")
    .in(
      "key",
      rows.map((row) => row.key),
    )

  if (selectError) {
    return { error: selectError }
  }

  const existingKeys = new Set(
    (existingRows ?? [])
      .map((row) => row.key)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  )

  for (const row of rows) {
    if (existingKeys.has(row.key)) {
      const { error } = await supabase
        .from("settings")
        .update({
          value: row.value,
          updated_at: new Date().toISOString(),
        })
        .eq("key", row.key)

      if (error) {
        return { error }
      }

      continue
    }

    const { error } = await supabase.from("settings").insert({
      key: row.key,
      value: row.value,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { error }
    }
  }

  return { error: null }
}

async function getSettingsStorageMode(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<"single-row" | "key-value"> {
  const singleRowProbe = await supabase.from("settings").select("shop_name").limit(1)

  return singleRowProbe.error ? "key-value" : "single-row"
}

function revalidatePaths(paths: string[]) {
  const seen = new Set<string>()

  for (const path of paths) {
    if (!path || seen.has(path)) {
      continue
    }

    seen.add(path)
    revalidatePath(path)
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

export async function updateOrderStatusAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeRequiredString(formData.get("id"))
  const status = normalizeRequiredString(formData.get("status")).toUpperCase()
  const trackingNumber = normalizeOptionalString(formData.get("trackingNumber"))
  const note = normalizeOptionalString(formData.get("note"))

  if (!id) {
    return {
      status: "error",
      message: "Order id is missing.",
    }
  }

  if (!ADMIN_ORDER_STATUSES.includes(status as (typeof ADMIN_ORDER_STATUSES)[number])) {
    return {
      status: "error",
      message: "Invalid status selected.",
    }
  }

  const { supabase, row, error: orderError } = await getOrderRow(id)

  if (orderError || !row) {
    return {
      status: "error",
      message: orderError?.message || "Order not found.",
    }
  }

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (formData.has("trackingNumber")) {
    setExistingValue(payload, row, ["tracking_number", "trackingNumber"], trackingNumber)
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", id)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to update order.",
    }
  }

  const changedBy = await getAdminActorEmail()
  await insertOrderLog(supabase, {
    orderId: id,
    fromStatus: typeof row.status === "string" ? row.status : null,
    toStatus: status,
    changedBy,
    note,
  })

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)

  return {
    status: "success",
    message: "Order updated.",
  }
}

export async function bulkUpdateOrdersAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ids = normalizeRequiredString(formData.get("ids"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const bulkAction = normalizeRequiredString(formData.get("bulkAction")).toUpperCase()

  if (ids.length === 0) {
    return {
      status: "error",
      message: "Select at least one order.",
    }
  }

  const targetStatus =
    bulkAction === "MARK_PROCESSING"
      ? "FULFILLING"
      : bulkAction === "MARK_SHIPPED"
        ? "SHIPPED"
        : null

  if (!targetStatus) {
    return {
      status: "error",
      message: "Invalid bulk action.",
    }
  }

  const supabase = await createClient()
  const { data: orders, error: selectError } = await supabase
    .from("orders")
    .select("*")
    .in("id", ids)

  if (selectError) {
    return {
      status: "error",
      message: selectError.message || "Unable to load selected orders.",
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: targetStatus,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to update selected orders.",
    }
  }

  const changedBy = await getAdminActorEmail()
  for (const order of orders ?? []) {
    await insertOrderLog(supabase, {
      orderId: String(order.id),
      fromStatus: typeof order.status === "string" ? order.status : null,
      toStatus: targetStatus,
      changedBy,
      note: `Bulk action: ${bulkAction}`,
    })
    revalidatePath(`/admin/orders/${String(order.id)}`)
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")

  return {
    status: "success",
    message: `${ids.length} order${ids.length === 1 ? "" : "s"} updated.`,
  }
}

export async function markOrderPaidAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    return {
      status: "error",
      message: "Order id is missing.",
    }
  }

  const { supabase, row, error: orderError } = await getOrderRow(id)

  if (orderError || !row) {
    return {
      status: "error",
      message: orderError?.message || "Order not found.",
    }
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  setExistingValue(payload, row, ["payment_status", "paymentStatus", "payment_state"], "PAID")

  const { error } = await supabase.from("orders").update(payload).eq("id", id)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to mark order as paid.",
    }
  }

  const changedBy = await getAdminActorEmail()
  const currentStatus = typeof row.status === "string" ? row.status : "PENDING"
  await insertOrderLog(supabase, {
    orderId: id,
    fromStatus: currentStatus,
    toStatus: currentStatus,
    changedBy,
    note: "Payment marked as paid",
  })

  revalidatePaths(["/admin", "/admin/orders", `/admin/orders/${id}`])

  return {
    status: "success",
    message: "Payment marked as paid.",
  }
}

export async function saveOrderShippingAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeRequiredString(formData.get("id"))
  const trackingNumber = normalizeOptionalString(formData.get("trackingNumber"))
  const carrier = normalizeOptionalString(formData.get("carrier"))

  if (!id) {
    return {
      status: "error",
      message: "Order id is missing.",
    }
  }

  const { supabase, row, error: orderError } = await getOrderRow(id)

  if (orderError || !row) {
    return {
      status: "error",
      message: orderError?.message || "Order not found.",
    }
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  setExistingValue(payload, row, ["tracking_number", "trackingNumber"], trackingNumber)
  setExistingValue(payload, row, ["carrier", "shipping_carrier", "courier"], carrier)

  if (Object.keys(payload).length === 1) {
    return {
      status: "error",
      message: "No shipping fields are available on this orders table.",
    }
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", id)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to save shipping details.",
    }
  }

  revalidatePaths(["/admin/orders", `/admin/orders/${id}`])

  return {
    status: "success",
    message: "Shipping details updated.",
  }
}

export async function saveOrderInternalNoteAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeRequiredString(formData.get("id"))
  const internalNote = normalizeOptionalString(formData.get("internalNote"))

  if (!id) {
    return {
      status: "error",
      message: "Order id is missing.",
    }
  }

  const { supabase, row, error: orderError } = await getOrderRow(id)

  if (orderError || !row) {
    return {
      status: "error",
      message: orderError?.message || "Order not found.",
    }
  }

  const internalNoteKey = findExistingKey(row, [
    "internal_note",
    "internal_notes",
    "admin_note",
    "admin_notes",
    "staff_note",
    "staff_notes",
  ])

  if (!internalNoteKey) {
    return {
      status: "error",
      message: "No internal admin note field exists on the orders table.",
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      [internalNoteKey]: internalNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to save internal notes.",
    }
  }

  revalidatePaths(["/admin/orders", `/admin/orders/${id}`])

  return {
    status: "success",
    message: "Internal notes updated.",
  }
}

export async function cancelOrderAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/orders")
  }

  const { supabase, row } = await getOrderRow(id)

  if (!row) {
    redirect("/admin/orders")
  }

  await supabase
    .from("orders")
    .update({
      status: "CANCELED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  const changedBy = await getAdminActorEmail()
  await insertOrderLog(supabase, {
    orderId: id,
    fromStatus: typeof row.status === "string" ? row.status : null,
    toStatus: "CANCELED",
    changedBy,
    note: "Order canceled by admin",
  })

  revalidatePaths(["/admin", "/admin/orders", `/admin/orders/${id}`])
  redirect(`/admin/orders/${id}`)
}

export async function duplicateOrderAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/orders")
  }

  const { supabase, row } = await getOrderRow(id)

  if (!row) {
    redirect("/admin/orders")
  }

  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true })
  const duplicate = { ...row }
  const now = new Date().toISOString()

  delete duplicate.id

  setExistingValue(duplicate, row, ["order_number", "orderNumber"], buildOrderNumber(count ?? 0))
  setExistingValue(duplicate, row, ["status"], "PENDING")
  setExistingValue(duplicate, row, ["payment_status", "paymentStatus", "payment_state"], "UNPAID")
  setExistingValue(duplicate, row, ["slip_image", "slip_url", "payment_slip"], null)
  setExistingValue(duplicate, row, ["tracking_number", "trackingNumber"], null)
  setExistingValue(duplicate, row, ["carrier", "shipping_carrier", "courier"], null)
  setExistingValue(duplicate, row, ["created_at", "createdAt"], now)
  setExistingValue(duplicate, row, ["updated_at", "updatedAt"], now)

  const { data, error } = await supabase.from("orders").insert(duplicate).select("id").single()

  if (error || !data) {
    redirect(`/admin/orders/${id}`)
  }

  const changedBy = await getAdminActorEmail()
  await insertOrderLog(supabase, {
    orderId: String(data.id),
    fromStatus: null,
    toStatus: "PENDING",
    changedBy,
    note: `Duplicated from ${String(row.order_number ?? row.orderNumber ?? id)}`,
  })

  revalidatePaths(["/admin", "/admin/orders", `/admin/orders/${String(data.id)}`])
  redirect(`/admin/orders/${String(data.id)}`)
}

export async function toggleProductActiveAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))
  const nextActive = normalizeRequiredString(formData.get("nextActive")) === "true"

  if (!id) {
    return
  }

  const supabase = await createClient()
  await supabase
    .from("products")
    .update({
      active: nextActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}`)
  revalidatePath("/shop")
}

export async function bulkUpdateProductsAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ids = normalizeRequiredString(formData.get("ids"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const bulkAction = normalizeRequiredString(formData.get("bulkAction")).toUpperCase()

  if (ids.length === 0) {
    return {
      status: "error",
      message: "Select at least one product.",
    }
  }

  const supabase = await createClient()

  if (bulkAction === "DELETE") {
    const { error } = await supabase.from("products").delete().in("id", ids)

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to delete selected products.",
      }
    }

    revalidatePaths(["/admin", "/admin/products", "/admin/inventory", "/shop"])

    return {
      status: "success",
      message: `${ids.length} product${ids.length === 1 ? "" : "s"} deleted.`,
    }
  }

  const nextActive =
    bulkAction === "ACTIVATE" ? true : bulkAction === "DEACTIVATE" ? false : null

  if (nextActive === null) {
    return {
      status: "error",
      message: "Invalid bulk action.",
    }
  }

  const payload: Record<string, unknown> = {
    active: nextActive,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").update(payload).in("id", ids)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to update selected products.",
    }
  }

  revalidatePaths(["/admin", "/admin/products", "/admin/inventory", "/shop"])

  return {
    status: "success",
    message: `${ids.length} product${ids.length === 1 ? "" : "s"} updated.`,
  }
}

export async function updateInventoryStockAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))
  const stock = Math.max(0, normalizeNumber(formData.get("stock")))
  const reason =
    normalizeOptionalString(formData.get("reason")) ?? "Inventory quick update"

  if (!id) {
    return
  }

  const { supabase, row } = await getProductRow(id)

  if (!row) {
    return
  }

  const changedBy = await getAdminActorEmail()
  await saveProductStockChange(supabase, row, {
    stock,
    reason,
    changedBy,
  })
}

export async function updateInventoryStockStateAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeRequiredString(formData.get("id"))
  const stock = Math.max(0, normalizeNumber(formData.get("stock")))
  const reason =
    normalizeOptionalString(formData.get("reason")) ?? "Inventory quick update"

  if (!id) {
    return {
      status: "error",
      message: "Product id is missing.",
    }
  }

  const { supabase, row, error } = await getProductRow(id)

  if (error || !row) {
    return {
      status: "error",
      message: error?.message || "Product not found.",
    }
  }

  try {
    const changedBy = await getAdminActorEmail()
    await saveProductStockChange(supabase, row, {
      stock,
      reason,
      changedBy,
    })
  } catch (updateError) {
    return {
      status: "error",
      message:
        updateError instanceof Error ? updateError.message : "Unable to update stock.",
    }
  }

  return {
    status: "success",
    message: "Stock updated.",
  }
}

export async function importInventoryCsvAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Upload a CSV file first.",
    }
  }

  const text = await file.text()
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return {
      status: "error",
      message: "CSV must include a header and at least one row.",
    }
  }

  const header = parseCsvLine(lines[0]).map((value) => value.toLowerCase())
  const slugIndex = header.indexOf("slug")
  const stockIndex = header.indexOf("stock")

  if (slugIndex === -1 || stockIndex === -1) {
    return {
      status: "error",
      message: "CSV must include slug and stock columns.",
    }
  }

  const records = lines.slice(1).flatMap((line) => {
    const cells = parseCsvLine(line)
    const slug = cells[slugIndex]?.replace(/^"|"$/g, "").trim()
    const stockValue = Number(cells[stockIndex]?.replace(/^"|"$/g, "").trim())

    if (!slug || !Number.isFinite(stockValue)) {
      return []
    }

    return [
      {
        slug,
        stock: Math.max(0, stockValue),
      },
    ]
  })

  if (records.length === 0) {
    return {
      status: "error",
      message: "No valid inventory rows found in the CSV.",
    }
  }

  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in(
      "slug",
      records.map((record) => record.slug),
    )

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to load products for CSV import.",
    }
  }

  const productsBySlug = new Map(
    (products ?? []).map((product) => [String(product.slug), product as GenericRow]),
  )

  const changedBy = await getAdminActorEmail()
  let updatedCount = 0
  let skippedCount = 0

  for (const record of records) {
    const row = productsBySlug.get(record.slug)

    if (!row) {
      skippedCount += 1
      continue
    }

    try {
      await saveProductStockChange(supabase, row, {
        stock: record.stock,
        reason: "CSV import",
        changedBy,
      })
      updatedCount += 1
    } catch {
      skippedCount += 1
    }
  }

  return {
    status: "success",
    message: `${updatedCount} updated, ${skippedCount} skipped.`,
  }
}

export async function saveCustomerNoteAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const lookupKey = normalizeRequiredString(formData.get("lookupKey"))
  const note = normalizeOptionalString(formData.get("note"))
  const customerName = normalizeOptionalString(formData.get("customerName"))
  const phone = normalizeOptionalString(formData.get("phone"))

  if (!lookupKey) {
    return {
      status: "error",
      message: "Customer lookup key is missing.",
    }
  }

  const supabase = await createClient()
  const key = buildCustomerNoteSettingKey(lookupKey)
  const { data: existingRow, error: selectError } = await supabase
    .from("settings")
    .select("key")
    .eq("key", key)
    .maybeSingle()

  if (selectError) {
    return {
      status: "error",
      message: selectError.message || "Unable to load customer note.",
    }
  }

  const payload = {
    key,
    value: {
      lookup_key: lookupKey,
      customer_name: customerName,
      phone,
      note,
    },
    updated_at: new Date().toISOString(),
  }

  const result = existingRow
    ? await supabase.from("settings").update(payload).eq("key", key)
    : await supabase.from("settings").insert(payload)

  if (result.error) {
    return {
      status: "error",
      message: result.error.message || "Unable to save customer note.",
    }
  }

  revalidatePaths([
    "/admin/customers",
    `/admin/customers/${encodeURIComponent(lookupKey)}`,
  ])

  return {
    status: "success",
    message: "Customer note saved.",
  }
}

export async function saveProductAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const name = normalizeRequiredString(formData.get("name"))
  const slugInput = normalizeRequiredString(formData.get("slug"))
  const slug = slugify(slugInput || name)
  const price = normalizeNumber(formData.get("price"))
  const comparePrice = normalizeNumber(formData.get("comparePrice"))
  const stock = Math.max(0, normalizeNumber(formData.get("stock")))
  const sku = normalizeOptionalString(formData.get("sku"))
  const lowStockThreshold = Math.max(0, normalizeNumber(formData.get("lowStockThreshold")))
  const category = normalizeRequiredString(formData.get("category"))
  const brand = normalizeOptionalString(formData.get("brand"))
  const badge = normalizeOptionalString(formData.get("badge"))
  const description = normalizeOptionalString(formData.get("description"))
  const metaTitle = normalizeOptionalString(formData.get("metaTitle"))
  const metaDescription = normalizeOptionalString(formData.get("metaDescription"))
  const specsInput = normalizeRequiredString(formData.get("specs"))
  const active = formData.has("active")
  const existingImages = normalizeRequiredString(formData.get("existingImages"))
  const newImageTokens = parseJsonStringArray(normalizeRequiredString(formData.get("newImageTokens")))
  const imageOrder = parseProductImageOrder(normalizeRequiredString(formData.get("imageOrder")))

  if (!name || !slug) {
    return {
      status: "error",
      message: "Name and slug are required.",
    }
  }

  if (price <= 0) {
    return {
      status: "error",
      message: "Price must be greater than zero.",
    }
  }

  if (!ADMIN_PRODUCT_CATEGORIES.includes(category as (typeof ADMIN_PRODUCT_CATEGORIES)[number])) {
    return {
      status: "error",
      message: "Invalid product category.",
    }
  }

  if (badge && !ADMIN_PRODUCT_BADGES.includes(badge as (typeof ADMIN_PRODUCT_BADGES)[number])) {
    return {
      status: "error",
      message: "Invalid product badge.",
    }
  }

  let specs = null
  try {
    specs = parseSpecsInput(specsInput)
  } catch {
    return {
      status: "error",
      message: "Specs must be valid JSON.",
    }
  }

  const persistedImages = parseJsonStringArray(existingImages)
  const incomingFiles = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (persistedImages.length + incomingFiles.length > 6) {
    return {
      status: "error",
      message: "You can upload a maximum of 6 images.",
    }
  }

  const supabase = await createClient()
  const supportedColumns = await getSupportedProductColumns(supabase)
  const existingRow = id ? ((await getProductRow(id)).row ?? null) : null
  const uploadedImagesByToken = new Map<string, string>()
  const uploadedImages: string[] = []

  try {
    for (let index = 0; index < incomingFiles.length; index += 1) {
      const file = incomingFiles[index]
      const token =
        newImageTokens[index] ??
        `${file.name}-${file.size}-${file.lastModified}-${index}`
      const uploadedUrl = await uploadImageToBucket("products", file, `${slug}-${index + 1}`)
      uploadedImagesByToken.set(token, uploadedUrl)
      uploadedImages.push(uploadedUrl)
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to upload product image.",
    }
  }

  const finalImages =
    imageOrder.length > 0
      ? imageOrder
          .map((entry) => {
            if (entry.kind === "existing") {
              return persistedImages.includes(entry.value) ? entry.value : null
            }

            return uploadedImagesByToken.get(entry.value) ?? null
          })
          .filter((image): image is string => Boolean(image))
      : [...persistedImages, ...uploadedImages]

  const payload: Record<string, unknown> = {
    name,
    slug,
    price,
    compare_price: comparePrice > 0 ? comparePrice : null,
    images: finalImages,
    category,
    brand,
    badge,
    stock,
    description,
    specs,
    active,
  }

  setProductValue(payload, existingRow, supportedColumns, ["sku"], sku)
  setProductValue(
    payload,
    existingRow,
    supportedColumns,
    ["low_stock_threshold"],
    lowStockThreshold > 0 ? lowStockThreshold : null,
  )
  setProductValue(payload, existingRow, supportedColumns, ["meta_title"], metaTitle)
  setProductValue(
    payload,
    existingRow,
    supportedColumns,
    ["meta_description"],
    metaDescription,
  )
  setProductValue(
    payload,
    existingRow,
    supportedColumns,
    ["updated_at"],
    new Date().toISOString(),
  )

  if (id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("id, slug")
      .single()

    if (error || !data) {
      return {
        status: "error",
        message: error?.message || "Unable to update product.",
      }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    revalidatePath("/admin/inventory")
    revalidatePath("/shop")
    revalidatePath(`/shop/${data.slug}`)
    revalidatePath(`/product/${data.slug}`)

    return {
      status: "success",
      message: "Product updated.",
      redirectTo: `/admin/products/${id}`,
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id, slug")
    .single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create product.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/admin/inventory")
  revalidatePath("/shop")
  revalidatePath(`/shop/${data.slug}`)
  revalidatePath(`/product/${data.slug}`)

  return {
    status: "success",
    message: "Product created.",
    redirectTo: `/admin/products/${data.id}`,
  }
}

export async function saveDropAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const previousSlug = normalizeOptionalString(formData.get("previousSlug"))
  const title =
    normalizeRequiredString(formData.get("name")) ||
    normalizeRequiredString(formData.get("title"))
  const slugInput = normalizeRequiredString(formData.get("slug"))
  const slug = slugify(slugInput || title)
  const status = normalizeRequiredString(formData.get("status")).toUpperCase()
  const description = normalizeOptionalString(formData.get("description"))
  const dropDate = normalizeOptionalString(formData.get("dropDate"))
  const endDate = normalizeOptionalString(formData.get("endDate"))
  const isFeatured = formData.has("isFeatured")
  const existingCoverImage = normalizeOptionalString(formData.get("existingCoverImage"))
  const existingTeaserImage = normalizeOptionalString(formData.get("existingTeaserImage"))
  const selectedProductIds = parseJsonStringArray(
    normalizeRequiredString(formData.get("selectedProductIds")),
  )
  const coverImage = formData.get("coverImage")
  const teaserImage = formData.get("teaserImage")

  if (!title || !slug) {
    return {
      status: "error",
      message: "Drop title and slug are required.",
    }
  }

  if (!dropDate) {
    return {
      status: "error",
      message: "Drop date is required.",
    }
  }

  if (!ADMIN_DROP_STATUSES.includes(status as (typeof ADMIN_DROP_STATUSES)[number])) {
    return {
      status: "error",
      message: "Invalid drop status selected.",
    }
  }

  let coverImageUrl = existingCoverImage
  let teaserImageUrl = existingTeaserImage
  const supabase = await createClient()
  const supportedColumns = await getSupportedDropColumns(supabase)
  const existingRow = id
    ? (((await supabase.from("drop_events").select("*").eq("id", id).maybeSingle()).data ??
        null) as GenericRow | null)
    : null

  try {
    if (coverImage instanceof File && coverImage.size > 0) {
      coverImageUrl = await uploadImageToBucket("drops", coverImage, `${slug}-cover`)
    }

    if (teaserImage instanceof File && teaserImage.size > 0) {
      teaserImageUrl = await uploadImageToBucket("drops", teaserImage, `${slug}-teaser`)
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload drop images.",
    }
  }

  const payload: Record<string, unknown> = {
    title,
    slug,
    status,
    description,
    drop_date: dropDate,
    cover_image: coverImageUrl,
  }

  setDropValue(payload, existingRow, supportedColumns, ["end_date"], endDate)
  setDropValue(payload, existingRow, supportedColumns, ["teaser_image"], teaserImageUrl)
  setDropValue(payload, existingRow, supportedColumns, ["is_featured", "featured"], isFeatured)
  setDropValue(payload, existingRow, supportedColumns, ["updated_at"], new Date().toISOString())

  const syncDropProducts = async (dropId: string) => {
    const { error: deleteError } = await supabase
      .from("drop_event_products")
      .delete()
      .eq("drop_id", dropId)

    if (deleteError) {
      throw new Error(deleteError.message || "Unable to clear drop products.")
    }

    if (selectedProductIds.length === 0) {
      return
    }

    const { error: insertError } = await supabase.from("drop_event_products").insert(
      selectedProductIds.map((productId) => ({
        drop_id: dropId,
        product_id: productId,
      })),
    )

    if (insertError) {
      throw new Error(insertError.message || "Unable to save drop products.")
    }
  }

  if (id) {
    const { data, error } = await supabase
      .from("drop_events")
      .update(payload)
      .eq("id", id)
      .select("id, slug")
      .single()

    if (error || !data) {
      return {
        status: "error",
        message: error?.message || "Unable to update drop.",
      }
    }

    try {
      await syncDropProducts(data.id)
    } catch (syncError) {
      return {
        status: "error",
        message: syncError instanceof Error ? syncError.message : "Unable to save drop products.",
      }
    }

    revalidatePaths([
      "/admin",
      "/admin/drops",
      "/drops",
      "/",
      `/drops/${data.slug}`,
      previousSlug ? `/drops/${previousSlug}` : "",
    ])

    return {
      status: "success",
      message: "Drop updated.",
      redirectTo: `/admin/drops/${data.id}`,
    }
  }

  const { data, error } = await supabase
    .from("drop_events")
    .insert(payload)
    .select("id, slug")
    .single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create drop.",
    }
  }

  try {
    await syncDropProducts(data.id)
  } catch (syncError) {
    return {
      status: "error",
      message: syncError instanceof Error ? syncError.message : "Unable to save drop products.",
    }
  }

  revalidatePaths(["/admin", "/admin/drops", "/drops", "/", `/drops/${data.slug}`])

  return {
    status: "success",
    message: "Drop created.",
    redirectTo: `/admin/drops/${data.id}`,
  }
}

export async function deleteDropAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))
  const slug = normalizeOptionalString(formData.get("slug"))

  if (!id) {
    redirect("/admin/drops")
  }

  const supabase = await createClient()
  await supabase.from("drop_event_products").delete().eq("drop_id", id)
  await supabase.from("drop_events").delete().eq("id", id)

  revalidatePaths(["/admin", "/admin/drops", "/drops", "/", slug ? `/drops/${slug}` : ""])
  redirect("/admin/drops")
}

export async function savePostAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const title = normalizeRequiredString(formData.get("title"))
  const slugInput = normalizeRequiredString(formData.get("slug"))
  const slug = slugify(slugInput || title)
  const category = normalizeRequiredString(formData.get("category")).toUpperCase()
  const excerpt = normalizeOptionalString(formData.get("excerpt"))
  const content = normalizeOptionalString(formData.get("content"))
  const published = formData.has("published")
  const publishedAtInput = normalizeOptionalString(formData.get("publishedAt"))
  const existingCoverImage = normalizeOptionalString(formData.get("existingCoverImage"))
  const coverImage = formData.get("coverImage")

  if (!title || !slug) {
    return {
      status: "error",
      message: "Post title and slug are required.",
    }
  }

  if (
    category &&
    !ADMIN_POST_CATEGORIES.includes(category as (typeof ADMIN_POST_CATEGORIES)[number])
  ) {
    return {
      status: "error",
      message: "Invalid post category.",
    }
  }

  let coverImageUrl = existingCoverImage

  try {
    if (coverImage instanceof File && coverImage.size > 0) {
      coverImageUrl = await uploadImageToBucket("posts", coverImage, `${slug}-post`)
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload post cover image.",
    }
  }

  const payload = {
    title,
    slug,
    category,
    excerpt,
    content,
    cover_image: coverImageUrl,
    published,
    published_at:
      published
        ? publishedAtInput ?? new Date().toISOString()
        : null,
  }

  const supabase = await createClient()

  if (id) {
    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error || !data) {
      return {
        status: "error",
        message: error?.message || "Unable to update post.",
      }
    }

    revalidatePaths(["/admin", "/admin/posts", "/"])

    return {
      status: "success",
      message: "Post updated.",
      redirectTo: `/admin/posts/${data.id}`,
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("id")
    .single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create post.",
    }
  }

  revalidatePaths(["/admin", "/admin/posts", "/"])

  return {
    status: "success",
    message: "Post created.",
    redirectTo: `/admin/posts/${data.id}`,
  }
}

export async function deletePostAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/posts")
  }

  const supabase = await createClient()
  await supabase.from("posts").delete().eq("id", id)

  revalidatePaths(["/admin", "/admin/posts", "/"])
  redirect("/admin/posts")
}

export async function saveBannerAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const title = normalizeRequiredString(formData.get("title"))
  const tag = normalizeOptionalString(formData.get("tag"))
  const ctaText = normalizeOptionalString(formData.get("ctaText"))
  const ctaLink = normalizeOptionalString(formData.get("ctaLink"))
  const order = Math.max(0, normalizeNumber(formData.get("order")))
  const active = formData.has("active")
  const existingImageUrl = normalizeOptionalString(formData.get("existingImageUrl"))
  const image = formData.get("image")

  if (!title) {
    return {
      status: "error",
      message: "Banner title is required.",
    }
  }

  if (!ctaText) {
    return {
      status: "error",
      message: "CTA button text is required.",
    }
  }

  if (!ctaLink) {
    return {
      status: "error",
      message: "CTA link is required.",
    }
  }

  let imageUrl = existingImageUrl

  try {
    if (image instanceof File && image.size > 0) {
      imageUrl = await uploadImageToBucket("banners", image, slugify(title || "banner"))
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload banner image.",
    }
  }

  const supabase = await createClient()
  let resolvedOrder = order

  if (resolvedOrder <= 0) {
    if (id) {
      const currentOrder = await supabase.from("banners").select("order").eq("id", id).maybeSingle()
      resolvedOrder =
        currentOrder.data && typeof currentOrder.data.order === "number"
          ? currentOrder.data.order
          : 0
    }

    if (resolvedOrder <= 0) {
      const highestOrder = await supabase
        .from("banners")
        .select("order")
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle()

      resolvedOrder =
        highestOrder.data && typeof highestOrder.data.order === "number"
          ? highestOrder.data.order + 1
          : 1
    }
  }

  const payload = {
    title,
    tag,
    image_url: imageUrl,
    cta_text: ctaText,
    cta_link: ctaLink,
    order: resolvedOrder,
    active,
  }

  if (id) {
    const { data, error } = await supabase
      .from("banners")
      .update(payload)
      .eq("id", id)
      .select("id")
      .single()

    if (error || !data) {
      return {
        status: "error",
        message: error?.message || "Unable to update banner.",
      }
    }

    revalidatePaths(["/admin", "/admin/banners", "/"])

    return {
      status: "success",
      message: "Banner updated.",
      redirectTo: `/admin/banners?id=${data.id}`,
    }
  }

  const { data, error } = await supabase
    .from("banners")
    .insert(payload)
    .select("id")
    .single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create banner.",
    }
  }

  revalidatePaths(["/admin", "/admin/banners", "/"])

  return {
    status: "success",
    message: "Banner created.",
    redirectTo: `/admin/banners?id=${data.id}`,
  }
}

export async function toggleBannerActiveAction(id: string, nextActive: boolean) {
  const bannerId = id.trim()

  if (!bannerId) {
    return {
      status: "error" as const,
      message: "Banner id is missing.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("banners")
    .update({
      active: nextActive,
    })
    .eq("id", bannerId)

  if (error) {
    return {
      status: "error" as const,
      message: error.message || "Unable to update banner status.",
    }
  }

  revalidatePaths(["/admin", "/admin/banners", "/"])

  return {
    status: "success" as const,
    message: "Banner status updated.",
  }
}

export async function reorderBannersAction(orderedIds: string[]) {
  const ids = orderedIds.map((value) => value.trim()).filter(Boolean)

  if (ids.length === 0) {
    return {
      status: "error" as const,
      message: "No banners to reorder.",
    }
  }

  const supabase = await createClient()

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from("banners")
      .update({
        order: index + 1,
      })
      .eq("id", id)

    if (error) {
      return {
        status: "error" as const,
        message: error.message || "Unable to reorder banners.",
      }
    }
  }

  revalidatePaths(["/admin", "/admin/banners", "/"])

  return {
    status: "success" as const,
    message: "Banner order updated.",
  }
}

export async function deleteBannerAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/banners")
  }

  const supabase = await createClient()
  await supabase.from("banners").delete().eq("id", id)

  revalidatePaths(["/admin", "/admin/banners", "/"])
  redirect("/admin/banners")
}

export async function saveParkAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const name = normalizeRequiredString(formData.get("name"))
  const slugInput = normalizeOptionalString(formData.get("slug"))
  const slug = slugify(slugInput || name)
  const description = normalizeOptionalString(formData.get("description"))
  const location = normalizeOptionalString(formData.get("location"))
  const city = normalizeRequiredString(formData.get("city"))
  const difficulty = normalizeRequiredString(formData.get("difficulty")).toLowerCase()
  const active = formData.has("active")
  const existingPhotos = parseJsonStringArray(
    normalizeRequiredString(formData.get("existingPhotos")),
  ).slice(0, 6)
  const photoFiles = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (!name) {
    return {
      status: "error",
      message: "Park name is required.",
    }
  }

  if (!slug) {
    return {
      status: "error",
      message: "Park slug is required.",
    }
  }

  if (!city) {
    return {
      status: "error",
      message: "City is required.",
    }
  }

  if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
    return {
      status: "error",
      message: "Difficulty must be beginner, intermediate, or advanced.",
    }
  }

  const supabase = await createClient()
  const tableName = await getParkTableName(supabase, id)
  const supportedColumns = await getSupportedParkColumns(supabase, tableName)
  const existingRow = id
    ? (((await supabase.from(tableName).select("*").eq("id", id).maybeSingle()).data ??
        null) as GenericRow | null)
    : null

  if (id && !existingRow) {
    return {
      status: "error",
      message: "Park not found.",
    }
  }

  const uploadedPhotos: string[] = []

  try {
    const uploadLimit = Math.max(0, 6 - existingPhotos.length)
    for (const [index, file] of photoFiles.slice(0, uploadLimit).entries()) {
      uploadedPhotos.push(await uploadImageToBucket("parks", file, `${slug}-${index + 1}`))
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload park photos.",
    }
  }

  const photos = [...existingPhotos, ...uploadedPhotos].slice(0, 6)
  const payload: Record<string, unknown> = {
    name,
    city,
  }

  setParkValue(payload, existingRow, supportedColumns, ["slug"], slug)
  setParkValue(payload, existingRow, supportedColumns, ["description"], description)
  setParkValue(payload, existingRow, supportedColumns, ["location", "address"], location)
  setParkValue(payload, existingRow, supportedColumns, ["difficulty"], difficulty)
  setParkValue(payload, existingRow, supportedColumns, ["photos"], photos)
  setParkValue(
    payload,
    existingRow,
    supportedColumns,
    ["photo", "image", "image_url", "thumbnail"],
    photos[0] ?? null,
  )
  setParkValue(payload, existingRow, supportedColumns, ["active", "open", "is_open"], active)
  setParkValue(payload, existingRow, supportedColumns, ["updated_at"], new Date().toISOString())

  if (id) {
    const { error } = await supabase.from(tableName).update(payload).eq("id", id)

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to update park.",
      }
    }

    revalidatePaths(["/admin/parks", "/skateparks", "/"])

    return {
      status: "success",
      message: "Park updated.",
      redirectTo: `/admin/parks?id=${id}`,
    }
  }

  const { data, error } = await supabase.from(tableName).insert(payload).select("id").single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create park.",
    }
  }

  revalidatePaths(["/admin/parks", "/skateparks", "/"])

  return {
    status: "success",
    message: "Park created.",
    redirectTo: `/admin/parks?id=${data.id}`,
  }
}

export async function deleteParkAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/parks")
  }

  const supabase = await createClient()
  const tableName = await getParkTableName(supabase, id)
  await supabase.from(tableName).delete().eq("id", id)

  revalidatePaths(["/admin/parks", "/skateparks", "/"])
  redirect("/admin/parks")
}

export async function saveVideoAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const title = normalizeRequiredString(formData.get("title"))
  const slugInput = normalizeOptionalString(formData.get("slug"))
  const slug = slugify(slugInput || title)
  const youtubeUrl = normalizeRequiredString(formData.get("youtubeUrl"))
  const category = normalizeRequiredString(formData.get("category")).toLowerCase()
  const published = formData.has("published")
  const thumbnailMode = normalizeRequiredString(formData.get("thumbnailMode")) || "auto"
  const existingThumbnailUrl = normalizeOptionalString(formData.get("existingThumbnailUrl"))
  const thumbnailFile = formData.get("thumbnailFile")

  if (!title) {
    return {
      status: "error",
      message: "Video title is required.",
    }
  }

  if (!youtubeUrl) {
    return {
      status: "error",
      message: "YouTube URL is required.",
    }
  }

  const supabase = await createClient()
  const supportedColumns = await getSupportedVideoColumns(supabase)
  const existingRow = id
    ? (((await supabase.from("videos").select("*").eq("id", id).maybeSingle()).data ??
        null) as GenericRow | null)
    : null

  if (id && !existingRow) {
    return {
      status: "error",
      message: "Video not found.",
    }
  }

  const videoId = extractYouTubeVideoId(youtubeUrl)

  if (!videoId) {
    return {
      status: "error",
      message: "Please enter a valid YouTube URL.",
    }
  }

  if (!["edit", "trick", "spot", "community"].includes(category)) {
    return {
      status: "error",
      message: "Invalid video category.",
    }
  }

  const autoThumbnailUrl = getYouTubeThumbnailUrl(videoId)
  let thumbnailUrl = thumbnailMode === "manual" ? existingThumbnailUrl : autoThumbnailUrl

  try {
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      thumbnailUrl = await uploadImageToBucket("videos", thumbnailFile, `${slug}-thumb`)
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload video thumbnail.",
    }
  }

  const publishedAtKey = existingRow
    ? findExistingKey(existingRow, ["published_at", "published_date"])
    : null
  const existingPublishedAt =
    publishedAtKey && existingRow ? normalizeUnknownString(existingRow[publishedAtKey]) : null
  const publishedAt = published ? existingPublishedAt ?? new Date().toISOString() : null

  const payload: Record<string, unknown> = {
    title,
    youtube_url: youtubeUrl,
    category,
  }

  setVideoValue(payload, existingRow, supportedColumns, ["slug"], slug)
  setVideoValue(
    payload,
    existingRow,
    supportedColumns,
    ["thumbnail_url", "thumbnail", "image_url", "image"],
    thumbnailUrl,
  )
  setVideoValue(payload, existingRow, supportedColumns, ["published", "active"], published)
  setVideoValue(
    payload,
    existingRow,
    supportedColumns,
    ["published_at", "published_date"],
    publishedAt,
  )
  setVideoValue(payload, existingRow, supportedColumns, ["updated_at"], new Date().toISOString())

  if (id) {
    const { error } = await supabase.from("videos").update(payload).eq("id", id)

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to update video.",
      }
    }

    revalidatePaths(["/admin/videos", "/videos", "/"])

    return {
      status: "success",
      message: "Video updated.",
      redirectTo: `/admin/videos?id=${id}`,
    }
  }

  const { data, error } = await supabase.from("videos").insert(payload).select("id").single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create video.",
    }
  }

  revalidatePaths(["/admin/videos", "/videos", "/"])

  return {
    status: "success",
    message: "Video created.",
    redirectTo: `/admin/videos?id=${data.id}`,
  }
}

export async function deleteVideoAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/videos")
  }

  const supabase = await createClient()
  await supabase.from("videos").delete().eq("id", id)

  revalidatePaths(["/admin/videos", "/videos", "/"])
  redirect("/admin/videos")
}

async function getDiscountTableName() {
  const supabase = await createClient()
  const probe = await supabase
    .from("discount_codes")
    .select("id", { count: "exact", head: true })

  return probe.error ? "discounts" : "discount_codes"
}

export async function saveDiscountAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = normalizeOptionalString(formData.get("id"))
  const code = normalizeRequiredString(formData.get("code")).toUpperCase()
  const type = normalizeRequiredString(formData.get("type")).toLowerCase()
  const value = Math.max(0, normalizeNumber(formData.get("value")))
  const minOrder = Math.max(0, normalizeNumber(formData.get("minOrder")))
  const maxUses = Math.max(0, normalizeNumber(formData.get("maxUses")))
  const expiresAt = normalizeOptionalString(formData.get("expiresAt"))
  const active = formData.has("active")

  if (!code) {
    return {
      status: "error",
      message: "Discount code is required.",
    }
  }

  if (type !== "percent" && type !== "fixed") {
    return {
      status: "error",
      message: "Discount type is invalid.",
    }
  }

  if (value <= 0) {
    return {
      status: "error",
      message: "Discount value must be greater than zero.",
    }
  }

  const payload = {
    code,
    type,
    value,
    min_order: minOrder > 0 ? minOrder : 0,
    max_uses: maxUses > 0 ? maxUses : 0,
    expires_at: expiresAt,
    active,
  }

  const supabase = await createClient()
  const table = await getDiscountTableName()

  const duplicateCheck = await supabase
    .from(table)
    .select("id")
    .eq("code", code)
    .neq("id", id ?? "")
    .limit(1)
    .maybeSingle()

  if (duplicateCheck.data) {
    return {
      status: "error",
      message: "This discount code already exists.",
    }
  }

  if (id) {
    const { error } = await supabase.from(table).update(payload).eq("id", id)

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to update discount.",
      }
    }

    revalidatePaths(["/admin/discounts", "/shop"])

    return {
      status: "success",
      message: "Discount updated.",
      redirectTo: `/admin/discounts?id=${id}`,
    }
  }

  const { data, error } = await supabase.from(table).insert(payload).select("id").single()

  if (error || !data) {
    return {
      status: "error",
      message: error?.message || "Unable to create discount.",
    }
  }

  revalidatePaths(["/admin/discounts", "/shop"])

  return {
    status: "success",
    message: "Discount created.",
    redirectTo: `/admin/discounts?id=${data.id}`,
  }
}

export async function deleteDiscountAction(formData: FormData) {
  const id = normalizeRequiredString(formData.get("id"))

  if (!id) {
    redirect("/admin/discounts")
  }

  const supabase = await createClient()
  const table = await getDiscountTableName()
  await supabase.from(table).delete().eq("id", id)

  revalidatePaths(["/admin/discounts", "/shop"])
  redirect("/admin/discounts")
}

export async function saveSettingsAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const shopName = normalizeRequiredString(formData.get("shopName"))
  const shopSlug = slugify(shopName || "goofy-shop")
  const logoFile = formData.get("logoFile")
  const paymentQrFile = formData.get("paymentQrFile")
  let logoUrl = normalizeOptionalString(formData.get("existingLogoUrl"))
  let paymentQrUrl = normalizeOptionalString(formData.get("existingPaymentQrUrl"))

  if (!shopName) {
    return {
      status: "error",
      message: "Shop name is required.",
    }
  }

  try {
    if (logoFile instanceof File && logoFile.size > 0) {
      logoUrl = await uploadImageToBucket("settings", logoFile, `${shopSlug}-logo`)
    }

    if (paymentQrFile instanceof File && paymentQrFile.size > 0) {
      paymentQrUrl = await uploadImageToBucket("settings", paymentQrFile, `${shopSlug}-payment-qr`)
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to upload settings images.",
    }
  }

  const rows = [
    {
      key: "shop_info",
      value: {
        shop_name: shopName,
        shop_tagline: normalizeOptionalString(formData.get("shopTagline")),
        shop_email: normalizeOptionalString(formData.get("shopEmail")),
        shop_phone: normalizeOptionalString(formData.get("shopPhone")),
        shop_address: normalizeOptionalString(formData.get("shopAddress")),
        logo_url: logoUrl,
      },
    },
    {
      key: "bank_transfer",
      value: {
        bank_name: normalizeOptionalString(formData.get("bankName")),
        bank_account_name: normalizeOptionalString(formData.get("bankAccountName")),
        bank_account_number: normalizeOptionalString(formData.get("bankAccountNumber")),
        qr_code_url: paymentQrUrl,
        payment_instructions: normalizeOptionalString(formData.get("paymentInstructions")),
      },
    },
    {
      key: "shipping",
      value: {
        free_shipping_threshold: Math.max(
          0,
          normalizeNumber(formData.get("freeShippingThreshold")),
        ),
        shipping_fee: Math.max(0, normalizeNumber(formData.get("shippingFee"))),
        estimated_delivery_days: normalizeOptionalString(formData.get("estimatedDeliveryDays")),
        supported_cities: formData
          .getAll("supportedCities")
          .flatMap((entry) =>
            typeof entry === "string" && entry.trim().length > 0 ? [entry.trim()] : [],
          ),
      },
    },
    {
      key: "social_links",
      value: {
        instagram: normalizeOptionalString(formData.get("instagram")),
        facebook: normalizeOptionalString(formData.get("facebook")),
        tiktok: normalizeOptionalString(formData.get("tiktok")),
        youtube: normalizeOptionalString(formData.get("youtube")),
        line_id: normalizeOptionalString(formData.get("lineId")),
      },
    },
    {
      key: "notifications",
      value: {
        notification_email: normalizeOptionalString(formData.get("notificationEmail")),
        line_notify_token: normalizeOptionalString(formData.get("lineNotifyToken")),
        default_low_stock_threshold: Math.max(
          0,
          normalizeNumber(formData.get("defaultLowStockThreshold")),
        ),
        notify_stock_below: Math.max(0, normalizeNumber(formData.get("notifyStockBelow"))),
      },
    },
  ]

  const supabase = await createClient()
  const settingsStorageMode = await getSettingsStorageMode(supabase)

  let error: { message?: string } | null = null

  if (settingsStorageMode === "single-row") {
    const lowStockThreshold = Math.max(
      0,
      normalizeNumber(formData.get("notifyStockBelow")) ||
        normalizeNumber(formData.get("defaultLowStockThreshold")),
    )

    const payload = {
      id: 1,
      shop_name: shopName,
      tagline: normalizeOptionalString(formData.get("shopTagline")),
      address: normalizeOptionalString(formData.get("shopAddress")),
      phone: normalizeOptionalString(formData.get("shopPhone")),
      email: normalizeOptionalString(formData.get("shopEmail")),
      logo_url: logoUrl,
      bank_name: normalizeOptionalString(formData.get("bankName")),
      bank_account: normalizeOptionalString(formData.get("bankAccountNumber")),
      bank_account_name: normalizeOptionalString(formData.get("bankAccountName")),
      bank_qr_url: paymentQrUrl,
      payment_instructions: normalizeOptionalString(formData.get("paymentInstructions")),
      shipping_cost: Math.max(0, normalizeNumber(formData.get("shippingFee"))),
      free_shipping_threshold: Math.max(
        0,
        normalizeNumber(formData.get("freeShippingThreshold")),
      ),
      delivery_days: normalizeOptionalString(formData.get("estimatedDeliveryDays")),
      low_stock_threshold: lowStockThreshold,
      instagram: normalizeOptionalString(formData.get("instagram")),
      facebook: normalizeOptionalString(formData.get("facebook")),
      tiktok: normalizeOptionalString(formData.get("tiktok")),
      youtube: normalizeOptionalString(formData.get("youtube")),
      line_id: normalizeOptionalString(formData.get("lineId")),
      admin_email: normalizeOptionalString(formData.get("notificationEmail")),
      line_notify_token: normalizeOptionalString(formData.get("lineNotifyToken")),
      updated_at: new Date().toISOString(),
    }

    const upsertResult = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "id" })

    error = upsertResult.error
  } else {
    const upsertResult = await upsertSettingsRows(supabase, rows)
    error = upsertResult.error
  }

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to save settings.",
    }
  }

  revalidatePaths(["/admin", "/admin/settings"])

  return {
    status: "success",
    message: "Settings saved.",
  }
}

export async function inviteAdminUserAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = normalizeRequiredString(formData.get("email")).toLowerCase()

  if (!email) {
    return {
      status: "error",
      message: "Admin email is required.",
    }
  }

  const adminClient = getSupabaseAdminClient()

  if (!adminClient) {
    return {
      status: "error",
      message: "SUPABASE_SERVICE_ROLE_KEY is required to invite admin users.",
    }
  }

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to invite admin user.",
    }
  }

  revalidatePath("/admin/settings")

  return {
    status: "success",
    message: `Invite sent to ${email}.`,
  }
}

export async function revokeAdminUserAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const userId = normalizeRequiredString(formData.get("userId"))
  const email = normalizeOptionalString(formData.get("email"))

  if (!userId) {
    return {
      status: "error",
      message: "Admin user id is missing.",
    }
  }

  const currentAdminEmail = await getAdminActorEmail()

  if (email && email.toLowerCase() === currentAdminEmail.toLowerCase()) {
    return {
      status: "error",
      message: "You cannot revoke the currently signed-in admin.",
    }
  }

  const adminClient = getSupabaseAdminClient()

  if (!adminClient) {
    return {
      status: "error",
      message: "SUPABASE_SERVICE_ROLE_KEY is required to revoke admin users.",
    }
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to revoke admin access.",
    }
  }

  revalidatePath("/admin/settings")

  return {
    status: "success",
    message: email ? `Access revoked for ${email}.` : "Admin access revoked.",
  }
}
