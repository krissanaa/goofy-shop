import { z } from 'zod'
import { router, procedure } from '../root'

export const dropEventRouter = router({
  // Get all drop events
  getAll: procedure.query(async ({ ctx }) => {
    const dropEvents = await ctx.prisma.dropEvent.findMany({
      include: {
        variants: {
          include: {
            variant: {
              include: {
                product: true,
                prices: true,
                inventory: true,
                media: true,
              },
            },
          },
        },
        createdBy: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    })
    return dropEvents
  }),

  // Get active drop events
  getActive: procedure.query(async ({ ctx }) => {
    const now = new Date()
    const dropEvents = await ctx.prisma.dropEvent.findMany({
      where: {
        status: 'LIVE',
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      include: {
        variants: {
          include: {
            variant: {
              include: {
                product: true,
                prices: true,
                inventory: true,
                media: true,
              },
            },
          },
        },
        createdBy: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    })
    return dropEvents
  }),

  // Get upcoming drop events
  getUpcoming: procedure.query(async ({ ctx }) => {
    const now = new Date()
    const dropEvents = await ctx.prisma.dropEvent.findMany({
      where: {
        status: 'SCHEDULED',
        startsAt: {
          gt: now,
        },
      },
      include: {
        variants: {
          include: {
            variant: {
              include: {
                product: true,
                prices: true,
                inventory: true,
                media: true,
              },
            },
          },
        },
        createdBy: true,
      },
      orderBy: {
        startsAt: 'asc',
      },
    })
    return dropEvents
  }),

  // Get drop event by slug
  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const dropEvent = await ctx.prisma.dropEvent.findUnique({
        where: { slug: input.slug },
        include: {
          variants: {
            include: {
              variant: {
                include: {
                  product: true,
                  prices: true,
                  inventory: true,
                  media: true,
                },
              },
            },
          },
          rule: true,
          createdBy: true,
        },
      })
      return dropEvent
    }),

  // Get latest active drop event (for homepage)
  getLatestActive: procedure.query(async ({ ctx }) => {
    const now = new Date()
    const dropEvent = await ctx.prisma.dropEvent.findFirst({
      where: {
        status: 'LIVE',
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      include: {
        variants: {
          include: {
            variant: {
              include: {
                product: true,
                prices: true,
                inventory: true,
                media: true,
              },
            },
          },
        },
        createdBy: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    })
    return dropEvent
  }),
})
