import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ProductForm } from "@/components/admin/product-form"
import { getAdminProduct } from "@/lib/admin-data"

interface AdminNewProductPageProps {
  searchParams: Promise<{
    duplicateFrom?: string
  }>
}

export default async function AdminNewProductPage({
  searchParams,
}: AdminNewProductPageProps) {
  const params = await searchParams
  const sourceProduct = params.duplicateFrom
    ? await getAdminProduct(params.duplicateFrom)
    : null

  const duplicatedProduct = sourceProduct
    ? {
        ...sourceProduct,
        slug: "",
        stock: 0,
      }
    : undefined

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Ecommerce"
        title={sourceProduct ? "Duplicate Product" : "Add Product"}
        subtitle={
          sourceProduct ? `Copied from ${sourceProduct.name}` : "Create a new catalog item"
        }
      />
      <ProductForm mode="create" product={duplicatedProduct} />
    </div>
  )
}
