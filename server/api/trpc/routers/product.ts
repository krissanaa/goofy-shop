import { z } from "zod"
import { getProductBySlug, getProducts, getProductsByCategory } from "@/lib/api"
import { router, procedure } from "../root"

export const productRouter = router({
  getAll: procedure.query(async () => getProducts()),

  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => getProductBySlug(input.slug)),

  getByCategory: procedure
    .input(z.object({ categorySlug: z.string() }))
    .query(async ({ input }) => getProductsByCategory(input.categorySlug)),

  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const query = input.query.trim().toLowerCase()
      const products = await getProducts()

      if (!query) {
        return products
      }

      return products.filter((product) => {
        const name = typeof product.name === "string" ? product.name.toLowerCase() : ""
        const description =
          typeof product.description === "string" ? product.description.toLowerCase() : ""
        const brand = typeof product.brand === "string" ? product.brand.toLowerCase() : ""

        return name.includes(query) || description.includes(query) || brand.includes(query)
      })
    }),
})
