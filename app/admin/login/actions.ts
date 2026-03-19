"use server"

import { createClient } from "@/lib/supabase/server"
import {
  type AdminActionState,
} from "@/lib/admin"

export async function loginAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to sign in.",
    }
  }

  return {
    status: "success",
    message: "Signed in.",
    redirectTo: "/admin",
  }
}

export async function requestPasswordResetAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    return {
      status: "error",
      message: "Email is required for password reset.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to send reset email.",
    }
  }

  return {
    status: "success",
    message: "Password reset email sent.",
  }
}
