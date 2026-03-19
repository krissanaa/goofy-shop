import { notFound } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ProductForm } from "@/components/admin/product-form"
import { ProductReviewsPanel } from "@/components/admin/product-reviews-panel"
import { getAdminProduct, getAdminProductReviews } from "@/lib/admin-data"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const [product, reviews] = await Promise.all([
    getAdminProduct(id),
    getAdminProductReviews(id),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader eyebrow="Ecommerce" title="Edit Product" subtitle={product.name} />
      <ProductForm mode="edit" product={product} />

      <ProductReviewsPanel
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
      />
    </div>
  )
}
