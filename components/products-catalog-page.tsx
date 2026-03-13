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
import { getCategories, getProducts } from "@/lib/api"
import {
  defaultGlobalConfig,
  defaultProductsPageConfig,
  defaultHomePageSections,
} from "@/config/defaults"

export type ProductBadge = "NEW" | "DROP" | "SALE" | "HOT" | "COLLAB"

export interface ProductsCatalogPageProps {
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

export async function generateProductsCatalogMetadata(): Promise<Metadata> {
  const config = defaultProductsPageConfig
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

export async function ProductsCatalogPage({
  searchParams,
}: ProductsCatalogPageProps) {
  const pageConfig = defaultProductsPageConfig
  const globalConfig = defaultGlobalConfig
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

  const homePageSections = defaultHomePageSections
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
  const fallbackSort: SortOption = ALLOWED_SORTS.includes(
    pageConfig.defaultSort as SortOption,
  )
    ? (pageConfig.defaultSort as SortOption)
    : "featured"
  const initialSort = ALLOWED_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : fallbackSort
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

  const [supabaseProducts, supabaseCategories] = await Promise.allSettled([
    getProducts(),
    getCategories(),
  ])

  const products =
    supabaseProducts.status === "fulfilled" && supabaseProducts.value?.length
      ? supabaseProducts.value.map((p) => ({
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

  const categoryData =
    supabaseCategories.status === "fulfilled" && supabaseCategories.value?.length
      ? supabaseCategories.value
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
    homePageSections.filter(
      (section): section is any =>
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
