import { products } from "@/lib/data"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchCommand } from "@/components/search-command"
import { ProductDetail } from "@/components/product-detail"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} - GOOFY SHOP`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  if (!product) notFound()

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
      <SearchCommand />
    </main>
  )
}
