import { PrismaClient } from '@prisma/client'
import { Context } from './root'

const prisma = new PrismaClient()

export async function createContext(): Promise<Context> {
  // Here you can add authentication logic
  // For now, we'll just pass the prisma client
  return {
    prisma,
    // userId: await getUserIdFromSession() // Add this when you have auth
  }
}

export type { Context }
