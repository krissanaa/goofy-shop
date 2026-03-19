import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { DropForm } from "@/components/admin/drop-form"
import { getAdminProducts } from "@/lib/admin-data"

export default async function AdminNewDropPage() {
  const products = await getAdminProducts()

  return (
    <div className="space-y-4">
      <Link href="/admin/drops" className="back">
        {"<-"} Back to Drops
      </Link>
      <AdminPageHeader eyebrow="Ecommerce" title="Create Drop" subtitle="Add a new launch event" />
      <DropForm mode="create" products={products} />
    </div>
  )
}
