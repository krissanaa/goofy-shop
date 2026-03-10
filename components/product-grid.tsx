import { getProducts, getCategories, getStrapiImageUrl } from "@/lib/strapi"
import { ProductGridClient } from "@/components/product-grid-client"

export async function ProductGrid() {
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
            ? [
                {
                  title: p.category.title,
                  slug: p.category.slug,
                },
              ]
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
      : [];

  const categoryNames =
    strapiCategories.status === "fulfilled" && strapiCategories.value?.data?.length
      ? ["All", ...strapiCategories.value.data.map((c) => c.title)]
      : ["All"];

  return (
    <ProductGridClient
      sectionTitle="FEATURED DROPS"
      products={products}
      categories={categoryNames}
      showCategoryTabs
      showTopStats
      showSort
      showSearch
      showViewToggle
      showWishlist
    />
  )
}
