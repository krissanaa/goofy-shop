import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { ProductDetail } from "@/components/product-detail"
import { PromoCodeBanner } from "@/components/promo-code-banner"
import { SearchCommand } from "@/components/search-command"
import { getProductBySlug, getResolvedGlobalConfig, getStrapiImageUrl } from "@/lib/strapi"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const strapiResponse = await getProductBySlug(id)
    if (strapiResponse.data.length > 0) {
      const product = strapiResponse.data[0]
      return {
        title: `${product.name} - GOOFY SHOP`,
        description: product.description || "",
      }
    }
  } catch {}

  return { title: "Product Not Found" }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [{ id }, config] = await Promise.all([
    params,
    getResolvedGlobalConfig(),
  ])

  const godMode = config.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter
  const showPromoBanner = godMode.enabled && godMode.conversion.showPromoCodeBanner
  const showStockWarning = !godMode.enabled || godMode.conversion.showStockWarning

  try {
    const strapiResponse = await getProductBySlug(id)
    if (strapiResponse.data.length > 0) {
      const strapiProduct = strapiResponse.data[0]

      const product = {
        id: strapiProduct.slug,
        slug: strapiProduct.slug,
        name: strapiProduct.name,
        description: strapiProduct.description || undefined,
        price: strapiProduct.price,
        originalPrice: strapiProduct.compare_at_price,
        image:
          strapiProduct.images?.length > 0
            ? getStrapiImageUrl(strapiProduct.images[0], "large")
            : "/images/placeholder.jpg",
        images:
          strapiProduct.images?.length > 0
            ? strapiProduct.images.map((img) => ({
                url: getStrapiImageUrl(img, "large"),
                alt: img.alternativeText || strapiProduct.name,
              }))
            : [],
        category: strapiProduct.category?.title || "Uncategorized",
        stock: strapiProduct.stock_quantity,
        isLimited: strapiProduct.is_limited,
        isSoldOut: strapiProduct.is_sold_out,
        specs: strapiProduct.specs,
      }

      return (
        <main className="min-h-screen bg-background">
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
            <ProductDetail
              product={product}
              showStockWarning={showStockWarning}
              withTopOffset={false}
            />
          </div>
          {showFooter ? <Footer /> : null}
          <SearchCommand />
        </main>
      )
    }
  } catch {}

  notFound()
}
