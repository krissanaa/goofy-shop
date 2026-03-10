import Link from "next/link"
import Image from "next/image"
import { CountdownTimer } from "@/components/countdown-timer"
import {
  getActiveDropEvent,
  getLatestDropEvent,
  getProducts,
  getStrapiImageUrl,
  type StrapiProduct,
  type StrapiDropEvent,
} from "@/lib/strapi"
import { Clock, Users } from "lucide-react"

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
  const releaseDate = drop?.release_date
    ? new Date(drop.release_date)
    : new Date("2026-03-01T17:00:00Z")
  const isDropLive = Boolean(drop) && releaseDate.getTime() <= Date.now()

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

  const dropItems = products.map((product) => ({
    key: String(product.id),
    href: `/product/${product.slug}`,
    images: (() => {
      const media =
        product.images?.map((img) => ({
          url: getStrapiImageUrl(img, "medium"),
          alt: img.alternativeText ?? product.name,
        })) ?? []

      if (media.length > 0) {
        return media
      }

      if (product.category?.thumbnail) {
        return [
          {
            url: getStrapiImageUrl(product.category.thumbnail, "medium"),
            alt: product.category.thumbnail.alternativeText ?? product.name,
          },
        ]
      }

      return []
    })(),
    category: product.category?.title ?? "Product",
    name: product.name,
    price: product.price,
    isLimited: product.is_limited,
    isSoldOut: product.is_sold_out,
  }))

  return (
    <section className="pixel-bg py-20 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              {sectionHeading}
            </p>

            <div className="mario-badge mario-badge-blue">
              <Clock className="h-3 w-3 fill-current" />
              {isDropLive ? "DROP LIVE" : "DROP INCOMING"}
            </div>

            <h2
              className="font-black leading-tight text-foreground"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
            >
              {dropTitle.toUpperCase()}
            </h2>

            {drop?.description ? (
              <p className="text-base leading-relaxed text-muted-foreground">
                {drop.description}
              </p>
            ) : null}

            {showTimer ? (
              <div className="rounded-lg border-3 border-foreground bg-card p-6 pixel-card">
                <p className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Drop starts in
                </p>
                <CountdownTimer targetDate={releaseDate} variant="card" />
              </div>
            ) : null}

            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{drop?.entryCount || 0} entered</span>
              </div>
            </div>

            <Link href="/drop" className="mario-btn mario-btn-red inline-block">
              {isDropLive ? "Enter Drop Now" : "View Drop Details"}
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-foreground">Featured Items</h3>
            <div className="grid grid-cols-2 gap-4">
              {dropItems.length === 0 ? (
                <div className="col-span-2 rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No featured products configured in Strapi yet.
                </div>
              ) : null}

              {dropItems.map((product) => {
                const cardContent = (
                  <>
                    <div className="mystery-block relative aspect-square overflow-hidden">
                      {isDropLive ? (
                        product.images.length > 0 ? (
                          <>
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt}
                              fill
                              sizes="(max-width: 1024px) 50vw, 25vw"
                              className={`object-cover transition-opacity duration-300 ${product.isSoldOut ? "opacity-40 grayscale" : ""}`}
                            />
                            {product.images[1] ? (
                              <Image
                                src={product.images[1].url}
                                alt={product.images[1].alt}
                                fill
                                sizes="(max-width: 1024px) 50vw, 25vw"
                                className={`object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${product.isSoldOut ? "opacity-40 grayscale group-hover:opacity-40" : ""}`}
                              />
                            ) : null}
                          </>
                        ) : (
                          <span className="text-4xl">?</span>
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#2E2E2E,#0F0F0F)] text-white">
                          <span className="text-5xl font-black leading-none">?</span>
                          <span className="mt-3 border border-white/40 bg-black/40 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em]">
                            Secret Drop
                          </span>
                        </div>
                      )}

                      {isDropLive && product.isLimited && !product.isSoldOut ? (
                        <span className="pixel-border-2 absolute left-0 top-2 bg-[#E70009] px-2 py-1 text-[0.4rem] text-white pixel-heading">
                          HOT
                        </span>
                      ) : null}

                      {isDropLive && product.isSoldOut ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="pixel-heading text-lg text-[#FBD000]">GAME OVER</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="pixel-border bg-white px-3 py-2 pixel-shadow-sm">
                      {isDropLive ? (
                        <>
                          <p className="pixel-heading text-[0.3rem] text-[#555]">{product.category}</p>
                          <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-black">
                            {product.name}
                          </h3>
                          <span className="coin-badge mt-1.5">${product.price}</span>
                        </>
                      ) : (
                        <>
                          <p className="pixel-heading text-[0.3rem] text-[#555]">Classified</p>
                          <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-black">
                            Locked Item
                          </h3>
                          <span className="coin-badge mt-1.5">Unlocks On Drop</span>
                        </>
                      )}
                    </div>
                  </>
                )

                const isLockedCard = !isDropLive || product.isSoldOut

                if (isLockedCard) {
                  return (
                    <div
                      key={product.key}
                      className="group flex cursor-not-allowed flex-col opacity-95"
                      aria-disabled="true"
                    >
                      {cardContent}
                    </div>
                  )
                }

                return (
                  <Link key={product.key} href={product.href} className="group flex flex-col">
                    {cardContent}
                  </Link>
                )
              })}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isDropLive
                ? `${products.length} items in this drop`
                : "Secret items unlock when the drop goes live"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
