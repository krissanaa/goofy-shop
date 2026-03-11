import type { Metadata } from "next"
import { NavbarServer } from "@/components/navbar-server"
import { Footer } from "@/components/footer"
import { SearchCommand } from "@/components/search-command"
import { PromoCodeBanner } from "@/components/promo-code-banner"
import { MarqueeTicker } from "@/components/ui/MarqueeTicker"
import { DynamicMarquee } from "@/components/sections/dynamic-marquee"
import {
  ProductGridClient,
  type BadgeFilterOption,
  type GridMode,
  type SortOption,
} from "@/components/product-grid-client"
import { ProductsHeroScene } from "@/components/sections/products-hero-scene"
import { DEFAULT_HOME_MARQUEE_ITEMS } from "@/lib/marquee"
import type { MarqueeTextData, ProductBadge } from "@/lib/strapi-types"
import {
  getCategories,
  getHomePage,
  getProducts,
  getProductsPage,
  getResolvedGlobalConfig,
  getStrapiImageUrl,
} from "@/lib/strapi"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    type?: string
    badge?: string
    filter?: string
    q?: string
    sort?: string
    view?: string
    favorites?: string
  }>
}

const ALLOWED_SORTS: SortOption[] = [
  "featured",
  "price-asc",
  "price-desc",
  "top-rated",
  "newest",
]

