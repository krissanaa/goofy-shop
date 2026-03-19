"use server"

import { createClient } from "@/lib/supabase/server"
import {
  calculateDiscountAmount,
  isDiscountExpired,
  normalizeDiscountType,
} from "@/lib/discounts"
import { formatPrice } from "@/lib/utils/format"

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

async function getDiscountTableName(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<"discount_codes" | "discounts"> {
  const probe = await supabase
    .from("discount_codes")
    .select("id", { count: "exact", head: true })

  return probe.error ? "discounts" : "discount_codes"
}

export async function validateDiscount(code: string, cartTotal: number) {
  const normalizedCode = code.trim().toUpperCase()
  const normalizedCartTotal = Math.max(0, Math.round(cartTotal))

  if (!normalizedCode) {
    return {
      ok: false,
      amount: 0,
      code: "",
      cartTotal: normalizedCartTotal,
      message: "Enter a discount code.",
    }
  }

  const supabase = await createClient()
  const table = await getDiscountTableName(supabase)
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle()

  if (error || !data) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: "Discount code not found.",
    }
  }

  const row = data as GenericRow
  const active = asBoolean(row.active ?? row.enabled ?? row.is_active)
  const expiresAt = asString(row.expires_at ?? row.ends_at ?? row.end_date)
  const minOrder = Math.max(0, asNumber(row.min_order ?? row.minimum_order ?? row.minOrder) ?? 0)
  const maxUses = Math.max(0, asNumber(row.max_uses ?? row.maxUses) ?? 0)
  const usesCount = Math.max(
    0,
    asNumber(row.uses_count ?? row.usage_count ?? row.uses ?? row.used_count) ?? 0,
  )
  const value = Math.max(0, asNumber(row.value ?? row.amount ?? row.percent ?? row.discount_value) ?? 0)
  const type = normalizeDiscountType(asString(row.type ?? row.discount_type))

  if (!active) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: "This code is not active.",
    }
  }

  if (isDiscountExpired(expiresAt)) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: "This code has expired.",
    }
  }

  if (maxUses > 0 && usesCount >= maxUses) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: "This code has reached its usage limit.",
    }
  }

  if (normalizedCartTotal < minOrder) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: `Minimum order is ${formatPrice(minOrder)}.`,
    }
  }

  const amount = calculateDiscountAmount(type, value, normalizedCartTotal)

  if (amount <= 0) {
    return {
      ok: false,
      amount: 0,
      code: normalizedCode,
      cartTotal: normalizedCartTotal,
      message: "This code does not apply to the current cart.",
    }
  }

  return {
    ok: true,
    amount,
    code: normalizedCode,
    cartTotal: normalizedCartTotal,
    type,
    message:
      type === "PERCENT"
        ? `${normalizedCode} applied for ${value}% off.`
        : `${normalizedCode} applied for ${formatPrice(value)} off.`,
  }
}

export async function validateDiscountAction(
  _prevState: {
    status: string
    message: string
    code: string
    amount: number
    cartTotal: number
  },
  formData: FormData,
) {
  const code = typeof formData.get("code") === "string" ? String(formData.get("code")) : ""
  const cartTotalValue =
    typeof formData.get("cartTotal") === "string" ? Number(formData.get("cartTotal")) : 0
  const result = await validateDiscount(code, cartTotalValue)

  return {
    status: result.ok ? "success" : "error",
    message: result.message,
    code: result.code,
    amount: result.amount,
    cartTotal: result.cartTotal,
  }
}
