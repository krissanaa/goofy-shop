import { FeaturedDropsPanel } from "@/components/featured-drops-panel"
import {
  getActiveDropEvent,
  getProducts,
} from "@/lib/api"

async function fetchActiveDrop(): Promise<any | null> {
  try {
    const activeDrop = await getActiveDropEvent()
    if (activeDrop) return activeDrop
    return null
  } catch {
    return null
  }
}

interface FeaturedDropsProps {
  sectionTitle?: string
  limit?: number
  showTimer?: boolean
}

function flattenRelatedProducts(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return []
}

function prioritizeProductsWithImages(products: any[]): any[] {
  return [...products].sort((a, b) => {
    const aHasImage = Array.isArray(a.images) && a.images.length > 0 ? 1 : 0
    const bHasImage = Array.isArray(b.images) && b.images.length > 0 ? 1 : 0
    return bHasImage - aHasImage
  })
}

async function safeGetProducts(): Promise<any[]> {
  try {
    const response = await getProducts()
    return Array.isArray(response) ? response : []
  } catch {
    return []
  }
}

export async function FeaturedDrops({
  sectionTitle = "HYPE DROPS",
  limit = 3,
  showTimer = true,
}: FeaturedDropsProps = {}) {
  const drop = await fetchActiveDrop()

  const maxItems = Number.isFinite(limit)
    ? Math.min(Math.max(Math.floor(limit), 1), 12)
    : 3
  const sectionHeading = sectionTitle.trim() ? sectionTitle : "HYPE DROPS"
  const dropTitle = drop?.title ?? "Shadow Series"
  const releaseDate = drop?.drop_date ?? "2026-03-01T17:00:00Z"
  const endDate =
    (drop as { end_date?: string | null } | null)?.end_date ?? null
  const enteredCount =
    (drop as any)?.entered_count ?? 0

  const dropProducts = flattenRelatedProducts(
    (drop as any)?.drop_event_products?.map((dp: any) => dp.products)
  )

  const latestFallbackProducts =
    dropProducts.length === 0
      ? await safeGetProducts()
      : []

  const baseProducts =
    dropProducts.length > 0
      ? dropProducts
      : latestFallbackProducts

  const products = prioritizeProductsWithImages(baseProducts).slice(0, maxItems)

  const items = products.map((product) => {
    const heroImage = product.images?.[0] || null

    return {
      key: String(product.id),
      href: `/product/${product.slug}`,
      imageUrl: heroImage,
      imageAlt: product.name,
      category: product.category ?? "Product",
      name: product.name,
      price: Number(product.price),
      stockQuantity: product.stock,
      isLimited: false,
      isSoldOut: product.stock <= 0,
    }
  })

  return (
    <FeaturedDropsPanel
      sectionHeading={sectionHeading}
      dropTitle={dropTitle}
      dropDescription={drop?.description}
      releaseDate={releaseDate}
      endDate={endDate}
      enteredCount={enteredCount}
      showTimer={showTimer}
      items={items}
    />
  )
}