const BADGE_FILTER_MAP: Record<string, ProductBadge> = {
  new: "NEW",
  sale: "SALE",
  drop: "DROP",
  hot: "HOT",
  collab: "COLLAB",
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getProductsPage()
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      type: "website",
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [pageConfig, globalConfig] = await Promise.all([
    getProductsPage(),
    getResolvedGlobalConfig(),
  ])
  const godMode = globalConfig.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter
  const showPromoBanner = godMode.enabled && godMode.conversion.showPromoCodeBanner
  const showHeroScene =
    pageConfig.showHeroScene && (!godMode.enabled || godMode.aboveFold.showHeroBanner)
  const showMarquee =
    pageConfig.showMarquee && (!godMode.enabled || godMode.aboveFold.showMarqueeTicker)
  const showCategoryTabs =
    pageConfig.enableCategoryTabs &&
    (!godMode.enabled || godMode.content.showShopByCategory)
  const showTopStats =
    pageConfig.enableTopStats &&
    (!godMode.enabled || godMode.socialProof.showNumberStats)

  const homePage = showMarquee ? await getHomePage() : null
  const params = await searchParams
  const requestedCategory = params.category
    ? decodeURIComponent(params.category)
    : params.type
      ? decodeURIComponent(params.type)
    : pageConfig.defaultCategory
  const requestedFilter = params.badge
    ? decodeURIComponent(params.badge).trim().toLowerCase()
    : params.filter
      ? decodeURIComponent(params.filter).trim().toLowerCase()
      : ""
  const initialBadgeFilter: BadgeFilterOption =
    BADGE_FILTER_MAP[requestedFilter] ?? "ALL"
  const initialSearch = params.q ? decodeURIComponent(params.q) : ""
  const initialSort = ALLOWED_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : pageConfig.defaultSort
  const defaultView: GridMode = params.view === "list"
    ? "list"
    : params.view === "grid"
      ? "grid"
      : pageConfig.defaultView
  const hasFavoritesParam =
    params.favorites === "1" ||
    params.favorites === "true" ||
    params.favorites === "0" ||
    params.favorites === "false"
  const initialFavoritesOnly = hasFavoritesParam
    ? params.favorites === "1" || params.favorites === "true"
    : pageConfig.initialFavoritesOnly

  const [strapiProducts, strapiCategories] = await Promise.allSettled([
    getProducts(),
    getCategories(),
  ])

  const products =
    strapiProducts.status === "fulfilled" && strapiProducts.value?.data?.length
      ? strapiProducts.value.data.map((p) => ({
          id: p.slug,
          slug: p.slug,
          name: p.name,
          description: p.description || undefined,
          price: p.price,
          originalPrice: p.compare_at_price ?? undefined,
          badge: p.badge ?? undefined,
          isActive: !p.is_sold_out,
          isDropProduct: p.is_limited,
          createdAt:
            (p as { publishedAt?: string; createdAt?: string }).publishedAt ||
            (p as { createdAt?: string }).createdAt,
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

  const categoryData =
    strapiCategories.status === "fulfilled" && strapiCategories.value?.data?.length
      ? strapiCategories.value.data
      : []

  const categoryNames =
    categoryData.length > 0
      ? ["All", ...categoryData.map((c) => c.title)]
      : ["All", "Decks", "Apparel", "Wheels", "Gear"]

  const normalizedRequestedCategory = requestedCategory.trim().toLowerCase()
  const matchedCategoryTitle =
    categoryData.find(
      (category) =>
        category.title.toLowerCase() === normalizedRequestedCategory ||
        category.slug.toLowerCase() === normalizedRequestedCategory,
    )?.title ?? null

  const initialCategory =
    matchedCategoryTitle ??
    categoryNames.find(
      (name) => name.toLowerCase() === normalizedRequestedCategory,
    ) ??
    "All"
  const homeMarqueeSections = (
    homePage?.sections.filter(
      (section): section is MarqueeTextData =>
        section.__component === "sections.marquee-text",
    ) ?? []
  )
  const primaryHomeMarquee = homeMarqueeSections[0] ?? null
  const homeMarqueeItems = homeMarqueeSections
      .flatMap((section) => section.items ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0) ?? []
  const sharedMarqueeItems =
    homeMarqueeItems.length > 0 ? homeMarqueeItems : DEFAULT_HOME_MARQUEE_ITEMS
  const sharedMarqueeBackground = primaryHomeMarquee?.background_color ?? "#000000"
  const sharedMarqueeTextColor = primaryHomeMarquee?.text_color ?? "#FFFFFF"
  const sharedMarqueeSpeed = primaryHomeMarquee?.speed ?? "normal"

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {showNavbar ? <NavbarServer /> : null}

      <div className={showNavbar ? "pt-16" : undefined}>
        {showPromoBanner ? (
          <PromoCodeBanner
            text={godMode.conversion.promoBannerText}
            code={godMode.conversion.promoBannerCode}
            ctaText={godMode.conversion.promoBannerCtaText}
            ctaLink={godMode.conversion.promoBannerCtaLink}
          />
        ) : null}

        {showHeroScene ? (
          <ProductsHeroScene
            showMarquee={showMarquee}
            marqueeItems={sharedMarqueeItems}
            marqueeBackgroundColor={sharedMarqueeBackground}
            marqueeTextColor={sharedMarqueeTextColor}
            marqueeSpeed={sharedMarqueeSpeed}
            signLogoUrl={globalConfig.logoUrl}
            signLogoAlt={globalConfig.siteName}
          />
        ) : showMarquee ? (
          primaryHomeMarquee ? (
            <DynamicMarquee
              data={{
                ...primaryHomeMarquee,
                items: sharedMarqueeItems,
              }}
            />
          ) : (
            <MarqueeTicker items={sharedMarqueeItems} />
          )
        ) : null}

        <section className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-8 md:px-8">
          <ProductGridClient
            sectionTitle={showHeroScene ? "SHOP CATALOG" : pageConfig.pageTitle}
            products={products}
            categories={showCategoryTabs ? categoryNames : undefined}
            initialCategory={initialCategory}
            initialBadgeFilter={initialBadgeFilter}
            initialSearch={initialSearch}
            initialSort={initialSort}
            defaultView={defaultView}
            initialFavoritesOnly={initialFavoritesOnly}
            showCategoryTabs={showCategoryTabs}
            showBadgeFilter
            showSort={pageConfig.enableSort}
            showSearch={pageConfig.enableSearch}
            showViewToggle={pageConfig.enableViewToggle}
            showWishlist={pageConfig.enableWishlist}
            showTopStats={showTopStats}
            promoText={pageConfig.promoText}
            promoCtaText={pageConfig.promoCtaText}
          />
        </section>
      </div>

      {showFooter ? <Footer /> : null}
      <SearchCommand />
    </main>
  )
}
