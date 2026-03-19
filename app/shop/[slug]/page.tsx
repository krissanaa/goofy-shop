import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { ProductGallery } from "@/components/shop/ProductGallery"
import { ProductCard } from "@/components/shop/ProductCard"
import { ProductPurchasePanel } from "@/components/shop/ProductPurchasePanel"
import { ProductReviews } from "@/components/shop/ProductReviews"
import {
  getCategoryLabel,
  getProductComparePrice,
  getProductDiscountPercentage,
  type ShopProduct,
} from "@/lib/shop"
import { normalizeReview } from "@/lib/reviews"
import { supabase } from "@/lib/supabase"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/format"

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getActiveProductBySlug(slug: string): Promise<ShopProduct | null> {
  const client = await createClient()
  const { data } = await client
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single()

  return (data as ShopProduct | null) ?? null
}

function shuffleProducts(products: ShopProduct[]) {
  return [...products].sort(() => Math.random() - 0.5)
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getActiveProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found - GOOFY. Skate",
    }
  }

  return {
    title: `${product.name} - GOOFY. Skate`,
    description: product.description ?? undefined,
  }
}

export async function generateStaticParams() {
  const { data, count } = await supabase
    .from("products")
    .select("slug", { count: "exact" })
    .eq("active", true)
    .limit(200)

  if (!data || !count || count >= 200) {
    return []
  }

  return data
    .map((row) => (typeof row.slug === "string" ? row.slug : null))
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }))
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getActiveProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedClient = product.category ? await createClient() : null
  const [relatedRows, reviewRows] = await Promise.all([
    product.category
      ? (
          await relatedClient!
            .from("products")
            .select("*")
            .eq("active", true)
            .eq("category", product.category)
            .neq("slug", product.slug)
            .limit(12)
        ).data
      : null,
    (
      await (await createClient())
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .eq("approved", true)
        .order("created_at", { ascending: false })
    ).data,
  ])

  const relatedProducts = shuffleProducts((relatedRows as ShopProduct[] | null) ?? []).slice(0, 4)
  const reviews = (reviewRows ?? []).map((row) =>
    normalizeReview(row as Record<string, unknown>),
  )
  const comparePrice = getProductComparePrice(product)
  const discount = getProductDiscountPercentage(product)
  const safeImages = (product.images ?? []).filter(Boolean)
  const stockTone =
    product.stock <= 0
      ? "bg-rose-500"
      : product.stock <= 5
        ? "bg-[var(--gold)]"
        : "bg-emerald-400"
  const stockText =
    product.stock <= 0
      ? "Out of Stock"
      : product.stock <= 5
        ? `Only ${product.stock} left!`
        : "In Stock"

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />

      <div className="px-5 pb-20 pt-24 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <ProductGallery name={product.name} images={safeImages} />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
                  {getCategoryLabel(product.category ?? "product")}
                </span>
                <span className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-white/28">
                  {product.brand || "GOOFY."}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-3">
                <h1 className="goofy-display text-[clamp(32px,4vw,56px)] leading-[0.92] text-[var(--white)]">
                  {product.name}
                </h1>
                {product.badge ? (
                  <span
                    className={`inline-flex px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.18em] ${
                      product.badge.toUpperCase() === "SALE"
                        ? "bg-rose-600 text-white"
                        : "bg-[var(--gold)] text-[var(--black)]"
                    }`}
                  >
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="goofy-mono text-[20px] text-[var(--white)]">
                  {formatPrice(product.price)}
                </span>
                {comparePrice && comparePrice > product.price ? (
                  <span className="goofy-mono text-[14px] text-white/30 line-through">
                    {formatPrice(comparePrice)}
                  </span>
                ) : null}
                {discount ? (
                  <span className="inline-flex bg-rose-600 px-3 py-1 goofy-mono text-[8px] uppercase tracking-[0.18em] text-white">
                    {discount}% OFF
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${stockTone}`} />
                <span className="goofy-mono text-[10px] uppercase tracking-[0.16em] text-white/64">
                  {stockText}
                </span>
              </div>

              {product.description ? (
                <p className="mt-6 max-w-2xl goofy-mono text-[10px] leading-[1.7] text-white/70">
                  {product.description}
                </p>
              ) : null}

              {product.specs && Object.keys(product.specs).length > 0 ? (
                <div className="mt-6 border-t border-[var(--bordw)] pt-4">
                  <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
                    Specs
                  </p>
                  <dl className="mt-4 space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-2 border-b border-[var(--bordw)] pb-3 md:grid-cols-[160px_1fr]"
                      >
                        <dt className="goofy-mono text-[9px] uppercase tracking-[0.16em] text-white/32">
                          {key}
                        </dt>
                        <dd className="goofy-mono text-[10px] uppercase tracking-[0.1em] text-[var(--white)]">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <ProductPurchasePanel product={product} />
            </div>
          </div>

          <ProductReviews productId={product.id} initialReviews={reviews} />

          {relatedProducts.length > 0 ? (
            <section className="mt-20">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    Related Products
                  </p>
                  <h2 className="goofy-display mt-2 text-[clamp(30px,4vw,52px)] leading-none text-[var(--white)]">
                    More From {getCategoryLabel(product.category ?? "product")}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    view="grid"
                    index={index}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <Footer />
      <SearchCommand />
    </main>
  )
}
