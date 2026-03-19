import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import ShopClient from "@/app/shop/ShopClient"
import {
  parseMultiValue,
  resolveSearchParam,
  sanitizeSearchTerm,
  SHOP_BADGES,
  SHOP_CATEGORIES,
  SHOP_PRICE_RANGES,
  type ShopFacets,
  type ShopProduct,
  type ShopSearchParams,
} from "@/lib/shop"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Shop - GOOFY. Skate" }

interface ShopPageProps {
  searchParams: Promise<{
    category?: string | string[]
    brand?: string | string[]
    sort?: string | string[]
    badge?: string | string[]
    price?: string | string[]
    q?: string | string[]
    inStock?: string | string[]
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const normalizedSearchParams: ShopSearchParams = {
    category: resolveSearchParam(params.category),
    brand: resolveSearchParam(params.brand),
    sort: resolveSearchParam(params.sort),
    badge: resolveSearchParam(params.badge),
    price: resolveSearchParam(params.price),
    q: resolveSearchParam(params.q),
    inStock: resolveSearchParam(params.inStock),
  }

  const supabase = await createClient()
  const safeQuery = sanitizeSearchTerm(normalizedSearchParams.q)
  const activeCategories = parseMultiValue(normalizedSearchParams.category)
  const activeBrands = parseMultiValue(normalizedSearchParams.brand)

  let query = supabase.from("products").select("*").eq("active", true)

  if (safeQuery) {
    query = query.or(
      `name.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`,
    )
  }

  if (activeCategories.length === 1) {
    query = query.eq("category", activeCategories[0])
  } else if (activeCategories.length > 1) {
    query = query.in("category", activeCategories)
  }

  if (activeBrands.length > 0) {
    query = query.in("brand", activeBrands)
  }

  if (normalizedSearchParams.badge) {
    query = query.eq("badge", normalizedSearchParams.badge)
  }

  switch (normalizedSearchParams.price) {
    case "under500":
      query = query.lt("price", 500_000)
      break
    case "500to1m":
      query = query.gte("price", 500_000).lt("price", 1_000_000)
      break
    case "1mto2m":
      query = query.gte("price", 1_000_000).lt("price", 2_000_000)
      break
    case "above2m":
      query = query.gte("price", 2_000_000)
      break
    default:
      break
  }

  if (normalizedSearchParams.inStock === "true") {
    query = query.gt("stock", 0)
  }

  switch (normalizedSearchParams.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "name_az":
      query = query.order("name", { ascending: true })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const [{ data: products }, { data: allProducts }] = await Promise.all([
    query,
    supabase
      .from("products")
      .select("brand, category, price, badge, stock")
      .eq("active", true),
  ])

  const brandCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  const badgeCounts: Record<string, number> = Object.fromEntries(
    SHOP_BADGES.map((badge) => [badge, 0]),
  )
  const priceCounts: Record<string, number> = Object.fromEntries(
    SHOP_PRICE_RANGES.map((range) => [range.value, 0]),
  )

  for (const row of allProducts ?? []) {
    const brand = typeof row.brand === "string" ? row.brand : null
    const category = typeof row.category === "string" ? row.category : null
    const badge = typeof row.badge === "string" ? row.badge.toUpperCase() : null
    const price = typeof row.price === "number" ? row.price : Number(row.price ?? 0)

    if (brand) {
      brandCounts[brand] = (brandCounts[brand] ?? 0) + 1
    }

    if (category) {
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
    }

    if (badge && badgeCounts[badge] !== undefined) {
      badgeCounts[badge] += 1
    }

    for (const range of SHOP_PRICE_RANGES) {
      const aboveMin = range.min === null ? true : price >= range.min
      const belowMax = range.max === null ? true : price < range.max

      if (aboveMin && belowMax) {
        priceCounts[range.value] += 1
      }
    }
  }

  const brands = [...new Set((allProducts ?? []).map((row) => row.brand).filter(Boolean))]
    .map((brand) => String(brand))
    .sort((a, b) => a.localeCompare(b))

  const facets: ShopFacets = {
    total: allProducts?.length ?? 0,
    categoryCounts,
    brandCounts,
    badgeCounts,
    priceCounts,
  }

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />
      <div className="pt-16">
        <ShopClient
          initialProducts={(products as ShopProduct[] | null) ?? []}
          brands={brands}
          categories={[...SHOP_CATEGORIES]}
          facets={facets}
          searchParams={normalizedSearchParams}
        />
      </div>
      <Footer />
      <SearchCommand />
    </main>
  )
}
