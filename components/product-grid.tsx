import { getProducts, getCategories } from "@/lib/api"
import { ProductGridClient } from "@/components/product-grid-client"

export async function ProductGrid() {
  const [supabaseProducts, supabaseCategories] = await Promise.allSettled([
    getProducts(),
    getCategories(),
  ])

  const products =
    supabaseProducts.status === "fulfilled" && supabaseProducts.value?.length
      ? supabaseProducts.value.map((p: any) => ({
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
            ? [
                {
                  title: p.category,
                  slug: p.category.toLowerCase(),
                },
              ]
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
      : [];

  const categoryNames =
    supabaseCategories.status === "fulfilled" && supabaseCategories.value?.length
      ? ["All", ...supabaseCategories.value.map((c: any) => c.title)]
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
