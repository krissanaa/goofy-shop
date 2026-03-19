import { notFound } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { DropForm } from "@/components/admin/drop-form"
import { getAdminDrop, getAdminProducts } from "@/lib/admin-data"

interface EditDropPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditDropPage({ params }: EditDropPageProps) {
  const { id } = await params
  const [drop, products] = await Promise.all([getAdminDrop(id), getAdminProducts()])

  if (!drop) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/drops" className="back">
        {"<-"} Back to Drops
      </Link>
      <AdminPageHeader eyebrow="Ecommerce" title="Edit Drop" subtitle={drop.title} />
      <DropForm mode="edit" drop={drop} products={products} />
    </div>
  )
}
