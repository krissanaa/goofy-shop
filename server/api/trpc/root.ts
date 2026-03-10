import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'
import superjson from 'superjson'
import { PrismaClient } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
  userId?: string
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const procedure = t.procedure
