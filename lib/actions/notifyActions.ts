"use server"

import { createClient } from "@/lib/supabase/server"

function normalizeOptional(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

async function findExistingSignup(
  dropColumn: string,
  dropId: string,
  phone: string | null,
  email: string | null,
) {
  const supabase = await createClient()

  if (phone) {
    const response = await supabase
      .from("notify_list")
      .select("id")
      .eq(dropColumn, dropId)
      .eq("phone", phone)
      .maybeSingle()

    if (!response.error && response.data) {
      return response
    }

    if (response.error) {
      return response
    }
  }

  if (email) {
    return supabase
      .from("notify_list")
      .select("id")
      .eq(dropColumn, dropId)
      .eq("email", email)
      .maybeSingle()
  }

  return { data: null, error: null }
}

export async function notifySignup(data: {
  drop_id: string
  phone?: string
  email?: string
}) {
  const dropId = data.drop_id?.trim()
  const phone = normalizeOptional(data.phone)
  const email = normalizeOptional(data.email)

  if (!dropId) {
    throw new Error("Drop id is required")
  }

  if (!phone && !email) {
    throw new Error("Phone or email required")
  }

  let dropColumn = "drop_id"
  let existing = await findExistingSignup(dropColumn, dropId, phone, email)

  if (existing.error && /drop_id/i.test(existing.error.message)) {
    dropColumn = "drop_event_id"
    existing = await findExistingSignup(dropColumn, dropId, phone, email)
  }

  if (existing.data) {
    return { status: "already_signed" as const }
  }

  const supabase = await createClient()
  let insertResponse = await supabase.from("notify_list").insert({
    [dropColumn]: dropId,
    phone,
    email,
  })

  if (insertResponse.error && /drop_id/i.test(insertResponse.error.message)) {
    dropColumn = "drop_event_id"
    insertResponse = await supabase.from("notify_list").insert({
      [dropColumn]: dropId,
      phone,
      email,
    })
  }

  if (insertResponse.error) {
    if (/duplicate|unique/i.test(insertResponse.error.message)) {
      return { status: "already_signed" as const }
    }

    throw new Error(insertResponse.error.message)
  }

  return { status: "done" as const }
}
