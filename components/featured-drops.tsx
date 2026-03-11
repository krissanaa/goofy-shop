import { FeaturedDropsPanel } from "@/components/featured-drops-panel"
import {
  getActiveDropEvent,
  getLatestDropEvent,
  getProducts,
  getStrapiImageUrl,
  type StrapiDropEvent,
  type StrapiProduct,
} from "@/lib/strapi"

async function fetchActiveDrop(): Promise<StrapiDropEvent | null> {
  try {
    const activeRes = await getActiveDropEvent()
    const activeDrop = activeRes?.data?.[0] ?? null
    if (activeDrop) return activeDrop

    const latestRes = await getLatestDropEvent()
    return latestRes?.data?.[0] ?? null
  } catch {
    return null
  }
}

interface FeaturedDropsProps {
  sectionTitle?: string
  limit?: number
  showTimer?: boolean
}

function flattenRelatedProducts(value: unknown): StrapiProduct[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value as StrapiProduct[]
  }

  if (typeof value !== "object") {
    return []
  }

  const relation = value as { data?: unknown[] }
  if (!Array.isArray(relation.data)) {
    return []
  }

  return relation.data
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null
      const record = entry as Record<string, unknown>
      const attrs =
        record.attributes && typeof record.attributes === "object"
          ? (record.attributes as Record<string, unknown>)
          : null
      if (!attrs) return null
      return ({
        ...(record as object),
        ...attrs,
      } as unknown) as StrapiProduct
    })
    .filter((item): item is StrapiProduct => item !== null)
}

function prioritizeProductsWithImages(products: StrapiProduct[]): StrapiProduct[] {
  return [...products].sort((a, b) => {
    const aHasImage = Array.isArray(a.images) && a.images.length > 0 ? 1 : 0
    const bHasImage = Array.isArray(b.images) && b.images.length > 0 ? 1 : 0
    return bHasImage - aHasImage
  })
}

async function safeGetProducts(
  opts: Parameters<typeof getProducts>[0],
): Promise<StrapiProduct[]> {
  try {
    const response = await getProducts(opts)
    return Array.isArray(response?.data) ? response.data : []
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
  const releaseDate = drop?.release_date ?? "2026-03-01T17:00:00Z"
  const endDate =
    (drop as { end_date?: string | null } | null)?.end_date ?? null
  const enteredCount =
    (drop as {
      entered_count?: number | null
      entryCount?: number | null
    } | null)?.entered_count ??
    drop?.entryCount ??
    0

  const dropProducts = flattenRelatedProducts(
    (drop as { featured_products?: unknown } | null)?.featured_products,
  )

  const relationQueryProducts =
    dropProducts.length === 0 && drop
      ? await safeGetProducts({
          dropEventId: drop.id,
          limit: maxItems,
          revalidate: 30,
        })
      : []

  const badgeFallbackProducts =
    dropProducts.length === 0 && relationQueryProducts.length === 0
      ? await safeGetProducts({ badge: "DROP", limit: maxItems, revalidate: 30 })
      : []

  const latestFallbackProducts =
    dropProducts.length === 0 &&
    relationQueryProducts.length === 0 &&
    badgeFallbackProducts.length === 0
      ? await safeGetProducts({ limit: maxItems, revalidate: 30 })
      : []

  const baseProducts =
    dropProducts.length > 0
      ? dropProducts
      : relationQueryProducts.length > 0
        ? relationQueryProducts
        : badgeFallbackProducts.length > 0
          ? badgeFallbackProducts
          : latestFallbackProducts

  const products = prioritizeProductsWithImages(baseProducts).slice(0, maxItems)

  const items = products.map((product) => {
    const media =
      product.images?.map((img) => ({
        url: getStrapiImageUrl(img, "medium"),
        alt: img.alternativeText ?? product.name,
      })) ?? []

    const fallbackCategoryImage = product.category?.thumbnail
      ? {
          url: getStrapiImageUrl(product.category.thumbnail, "medium"),
          alt: product.category.thumbnail.alternativeText ?? product.name,
        }
      : null

    const heroImage = media[0] ?? fallbackCategoryImage

    return {
      key: String(product.id),
      href: `/product/${product.slug}`,
      imageUrl: heroImage?.url ?? null,
      imageAlt: heroImage?.alt ?? product.name,
      category: product.category?.title ?? "Product",
      name: product.name,
      price: product.price,
      stockQuantity: product.stock_quantity,
      isLimited: product.is_limited,
      isSoldOut: product.is_sold_out,
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
