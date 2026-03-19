import type { ShopProduct } from "@/lib/shop"

type GenericRow = Record<string, unknown>

export type DropStatus = "active" | "upcoming" | "past"

export interface DropEvent {
  id: string
  slug: string
  title: string
  description: string
  status: DropStatus
  rawStatus: string | null
  dropDate: string | null
  endDate: string | null
  coverImage: string | null
  teaserImage: string | null
  products: ShopProduct[]
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

function normalizeProduct(row: GenericRow): ShopProduct {
  const images = asArray(row.images)
    .map((image) => asString(image))
    .filter((image): image is string => Boolean(image))

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    name: pickString(row, ["name"]) ?? "Untitled product",
    slug: pickString(row, ["slug"]) ?? "untitled-product",
    price: Number(row.price ?? 0) || 0,
    compare_price:
      typeof row.compare_price === "number"
        ? row.compare_price
        : typeof row.compare_price === "string" && row.compare_price.trim().length > 0
          ? Number(row.compare_price)
          : null,
    images,
    category: pickString(row, ["category"]),
    brand: pickString(row, ["brand"]),
    badge: pickString(row, ["badge"]),
    stock: Number(row.stock ?? 0) || 0,
    description: pickString(row, ["description"]),
    specs:
      typeof row.specs === "object" && row.specs !== null && !Array.isArray(row.specs)
        ? (row.specs as Record<string, unknown>)
        : null,
    active: row.active !== false,
    created_at: pickString(row, ["created_at"]),
  }
}

export function normalizeDropStatus(
  rawStatus?: string | null,
  dropDate?: string | null,
  endDate?: string | null,
): DropStatus {
  const normalized = (rawStatus ?? "").trim().toLowerCase()
  const now = Date.now()
  const dropTimestamp = dropDate ? new Date(dropDate).getTime() : Number.NaN
  const endTimestamp = endDate ? new Date(endDate).getTime() : Number.NaN

  if (normalized === "live" || normalized === "active" || normalized === "now_live") {
    return "active"
  }

  if (normalized === "upcoming" || normalized === "scheduled" || normalized === "soon") {
    return "upcoming"
  }

  if (normalized === "past" || normalized === "ended" || normalized === "expired") {
    return "past"
  }

  if (Number.isFinite(endTimestamp) && endTimestamp < now) {
    return "past"
  }

  if (Number.isFinite(dropTimestamp)) {
    return dropTimestamp > now ? "upcoming" : "active"
  }

  return "past"
}

function extractProducts(row: GenericRow): ShopProduct[] {
  const directProducts = asArray(row.products)
    .filter((product): product is GenericRow => typeof product === "object" && product !== null)
    .map(normalizeProduct)

  if (directProducts.length > 0) {
    return directProducts
  }

  return asArray(row.drop_event_products)
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return []
      }

      const relation = entry as GenericRow
      const nestedProducts = relation.products

      if (Array.isArray(nestedProducts)) {
        return nestedProducts
          .filter((product): product is GenericRow => typeof product === "object" && product !== null)
          .map(normalizeProduct)
      }

      if (nestedProducts && typeof nestedProducts === "object") {
        return [normalizeProduct(nestedProducts as GenericRow)]
      }

      return []
    })
}

export function normalizeDropEvent(row: GenericRow): DropEvent {
  const dropDate = pickString(row, ["drop_date", "release_date", "start_date"])
  const endDate = pickString(row, ["end_date", "expires_at"])
  const rawStatus = pickString(row, ["status"])

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    slug: pickString(row, ["slug"]) ?? "drop",
    title: pickString(row, ["title", "name"]) ?? "Untitled Drop",
    description:
      pickString(row, ["description", "body", "copy", "summary"]) ??
      "Limited release from GOOFY. Skate.",
    status: normalizeDropStatus(rawStatus, dropDate, endDate),
    rawStatus,
    dropDate,
    endDate,
    coverImage: pickString(row, ["cover_image", "image", "image_url"]),
    teaserImage: pickString(row, ["teaser_image", "thumbnail", "poster_image"]),
    products: extractProducts(row),
  }
}

export function sortDropsForDisplay(drops: DropEvent[]): DropEvent[] {
  const rank: Record<DropStatus, number> = {
    active: 0,
    upcoming: 1,
    past: 2,
  }

  return [...drops].sort((left, right) => {
    const statusDiff = rank[left.status] - rank[right.status]
    if (statusDiff !== 0) {
      return statusDiff
    }

    const leftTimestamp = left.dropDate ? new Date(left.dropDate).getTime() : 0
    const rightTimestamp = right.dropDate ? new Date(right.dropDate).getTime() : 0

    if (left.status === "past") {
      return rightTimestamp - leftTimestamp
    }

    return leftTimestamp - rightTimestamp
  })
}

export function formatDropDate(value?: string | null): string {
  if (!value) {
    return "Date TBA"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
