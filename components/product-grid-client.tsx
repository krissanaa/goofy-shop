"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  LayoutGrid,
  List,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useGlobalConfig } from "@/components/global-config-provider"

interface Product {
  id: string
  slug: string
  name: string
  description?: string
  brand?: string
  price?: number
  originalPrice?: number
  badge?: string
  isActive: boolean
  isDropProduct?: boolean
  images?: { url: string; alt?: string }[]
  categories?: { title: string; slug: string }[]
  variants?: { id: string; name: string; price?: number; stock?: number }[]
  createdAt?: string
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "top-rated"
  | "newest"

export type GridMode = "grid" | "list"
export type BadgeFilterOption =
  | "ALL"
  | "NEW"
  | "DROP"
  | "SALE"
  | "HOT"
  | "COLLAB"

interface ProductGridClientProps {
  products: Product[]
  categories?: string[]
  sectionTitle?: string
  initialCategory?: string
  initialBadgeFilter?: BadgeFilterOption
  initialSearch?: string
  initialSort?: SortOption
  defaultView?: GridMode
  initialFavoritesOnly?: boolean
  showSort?: boolean
  showCategoryTabs?: boolean
  showBadgeFilter?: boolean
  showSearch?: boolean
  showViewToggle?: boolean
  showWishlist?: boolean
  showTopStats?: boolean
  promoText?: string
  promoCtaText?: string
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}

interface ProductMeta {
  rating: number
  reviews: number
  badge: "DROP" | "NEW" | "HOT" | "SALE" | "COLLAB"
  panelClass: string
  fallbackEmoji: string
}

interface CoinFx {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  active: boolean
}

const WISHLIST_KEY = "goofy-shop-wishlist-v1"
const FALLBACK_TABS = ["All", "Decks", "Apparel", "Wheels", "Gear"]

const panelClasses = [
  "bg-[#F8E2E8]",
  "bg-[#DDE7F5]",
  "bg-[#F3EED7]",
  "bg-[#E6E9F8]",
  "bg-[#F6DFDF]",
] as const

const badgeClasses: Record<ProductMeta["badge"], string> = {
  DROP: "bg-[#FBD000] text-black",
  NEW: "bg-[#E70009] text-white",
  HOT: "bg-[#FF8A00] text-white",
  SALE: "bg-[#00AA00] text-white",
  COLLAB: "bg-[#2B7FFF] text-white",
}

function seedFromString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getFallbackEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes("deck")) return "🛹"
  if (c.includes("wheel")) return "⚙️"
  if (c.includes("apparel")) return "👕"
  if (c.includes("gear")) return "🧢"
  if (c.includes("truck")) return "🔩"
  return "📦"
}

function getStock(product: Product): number {
  return product.variants?.[0]?.stock ?? 0
}

function normalizeBadge(value: unknown): ProductMeta["badge"] | null {
  if (typeof value !== "string") return null
  const normalized = value.toUpperCase()
  if (
    normalized === "DROP" ||
    normalized === "NEW" ||
    normalized === "HOT" ||
    normalized === "SALE" ||
    normalized === "COLLAB"
  ) {
    return normalized
  }
  return null
}

function getProductMeta(product: Product, index: number): ProductMeta {
  const seed = seedFromString(`${product.id}-${product.slug}-${index}`)
  const rating = Math.round((3.5 + (seed % 15) / 10) * 10) / 10
  const reviews = 20 + (seed % 220)
  const badgeFromCms = normalizeBadge(product.badge)
  const badge: ProductMeta["badge"] = badgeFromCms
    ? badgeFromCms
    : product.isDropProduct
      ? "DROP"
      : seed % 5 === 0
        ? "NEW"
        : seed % 3 === 0
          ? "HOT"
          : "SALE"
  const category = product.categories?.[0]?.title || "Product"

  return {
    rating,
    reviews,
    badge,
    panelClass: panelClasses[index % panelClasses.length],
    fallbackEmoji: getFallbackEmoji(category),
  }
}

