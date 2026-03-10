'use client'

import { trpc } from '@/lib/trpc'

export default function TestTRPCPage() {
  const { data: products, isLoading } = trpc.product.getAll.useQuery()
  const { data: categories } = trpc.category.getAll.useQuery()
  const { data: dropEvents } = trpc.dropEvent.getActive.useQuery()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">tRPC Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Products ({products?.length || 0})</h2>
        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(products, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories ({categories?.length || 0})</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Drop Events ({dropEvents?.length || 0})</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(dropEvents, null, 2)}
        </pre>
      </div>
    </div>
  )
}
