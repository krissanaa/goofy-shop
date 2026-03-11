import { getProducts, getCategories } from "@/lib/api"
import { ProductGridClient } from "@/components/product-grid-client"
import { ProductsHeroScene } from "@/components/sections/products-hero-scene"
import { defaultGlobalConfig } from "@/config/defaults"

interface DynamicProductGridProps {
  data: any
}

export async function DynamicProductGrid({ data }: DynamicProductGridProps) {
  const categorySlug = data.category_filter?.slug
  const godMode = data.god_mode ?? true

  const [supabaseProducts, supabaseCategories] = await Promise.allSettled([
    getProducts(), // Filter if possible
    getCategories(),
  ])

  const globalConfig = defaultGlobalConfig

  const products =
    supabaseProducts.status === "fulfilled" && supabaseProducts.value?.length
      ? supabaseProducts.value.slice(0, data.limit || 12).map((p: any) => ({
          id: p.slug,
          slug: p.slug,
          name: p.name,
          description: p.description || undefined,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          badge: p.badge ?? undefined,
          isActive: p.stock > 0,
          isDropProduct: false,
          createdAt: p.created_at,
          images:
            p.images?.length > 0
              ? [
                  {
                    url: p.images[0],
                    alt: p.name,
                  },
                ]
              : [],
          categories: p.category
            ? [{ title: p.category, slug: p.category.toLowerCase() }]
            : [],
          variants: [
            {
              id: p.slug,
              name: p.name,
              price: Number(p.price),
              stock: p.stock,
            },
          ],
        }))
      : []

  const categoryNames =
    supabaseCategories.status === "fulfilled" && supabaseCategories.value?.length
      ? ["All", ...supabaseCategories.value.map((c: any) => c.title)]
      : ["All"]

  const signLogoUrl = globalConfig.logoUrl
  const signLogoAlt =
    globalConfig.status === "fulfilled"
      ? globalConfig.value.siteName
      : "Sign logo"

  return (
    <section
      id="products"
      className="relative overflow-hidden border-y-4 border-black bg-[linear-gradient(to_bottom,#7DA2FF_0%,#84AAFF_50%,#7DA2FF_100%)] py-8 md:py-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
        <ProductsHeroScene
          showBorder={false}
          className="mb-6 md:mb-8"
          signLogoUrl={signLogoUrl}
          signLogoAlt={signLogoAlt}
        />
        <ProductGridClient
          sectionTitle={(data.title || "FEATURED DROPS").toUpperCase()}
          products={products}
          categories={data.show_filters ? categoryNames : undefined}
          showCategoryTabs={data.show_filters}
          showTopStats={godMode ? data.show_top_stats ?? true : false}
          showSort={godMode ? data.show_sort ?? true : false}
          showSearch={godMode ? data.show_search ?? true : false}
          showViewToggle={godMode ? data.show_view_toggle ?? true : false}
          showWishlist={godMode ? data.show_wishlist ?? true : false}
          initialSort={data.default_sort ?? "featured"}
          defaultView={data.default_view ?? "grid"}
          promoText={data.promo_text ?? undefined}
          promoCtaText={data.promo_cta_text ?? undefined}
        />
      </div>
    </section>
  )
}
