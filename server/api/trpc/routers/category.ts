import { z } from "zod"
import { getCategories } from "@/lib/api"
import { router, procedure } from "../root"

export const categoryRouter = router({
  getAll: procedure.query(async () => getCategories()),

  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const categories = await getCategories()
      return categories.find((category) => category.slug === input.slug) ?? null
    }),

  getTree: procedure.query(async () => getCategories()),
})
