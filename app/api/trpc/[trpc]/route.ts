import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/trpc'
import { createContext } from '@/server/api/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(),
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path ?? 'unknown'}:`, error)
    },
  })

export { handler as GET, handler as POST }


