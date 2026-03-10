import { router } from './root'
import { productRouter } from './routers/product'
import { categoryRouter } from './routers/category'
import { dropEventRouter } from './routers/drop-event'

export const appRouter = router({
  product: productRouter,
  category: categoryRouter,
  dropEvent: dropEventRouter,
})

export type AppRouter = typeof appRouter