function getRatingStars(rating: number): number {
  return Math.max(1, Math.min(5, Math.round(rating)))
}

function parseWishlist(raw: string | null): Set<string> {
  if (!raw) return new Set<string>()

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((v): v is string => typeof v === "string"))
  } catch {
    return new Set<string>()
  }
}

export function ProductGridClient({
  products,
  categories,
  sectionTitle = "OUR PRODUCTS",
  initialCategory = "All",
  initialBadgeFilter = "ALL",
  initialSearch = "",
  initialSort = "featured",
  defaultView = "grid",
  initialFavoritesOnly = false,
  showSort = true,
  showCategoryTabs = true,
  showBadgeFilter = true,
  showSearch = true,
  showViewToggle = true,
  showWishlist = true,
  showTopStats = true,
  promoText = "Buy 2 get 1 free on selected drops",
  promoCtaText = "Grab Deal ->",
  loading,
  error,
  emptyMessage = "No products found.",
}: ProductGridClientProps) {
  const { addItem } = useCart()
  const config = useGlobalConfig()

  const tabs = useMemo(() => {
    if (!categories || categories.length === 0) return FALLBACK_TABS
    return categories.includes("All") ? categories : ["All", ...categories]
  }, [categories])

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedBadge, setSelectedBadge] = useState<BadgeFilterOption>(initialBadgeFilter)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)
  const [viewMode, setViewMode] = useState<GridMode>(defaultView)
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [coins, setCoins] = useState<CoinFx[]>([])
  const coinIdRef = useRef(0)

  useEffect(() => {
    setSelectedCategory(tabs.includes(initialCategory) ? initialCategory : "All")
  }, [initialCategory, tabs])

  useEffect(() => {
    setSearchQuery(initialSearch || "")
  }, [initialSearch])

  useEffect(() => {
    setSelectedBadge(initialBadgeFilter)
  }, [initialBadgeFilter])

  useEffect(() => {
    setFavoritesOnly(initialFavoritesOnly)
  }, [initialFavoritesOnly])

  useEffect(() => {
    if (!showCategoryTabs && selectedCategory !== "All") {
      setSelectedCategory("All")
    }
  }, [selectedCategory, showCategoryTabs])

  useEffect(() => {
    if (!showBadgeFilter && selectedBadge !== "ALL") {
      setSelectedBadge("ALL")
    }
  }, [selectedBadge, showBadgeFilter])

  useEffect(() => {
    if (typeof window === "undefined") return
    setWishlist(parseWishlist(window.localStorage.getItem(WISHLIST_KEY)))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]))
    window.dispatchEvent(new Event("wishlist-updated"))
  }, [wishlist])

  const productsWithMeta = useMemo(
    () =>
      products.map((product, index) => ({
        product,
        meta: getProductMeta(product, index),
      })),
    [products],
  )

  const filteredProducts = useMemo(() => {
    let result = [...productsWithMeta]

    if (favoritesOnly) {
      result = result.filter(({ product }) => wishlist.has(product.id))
    }

    if (selectedCategory !== "All") {
      result = result.filter(({ product }) =>
        product.categories?.some(
          (category) =>
            category.title.toLowerCase() === selectedCategory.toLowerCase(),
        ),
      )
    }

    if (selectedBadge !== "ALL") {
      result = result.filter(({ meta }) => meta.badge === selectedBadge)
    }

    const q = searchQuery.trim().toLowerCase()
    if (q.length > 0) {
      result = result.filter(({ product }) => {
        const name = product.name.toLowerCase()
        const category = product.categories?.[0]?.title.toLowerCase() ?? ""
        const description = product.description?.toLowerCase() ?? ""
        return (
          name.includes(q) ||
          category.includes(q) ||
          description.includes(q)
        )
      })
    }

    if (sortBy === "price-asc") {
      result.sort(
        (a, b) => (a.product.price ?? 0) - (b.product.price ?? 0),
      )
    } else if (sortBy === "price-desc") {
      result.sort(
        (a, b) => (b.product.price ?? 0) - (a.product.price ?? 0),
      )
    } else if (sortBy === "top-rated") {
      result.sort((a, b) => b.meta.rating - a.meta.rating)
    } else if (sortBy === "newest") {
      result.sort((a, b) => {
        const timeA = a.product.createdAt ? new Date(a.product.createdAt).getTime() : 0
        const timeB = b.product.createdAt ? new Date(b.product.createdAt).getTime() : 0
        return timeB - timeA
      })
    }

    return result
  }, [
    favoritesOnly,
    productsWithMeta,
    searchQuery,
    selectedBadge,
    selectedCategory,
    sortBy,
    wishlist,
  ])

  const totalInStock = useMemo(
    () => products.filter((p) => getStock(p) > 0).length,
    [products],
  )
  const avgRating = useMemo(() => {
    if (productsWithMeta.length === 0) return 0
    return (
      productsWithMeta.reduce((sum, item) => sum + item.meta.rating, 0) /
      productsWithMeta.length
    )
  }, [productsWithMeta])

  const spawnCoin = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    const endX = window.innerWidth - 36
    const endY = 42
    const id = coinIdRef.current++

    setCoins((current) => [
      ...current,
      { id, startX, startY, endX, endY, active: false },
    ])

    window.requestAnimationFrame(() => {
      setCoins((current) =>
        current.map((coin) =>
          coin.id === id ? { ...coin, active: true } : coin,
        ),
      )
    })

    window.setTimeout(() => {
      setCoins((current) => current.filter((coin) => coin.id !== id))
    }, 700)
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement>,
    product: Product,
  ) => {
    const stock = getStock(product)
    if (stock <= 0) return

    addItem({
      productId: product.id,
      name: product.name,
      category: product.categories?.[0]?.title ?? "Product",
      price: product.price || 0,
      quantity: 1,
      image: product.images?.[0]?.url || "",
      maxStock: stock,
    })
    spawnCoin(event)
    setAddingId(product.id)
    window.setTimeout(() => {
      setAddingId((current) => (current === product.id ? null : current))
    }, 450)
  }

  const resetFilters = () => {
    setSelectedCategory("All")
    setSelectedBadge("ALL")
    setSearchQuery("")
    setSortBy("featured")
    setFavoritesOnly(false)
  }

  if (loading && products.length === 0) {
    return (
      <div className="border-4 border-black bg-[#E7E7E7] p-8 text-center shadow-[4px_4px_0_#0A0A0A]">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-black">
          Loading products...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-4 border-black bg-[#FFD9D9] p-8 text-center shadow-[4px_4px_0_#0A0A0A]">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-black">
          Error loading products
        </p>
        <p className="mt-2 text-sm text-black/70">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="border-4 border-black bg-[#E7E7E7] p-8 text-center shadow-[4px_4px_0_#0A0A0A]">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-black">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-5">
      <div className="inline-flex items-center border-4 border-black bg-black px-4 py-2 shadow-[4px_4px_0_#FBD000]">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#FBD000]">
          {`* ${sectionTitle}`}
        </span>
      </div>

      {showTopStats ? (
        <div className="grid grid-cols-2 gap-2 border-4 border-black bg-[#EFEFEF] p-2 shadow-[4px_4px_0_#0A0A0A] md:grid-cols-4">
          <div className="border-2 border-black bg-white px-3 py-2">
            <p className="text-xl font-black text-[#E70009]">{products.length}+</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/70">
              Products
            </p>
          </div>
          <div className="border-2 border-black bg-white px-3 py-2">
            <p className="text-xl font-black text-[#2B7FFF]">{totalInStock}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/70">
              In Stock
            </p>
          </div>
          <div className="border-2 border-black bg-white px-3 py-2">
            <p className="text-xl font-black text-[#00AA00]">{avgRating.toFixed(1)}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/70">
              Avg Rating
            </p>
          </div>
          <div className="border-2 border-black bg-white px-3 py-2">
            <p className="text-xl font-black text-[#FBD000]">{tabs.length - 1}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/70">
              Types
            </p>
          </div>
        </div>
      ) : null}

      {showCategoryTabs ? (
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedCategory(tab)}
              className={`border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-[2px_2px_0_#0A0A0A] ${
                selectedCategory === tab
                  ? "border-black bg-black text-white"
                  : "border-black bg-white text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-2 border-black bg-[#EFEFEF] p-2">
        {showSort ? (
          <label className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
            <span>Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="border border-black bg-white px-1 py-0.5 text-[10px] font-semibold uppercase text-black outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="top-rated">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        ) : null}

        {showBadgeFilter ? (
          <label className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
            <span>Badge</span>
            <select
              value={selectedBadge}
              onChange={(event) => setSelectedBadge(event.target.value as BadgeFilterOption)}
              className="border border-black bg-white px-1 py-0.5 text-[10px] font-semibold uppercase text-black outline-none"
            >
              <option value="ALL">All</option>
              <option value="NEW">New</option>
              <option value="SALE">Sale</option>
              <option value="DROP">Drop</option>
              <option value="HOT">Hot</option>
              <option value="COLLAB">Collab</option>
            </select>
          </label>
        ) : null}

        {showViewToggle ? (
          <div className="inline-flex items-center border-2 border-black bg-white">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`grid h-8 w-8 place-items-center ${
                viewMode === "grid"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`grid h-8 w-8 place-items-center border-l-2 border-black ${
                viewMode === "list"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {showSearch ? (
          <label className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1">
            <Search className="h-3.5 w-3.5 text-black/70" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products"
              className="w-40 text-xs font-semibold text-black outline-none placeholder:text-black/50 md:w-56"
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={resetFilters}
          className="border-2 border-black bg-[#FBD000] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black shadow-[2px_2px_0_#0A0A0A]"
        >
          Reset
        </button>

        {showWishlist ? (
          <button
            type="button"
            onClick={() => setFavoritesOnly((current) => !current)}
            className={`inline-flex items-center gap-1 border-2 border-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-[2px_2px_0_#0A0A0A] ${
              favoritesOnly ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-white" : ""}`} />
            Favorites
          </button>
        ) : null}

        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-black/70">
          Showing {filteredProducts.length} products
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="border-4 border-black bg-[#EFEFEF] p-8 text-center shadow-[4px_4px_0_#0A0A0A]">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-black">
            No matching products
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 border-2 border-black bg-[#FBD000] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black shadow-[2px_2px_0_#0A0A0A]"
          >
            Reset Filters
          </button>
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-3"
          }
        >
          {filteredProducts.map(({ product, meta }) => {
            const stock = getStock(product)
            const stars = getRatingStars(meta.rating)
            const hasWish = wishlist.has(product.id)
            const isAdding = addingId === product.id

            return (
              <article
                key={product.id}
                className={`relative border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow] duration-200 [will-change:transform] hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] focus-within:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] ${
                  viewMode === "list"
                    ? "flex gap-3 p-3"
                    : "hover:z-10 hover:-translate-y-1 hover:scale-[1.015] focus-within:z-10 focus-within:-translate-y-1 focus-within:scale-[1.015]"
                }`}
              >
                <div className={viewMode === "list" ? "w-40 shrink-0" : ""}>
                  <div className="flex items-center justify-between border-b-2 border-black bg-white px-2 py-1">
                    <span
                      className={`border border-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${badgeClasses[meta.badge]}`}
                    >
                      {meta.badge}
                    </span>
                    {showWishlist ? (
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className="grid h-5 w-5 place-items-center border border-black bg-white text-black transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FBD000] active:translate-y-0.5"
                        aria-label={
                          hasWish
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            hasWish
                              ? "fill-[#E70009] text-[#E70009] scale-110"
                              : "text-black"
                          }`}
                        />
                      </button>
                    ) : null}
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className={`block border-b-2 border-black ${meta.panelClass}`}
                  >
                    <div className="relative flex h-36 items-center justify-center bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:12px_12px]">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          width={112}
                          height={112}
                          sizes="224px"
                          className="h-28 w-28 object-contain drop-shadow-[2px_2px_0_#0A0A0A]"
                        />
                      ) : (
                        <span className="text-6xl">{meta.fallbackEmoji}</span>
                      )}
                    </div>
                  </Link>
                </div>

                <div className={`flex flex-1 flex-col ${viewMode === "list" ? "" : "p-2"}`}>
                  <Link
                    href={`/product/${product.slug}`}
                    className={`${viewMode === "list" ? "p-1" : ""}`}
                  >
                    <h3 className="line-clamp-1 text-sm font-black uppercase tracking-[0.08em] text-black">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-9 text-xs text-black/70">
                      {product.description || "Premium streetwear essentials."}
                    </p>
                  </Link>

                  <div className={`${viewMode === "list" ? "mt-2 px-1" : "mt-2"} space-y-1`}>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${product.id}-star-${starIndex}`}
                          className={`h-3 w-3 ${
                            starIndex < stars
                              ? "fill-[#FBD000] text-[#FBD000]"
                              : "text-black/30"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[10px] font-semibold text-black/60">
                        ({meta.reviews})
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-[#E70009]">
                          {formatPrice(Number(product.price || 0))}
                        </span>
                        {product.originalPrice && product.originalPrice > (product.price || 0) ? (
                          <span className="text-xs text-black/50 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        ) : null}
                      </div>
                      {stock > 0 && stock <= 10 ? (
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#E70009]">
                          Only {stock} left
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className={`${viewMode === "list" ? "mt-auto px-1 pb-1" : "mt-2"}`}>
                    <button
                      type="button"
                      onClick={(event) => handleAddToCart(event, product)}
                      disabled={stock <= 0}
                      className={`inline-flex h-9 w-full items-center justify-center gap-2 border-2 border-black text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[2px_2px_0_#0A0A0A] transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#0A0A0A] disabled:cursor-not-allowed disabled:bg-[#8A8A8A] ${
                        isAdding
                          ? "bg-[#00AA00]"
                          : "bg-black hover:bg-[#E70009]"
                      }`}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {stock <= 0
                        ? config.ui.soldOutText
                        : isAdding
                          ? "Added"
                          : config.ui.addToCartText}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      <div className="border-4 border-black bg-[#E70009] p-5 shadow-[4px_4px_0_#0A0A0A]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xl font-bold uppercase text-white">1-UP DEAL</p>
            <p className="mt-1 font-mono text-sm font-bold uppercase text-white">
              {promoText}
            </p>
          </div>
          <button
            type="button"
            className="border-2 border-black bg-[#FBD000] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black shadow-[2px_2px_0_#0A0A0A] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            {promoCtaText}
          </button>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[70]">
        {coins.map((coin) => (
          <span
            key={coin.id}
            className="fixed text-xl"
            style={{
              left: coin.active ? coin.endX : coin.startX,
              top: coin.active ? coin.endY : coin.startY,
              transform: `translate(-50%, -50%) scale(${coin.active ? 0.3 : 1})`,
              opacity: coin.active ? 0 : 1,
              transition:
                "left 650ms cubic-bezier(0.68,-0.6,0.32,1.6), top 650ms cubic-bezier(0.68,-0.6,0.32,1.6), transform 650ms cubic-bezier(0.68,-0.6,0.32,1.6), opacity 650ms ease-out",
            }}
          >
            🪙
          </span>
        ))}
      </div>
    </div>
  )
}
