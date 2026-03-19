type GenericRow = Record<string, unknown>

export interface ProductReview {
  id: string
  productId: string
  reviewerName: string
  rating: number
  comment: string
  approved: boolean
  createdAt: string | null
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
    return value === "true" || value === "1"
  }

  if (typeof value === "number") {
    return value > 0
  }

  return false
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

export function normalizeReview(row: GenericRow): ProductReview {
  const rating = Math.min(5, Math.max(1, asNumber(row.rating) ?? 5))

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    productId: pickString(row, ["product_id", "productId"]) ?? "",
    reviewerName: pickString(row, ["reviewer_name", "reviewerName", "name"]) ?? "Anonymous",
    rating,
    comment: pickString(row, ["comment", "body", "message"]) ?? "",
    approved: asBoolean(row.approved),
    createdAt: pickString(row, ["created_at", "createdAt"]),
  }
}

export function formatReviewDate(value?: string | null): string {
  if (!value) {
    return "Just now"
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
