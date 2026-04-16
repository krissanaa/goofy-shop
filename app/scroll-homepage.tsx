import {
  GoofyHomepage,
  type GoofyCategory,
  type GoofyProduct,
  type GoofySpot,
  type GoofyStory,
} from "@/components/home/GoofyHomepage"

interface ScrollHomepageProps {
  heroImage: string | null
  heroTagline: string
  marqueeText: string
  products: Array<{
    id: string
    slug: string
    name: string
    price: number
    image: string | null
    category: string
    categoryLabel?: string
    badge?: string
  }>
  videoPanels: Array<{
    id: string
    title: string
    subtitle: string
    description?: string
    videoUrl?: string
    thumbnail?: string | null
    category: string
  }>
  communityPosts: Array<{
    id: string
    title: string
    image?: string | null
    author?: string
    excerpt?: string
    href: string
    category?: string
    date?: string
  }>
  skateparkSpots: Array<{
    id: string
    name: string
    description?: string
    image?: string | null
    mapUrl?: string
    locationLabel?: string
  }>
  newsPosts: Array<{
    id: string
    title: string
    image?: string | null
    href: string
    category?: string
    date?: string
    excerpt?: string
  }>
}

function normalizeCategories(products: GoofyProduct[]): GoofyCategory[] {
  const groups = new Map<string, GoofyProduct[]>()

  for (const product of products) {
    const key = product.category.trim().toLowerCase() || "products"
    const current = groups.get(key) ?? []
    current.push(product)
    groups.set(key, current)
  }

  return Array.from(groups.entries()).map(([key, group]) => ({
    key,
    name: key.toUpperCase(),
    slug: key,
    image: group[0]?.image ?? null,
    products: group,
  }))
}

export function ScrollHomepage({
  heroImage,
  products,
  videoPanels,
  communityPosts,
  skateparkSpots,
  newsPosts,
}: ScrollHomepageProps) {
  const normalizedProducts: GoofyProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.categoryLabel || product.category,
    badge: product.badge,
  }))

  const stories: GoofyStory[] = [...communityPosts, ...newsPosts].slice(0, 3).map((post, index) => ({
    id: post.id,
    title: post.title,
    image: post.image ?? null,
    href: post.href,
    category: (post.category || "Story").toUpperCase(),
    date: post.date || `${index + 1}.2026`,
  }))

  const spots: GoofySpot[] = skateparkSpots.map((spot) => ({
    id: spot.id,
    name: spot.name,
    image: spot.image ?? null,
    mapUrl: spot.mapUrl || "#",
  }))

  const primaryVideo = videoPanels[0]

  return (
    <GoofyHomepage
      products={normalizedProducts}
      categories={normalizeCategories(normalizedProducts)}
      stories={stories}
      spots={spots}
      videoTitle={primaryVideo?.title || "Latest Video"}
      videoDescription={
        primaryVideo?.description || primaryVideo?.subtitle || "Latest edits from the shop."
      }
      videoThumbnail={primaryVideo?.thumbnail ?? null}
      videoUrl={primaryVideo?.videoUrl || "https://www.youtube.com/watch?v=2WapgjbfXNM"}
      heroImage={heroImage}
    />
  )
}
