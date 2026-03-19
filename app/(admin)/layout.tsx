import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider"
import { createClient } from "@/lib/supabase/server"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING")

  return (
    <AdminThemeProvider>
      <AdminShell
        userEmail={user.email || "admin@goofy.skate"}
        pendingOrders={pendingOrders ?? 0}
      >
        {children}
      </AdminShell>
    </AdminThemeProvider>
  )
}
