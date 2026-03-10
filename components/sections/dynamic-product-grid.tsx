import { getProducts, getCategories, getResolvedGlobalConfig, getStrapiImageUrl } from "@/lib/strapi"
import { ProductGridClient } from "@/components/product-grid-client"
import { ProductsHeroScene } from "@/components/sections/products-hero-scene"
import type { ProductGridData } from "@/lib/strapi-types"

interface DynamicProductGridProps {
  data: ProductGridData
}

export async function DynamicProductGrid({ data }: DynamicProductGridProps) {
  const categorySlug = data.category_filter?.slug
  const godMode = data.god_mode ?? true

  const [strapiProducts, strapiCategories, globalConfig] = await Promise.allSettled([
    getProducts({ categorySlug }),
    getCategories(),
    getResolvedGlobalConfig(),
  ])

  const products =
    strapiProducts.status === "fulfilled" && strapiProducts.value?.data?.length
      ? strapiProducts.value.data.slice(0, data.limit || 12).map((p) => ({
          id: p.slug,
          slug: p.slug,
          name: p.name,
          description: p.description || undefined,
          price: p.price,
          originalPrice: p.compare_at_price ?? undefined,
          badge: p.badge ?? undefined,
          isActive: !p.is_sold_out,
          isDropProduct: p.is_limited,
          createdAt: p.publishedAt || p.createdAt,
          images:
            p.images?.length > 0
              ? [
                  {
                    url: getStrapiImageUrl(p.images[0], "medium"),
                    alt: p.images[0].alternativeText || p.name,
                  },
                ]
              : [],
          categories: p.category
            ? [{ title: p.category.title, slug: p.category.slug }]
            : [],
          variants: [
            {
              id: p.slug,
              name: p.name,
              price: p.price,
              stock: p.stock_quantity,
            },
          ],
        }))
      : []

  const categoryNames =
    strapiCategories.status === "fulfilled" && strapiCategories.value?.data?.length
      ? ["All", ...strapiCategories.value.data.map((c) => c.title)]
      : ["All"]

  const signLogoUrl =
    globalConfig.status === "fulfilled" ? globalConfig.value.logoUrl : null
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
