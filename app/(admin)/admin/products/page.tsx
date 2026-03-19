import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ProductsDataView } from "@/components/admin/products-data-view"
import {
  ADMIN_PRODUCT_BADGES,
  ADMIN_PRODUCT_CATEGORIES,
  filterAdminProducts,
  sortAdminProducts,
  type AdminProductActiveState,
  type AdminProductSort,
} from "@/lib/admin"
import { getAdminProducts } from "@/lib/admin-data"

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    brand?: string
    badge?: string
    state?: string
    sort?: string
    view?: string
  }>
}

const CATEGORY_TABS = [
  { value: "ALL", label: "All" },
  ...ADMIN_PRODUCT_CATEGORIES.map((category) => ({
    value: category.toUpperCase(),
    label: category.charAt(0).toUpperCase() + category.slice(1),
  })),
]

const ACTIVE_TABS: Array<{ value: AdminProductActiveState; label: string }> = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
]

function normalizeSort(value: string | undefined): AdminProductSort {
  const normalized = (value ?? "NEWEST").toUpperCase()
  return normalized === "NAME" || normalized === "PRICE" || normalized === "STOCK"
    ? normalized
    : "NEWEST"
}

function normalizeActiveState(value: string | undefined): AdminProductActiveState {
  const normalized = (value ?? "ALL").toUpperCase()
  return normalized === "ACTIVE" || normalized === "INACTIVE" ? normalized : "ALL"
}

function normalizeView(value: string | undefined): "table" | "grid" {
  return value === "grid" ? "grid" : "table"
}

function buildProductsHref(
  currentParams: {
    q?: string
    category?: string
    brand?: string
    badge?: string
    state?: string
    sort?: string
    view?: string
  },
  updates: Partial<Record<"q" | "category" | "brand" | "badge" | "state" | "sort" | "view", string>>,
) {
  const query = new URLSearchParams()
  const merged = { ...currentParams, ...updates }

  if (merged.q?.trim()) query.set("q", merged.q.trim())
  if (merged.category && merged.category !== "ALL") query.set("category", merged.category)
  if (merged.brand && merged.brand !== "ALL") query.set("brand", merged.brand)
  if (merged.badge && merged.badge !== "ALL") query.set("badge", merged.badge)
  if (merged.state && merged.state !== "ALL") query.set("state", merged.state)
  if (merged.sort && merged.sort !== "NEWEST") query.set("sort", merged.sort)
  if (merged.view && merged.view !== "table") query.set("view", merged.view)

  const queryString = query.toString()
  return `/admin/products${queryString ? `?${queryString}` : ""}`
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const allProducts = await getAdminProducts()
  const brands = Array.from(
    new Set(
      allProducts
        .map((product) => product.brand?.trim())
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const search = params.q?.trim() ?? ""
  const category = (params.category ?? "ALL").toUpperCase()
  const brand = params.brand?.trim() ?? "ALL"
  const badge = (params.badge ?? "ALL").toUpperCase()
  const activeState = normalizeActiveState(params.state)
  const sort = normalizeSort(params.sort)
  const view = normalizeView(params.view)

  const products = sortAdminProducts(
    filterAdminProducts(allProducts, {
      search,
      category: category === "ALL" ? "all" : category.toLowerCase(),
      brand: brand === "ALL" ? "all" : brand.toLowerCase(),
      badge,
      activeState,
      sort,
    }),
    sort,
  )

  const currentParams = {
    q: search,
    category,
    brand,
    badge,
    state: activeState,
    sort,
    view,
  }

  const exportHref = buildProductsHref(currentParams, {}).replace(
    "/admin/products",
    "/admin/products/export",
  )

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Products"
        subtitle={`${products.length} products shown`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Product
          </Link>
        }
      />

      <div className="filter-bar">
        {CATEGORY_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildProductsHref(currentParams, { category: tab.value })}
            className={`ftab ${category === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="filter-bar">
        {ACTIVE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildProductsHref(currentParams, { state: tab.value })}
            className={`ftab ${activeState === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form action="/admin/products" className="filter-bar">
        {category !== "ALL" ? <input type="hidden" name="category" value={category} /> : null}
        {activeState !== "ALL" ? <input type="hidden" name="state" value={activeState} /> : null}
        {view !== "table" ? <input type="hidden" name="view" value={view} /> : null}

        <select name="brand" defaultValue={brand} className="fs" style={{ width: 160 }}>
          <option value="ALL">All Brands</option>
          {brands.map((brandOption) => (
            <option key={brandOption} value={brandOption}>
              {brandOption}
            </option>
          ))}
        </select>

        <select name="badge" defaultValue={badge} className="fs" style={{ width: 150 }}>
          <option value="ALL">All Badges</option>
          {ADMIN_PRODUCT_BADGES.map((badgeOption) => (
            <option key={badgeOption} value={badgeOption}>
              {badgeOption}
            </option>
          ))}
        </select>

        <select name="sort" defaultValue={sort} className="fs" style={{ width: 140 }}>
          <option value="NEWEST">Newest</option>
          <option value="NAME">Name</option>
          <option value="PRICE">Price</option>
          <option value="STOCK">Stock</option>
        </select>

        <Link
          href={buildProductsHref(currentParams, { view: "table" })}
          className={`ftab ${view === "table" ? "active" : ""}`}
        >
          Table
        </Link>
        <Link
          href={buildProductsHref(currentParams, { view: "grid" })}
          className={`ftab ${view === "grid" ? "active" : ""}`}
        >
          Grid
        </Link>

        <input
          className="search-box"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search name or brand..."
        />

        <button type="submit" className="btn">
          Apply
        </button>

        <Link href={exportHref} className="btn">
          Export CSV
        </Link>
      </form>

      <div className="card">
        {products.length === 0 ? (
          <div className="card-body">
            <div className="page-title" style={{ fontSize: "34px" }}>
              No Products
            </div>
            <div className="page-sub">
              Change the filters or create a new product.
            </div>
          </div>
        ) : (
          <ProductsDataView
            products={products}
            view={view}
            exportParams={{
              q: search,
              category,
              brand,
              badge,
              state: activeState,
              sort,
            }}
          />
        )}
      </div>
    </div>
  )
}
