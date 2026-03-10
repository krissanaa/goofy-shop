import { z } from 'zod'
import { router, procedure } from '../root'

export const productRouter = router({
  // Get all products
  getAll: procedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      include: {
        variants: {
          include: {
            prices: true,
            inventory: true,
            media: true,
          },
        },
        media: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return products
  }),

  // Get product by slug
  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug },
        include: {
          variants: {
            include: {
              prices: true,
              inventory: true,
              media: true,
            },
          },
          media: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      })
      return product
    }),

  // Get products by category
  getByCategory: procedure
    .input(z.object({ categorySlug: z.string() }))
    .query(async ({ input, ctx }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          isActive: true,
          categories: {
            some: {
              category: {
                slug: input.categorySlug,
              },
            },
          },
        },
        include: {
          variants: {
            include: {
              prices: true,
              inventory: true,
              media: true,
            },
          },
          media: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return products
    }),

  // Search products
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              brand: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          variants: {
            include: {
              prices: true,
              inventory: true,
              media: true,
            },
          },
          media: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return products
    }),
})
