"use server"

import { revalidatePath } from "next/cache"
import { normalizeOrderLookupSummary } from "@/lib/order"
import { createClient } from "@/lib/supabase/server"

export async function updateOrderSlip(
  orderId: string,
  orderNumber: string,
  slipUrl: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!orderId || !orderNumber || !slipUrl) {
    return {
      ok: false,
      message: "Missing order slip details.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("orders")
    .update({
      slip_image: slipUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) {
    return {
      ok: false,
      message: error.message || "Unable to save payment slip.",
    }
  }

  revalidatePath(`/order/${orderNumber}`)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return { ok: true }
}

export async function lookupOrders(phone: string) {
  const normalizedPhone = phone.trim()

  if (!normalizedPhone) {
    throw new Error("Phone number is required.")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, created_at, total, status, payment_status, items")
    .or(`customer_phone.eq.${normalizedPhone},phone.eq.${normalizedPhone}`)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) =>
    normalizeOrderLookupSummary(row as Record<string, unknown>),
  )
}
