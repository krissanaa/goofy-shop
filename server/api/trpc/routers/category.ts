import { z } from 'zod'
import { router, procedure } from '../root'

export const categoryRouter = router({
  // Get all categories
  getAll: procedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      where: {
        parentId: null, // Only get top-level categories
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  }),

  // Get category by slug
  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { slug: input.slug },
        include: {
          children: {
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      })
      return category
    }),

  // Get all categories with hierarchy
  getTree: procedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      include: {
        children: {
          include: {
            children: true,
          },
        },
        products: true,
      },
      where: {
        parentId: null,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  }),
})
