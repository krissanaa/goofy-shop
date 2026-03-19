export type DiscountType = "PERCENT" | "FIXED"

export function generateDiscountCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""

  for (let index = 0; index < length; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  return code
}

export function normalizeDiscountType(value: string | null | undefined): DiscountType {
  return (value ?? "").toUpperCase() === "PERCENT" ? "PERCENT" : "FIXED"
}

export function isDiscountExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) {
    return false
  }

  const parsed = new Date(expiresAt)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  return parsed.getTime() < Date.now()
}

export function calculateDiscountAmount(
  type: DiscountType,
  value: number,
  cartTotal: number,
): number {
  if (cartTotal <= 0 || value <= 0) {
    return 0
  }

  if (type === "PERCENT") {
    return Math.min(cartTotal, Math.round((cartTotal * value) / 100))
  }

  return Math.min(cartTotal, value)
}
