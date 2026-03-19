import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { InventoryManager } from "@/components/admin/inventory-manager"
import { filterProducts } from "@/lib/admin"
import { getAdminProducts, getAdminStockLogs } from "@/lib/admin-data"

interface InventoryPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams
  const search = params.q?.trim() ?? ""
  const [allProducts, logs] = await Promise.all([getAdminProducts(), getAdminStockLogs(40)])
  const products = filterProducts(allProducts, search)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Inventory"
        subtitle={`${products.length} stock records`}
      />

      <form action="/admin/inventory" className="filter-bar">
        <input
          className="search-box"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search name or brand..."
        />
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      <InventoryManager products={products} logs={logs} />
    </div>
  )
}
