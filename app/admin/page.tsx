import type { Metadata } from "next"
import { AdminDashboard } from "@/components/admin-dashboard"

export const metadata: Metadata = {
  title: 'Admin Dashboard - GOOFY SHOP',
  description: 'Manage your store, orders, and inventory.',
}

export default function AdminPage() {
  return <AdminDashboard />
}
