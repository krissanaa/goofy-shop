import { redirect } from "next/navigation"
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider"
import { LoginForm } from "@/components/admin/login-form"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/admin")
  }

  return (
    <AdminThemeProvider>
      <LoginForm />
    </AdminThemeProvider>
  )
}
