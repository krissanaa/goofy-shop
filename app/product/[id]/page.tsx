import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { ProductDetail } from "@/components/product-detail"
import { PromoCodeBanner } from "@/components/promo-code-banner"
import { SearchCommand } from "@/components/search-command"
import { getProductBySlug } from "@/lib/api"
import { defaultGlobalConfig } from "@/config/defaults"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const product = await getProductBySlug(id)
    if (product) {
      return {
        title: `${product.name} - GOOFY SHOP`,
        description: product.description || "",
      }
    }
  } catch {}

  return { title: "Product Not Found" }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const config = defaultGlobalConfig

  const godMode = config.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar
  const showFooter = !godMode.enabled || godMode.bottom.showFooter
  const showPromoBanner = godMode.enabled && godMode.conversion.showPromoCodeBanner
  const showStockWarning = !godMode.enabled || godMode.conversion.showStockWarning

  try {
    const supabaseProduct = await getProductBySlug(id)
    if (supabaseProduct) {
      const product = {
        id: supabaseProduct.slug,
        slug: supabaseProduct.slug,
        name: supabaseProduct.name,
        description: supabaseProduct.description || undefined,
        price: Number(supabaseProduct.price),
        originalPrice: supabaseProduct.original_price ? Number(supabaseProduct.original_price) : null,
        image:
          supabaseProduct.images?.length > 0
            ? supabaseProduct.images[0]
            : "/images/placeholder.jpg",
        images:
          supabaseProduct.images?.length > 0
            ? supabaseProduct.images.map((img: string) => ({
                url: img,
                alt: supabaseProduct.name,
              }))
            : [],
        category: supabaseProduct.category || "Uncategorized",
        stock: supabaseProduct.stock,
        isLimited: false, // Map if needed
        isSoldOut: supabaseProduct.stock <= 0,
        specs: {}, // Map if needed
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
