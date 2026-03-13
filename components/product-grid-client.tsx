"use client"

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
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
  fallbackLabel: string
}

interface CoinFx {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  active: boolean
}

type ShopCategoryOption =
  | "All Products"
  | "Decks"
  | "Trucks"
  | "Wheels"
  | "Shoes"
  | "Apparel"
  | "Gear"
  | "Accessories"

type ShopBrandOption =
  | "GOOFY WORLD"
  | "Independent"
  | "Spitfire"
  | "Vans"
  | "Nike SB"
  | "Powell Peralta"
  | "Thrasher"
  | "Bones"

type ShopCollectionOption = Exclude<BadgeFilterOption, "ALL">

interface ShopItem {
  product: Product
  meta: ProductMeta
  categoryKey: ShopCategoryOption
  brandKey: ShopBrandOption
  stock: number
  currentPrice: number
  discountPercent: number | null
  searchText: string
  editionNumber: number
  editionTotal: number
}

interface ShopFilterState {
  categories: ShopCategoryOption[]
  brands: ShopBrandOption[]
  collections: ShopCollectionOption[]
  minPrice: number | null
  maxPrice: number | null
  searchQuery: string
  favoritesOnly: boolean
  wishlist: Set<string>
}

const WISHLIST_KEY = "goofy-shop-wishlist-v1"
const FALLBACK_TABS = ["All", "Decks", "Apparel", "Wheels", "Gear"]
const SHOP_CATEGORY_OPTIONS: ShopCategoryOption[] = [
  "All Products",
  "Decks",
  "Trucks",
  "Wheels",
  "Shoes",
  "Apparel",
  "Gear",
  "Accessories",
]
const SHOP_BRAND_OPTIONS: ShopBrandOption[] = [
  "GOOFY WORLD",
  "Independent",
  "Spitfire",
  "Vans",
  "Nike SB",
  "Powell Peralta",
  "Thrasher",
  "Bones",
]
const SHOP_COLLECTION_OPTIONS: ShopCollectionOption[] = [
  "NEW",
  "HOT",
  "SALE",
  "COLLAB",
  "DROP",
]
const SHOP_COLLECTION_META: Record<ShopCollectionOption, { label: string; color: string }> = {
  NEW: { label: "New Arrivals", color: "#5C94FC" },
  HOT: { label: "Hot", color: "#C84B0C" },
  SALE: { label: "Sale", color: "#E52222" },
  COLLAB: { label: "Collab", color: "#C9962A" },
  DROP: { label: "Drop", color: "#F8B800" },
}

const barlowFontStyle = {
  fontFamily: "'Barlow Condensed', var(--font-barlow-condensed), sans-serif",
}

const monoFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const graphPaperStyle: CSSProperties = {
  backgroundColor: "#F5EFE0",
  backgroundImage:
    "linear-gradient(rgba(10,14,26,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(10,14,26,0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
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

function getStock(product: Product): number {
  return product.variants?.[0]?.stock ?? 0
}

function getProductMeta(product: Product, index: number): ProductMeta {
  const seed = seedFromString(`${product.id}-${product.slug}-${index}`)
  const badgeFromCms = typeof product.badge === "string" ? product.badge.toUpperCase() : ""
  const badge: ProductMeta["badge"] =
    badgeFromCms === "NEW" ||
    badgeFromCms === "HOT" ||
    badgeFromCms === "SALE" ||
    badgeFromCms === "COLLAB" ||
    badgeFromCms === "DROP"
      ? badgeFromCms
      : product.isDropProduct
        ? "DROP"
        : seed % 5 === 0
          ? "NEW"
          : seed % 3 === 0
            ? "HOT"
            : "SALE"

  return {
    rating: Math.round((3.5 + (seed % 15) / 10) * 10) / 10,
    reviews: 20 + (seed % 220),
    badge,
    fallbackLabel: (product.categories?.[0]?.title || "Product").toUpperCase(),
  }
}

function parseWishlist(raw: string | null): Set<string> {
  if (!raw) return new Set<string>()
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? new Set(parsed.filter((value): value is string => typeof value === "string"))
      : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

function normalizeShopCategory(value: string): ShopCategoryOption {
  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === "all" || normalized === "all products") return "All Products"
  if (normalized.includes("deck")) return "Decks"
  if (normalized.includes("truck")) return "Trucks"
  if (normalized.includes("wheel")) return "Wheels"
  if (normalized.includes("shoe") || normalized.includes("vans") || normalized.includes("nike")) return "Shoes"
  if (normalized.includes("apparel") || normalized.includes("shirt") || normalized.includes("tee") || normalized.includes("hoodie")) return "Apparel"
  if (normalized.includes("accessor")) return "Accessories"
  return normalized.includes("gear") ? "Gear" : "Gear"
}

function resolveShopBrand(product: Product): ShopBrandOption {
  const source = `${product.brand ?? ""} ${product.name} ${product.description ?? ""}`.toLowerCase()
  if (source.includes("independent")) return "Independent"
  if (source.includes("spitfire")) return "Spitfire"
  if (source.includes("vans")) return "Vans"
  if (source.includes("nike")) return "Nike SB"
  if (source.includes("powell")) return "Powell Peralta"
  if (source.includes("thrasher")) return "Thrasher"
  if (source.includes("bones")) return "Bones"
  return "GOOFY WORLD"
}

function getDiscountPercent(product: Product): number | null {
  if (
    typeof product.originalPrice !== "number" ||
    typeof product.price !== "number" ||
    product.originalPrice <= product.price ||
    product.originalPrice <= 0
  ) {
    return null
  }
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}

function getStockBarWidth(stock: number): string {
  return `${Math.max(8, Math.min(100, Math.round((stock / 24) * 100)))}%`
}

function matchesShopFilters(item: ShopItem, filters: ShopFilterState): boolean {
  const query = filters.searchQuery.trim().toLowerCase()
  if (filters.favoritesOnly && !filters.wishlist.has(item.product.id)) return false
  if (filters.categories.length > 0 && !filters.categories.includes(item.categoryKey)) return false
  if (filters.brands.length > 0 && !filters.brands.includes(item.brandKey)) return false
  if (filters.collections.length > 0 && !filters.collections.includes(item.meta.badge)) return false
  if (filters.minPrice != null && item.currentPrice < filters.minPrice) return false
  if (filters.maxPrice != null && item.currentPrice > filters.maxPrice) return false
  if (query && !item.searchText.includes(query)) return false
  return true
}

export function ProductGridClient(props: ProductGridClientProps) {
  const {
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
    promoCtaText = "Grab Deal",
    loading,
    error,
    emptyMessage = "No products found.",
  } = props

  const { addItem } = useCart()
  const config = useGlobalConfig()
  const pathname = usePathname()
  const isShopSidebarLayout = pathname === "/shop" || pathname === "/products"

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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const coinIdRef = useRef(0)

  const [shopSelectedCategories, setShopSelectedCategories] = useState<ShopCategoryOption[]>([])
  const [shopSelectedBrands, setShopSelectedBrands] = useState<ShopBrandOption[]>([])
  const [shopSelectedCollections, setShopSelectedCollections] = useState<ShopCollectionOption[]>([])
  const [minPriceInput, setMinPriceInput] = useState("")
  const [maxPriceInput, setMaxPriceInput] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [currentPage, setCurrentPage] = useState(1)
  const [shopSectionsOpen, setShopSectionsOpen] = useState({
    category: true,
    brand: true,
    collection: true,
    price: true,
  })

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
    if (typeof window === "undefined") return
    setWishlist(parseWishlist(window.localStorage.getItem(WISHLIST_KEY)))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]))
    window.dispatchEvent(new Event("wishlist-updated"))
  }, [wishlist])

  useEffect(() => {
    if (!isShopSidebarLayout) return
    const normalizedCategory = normalizeShopCategory(initialCategory)
    setShopSelectedCategories(
      normalizedCategory === "All Products" ? [] : [normalizedCategory],
    )
  }, [initialCategory, isShopSidebarLayout])

  useEffect(() => {
    if (!isShopSidebarLayout) return
    setShopSelectedCollections(
      initialBadgeFilter === "ALL" ? [] : [initialBadgeFilter],
    )
  }, [initialBadgeFilter, isShopSidebarLayout])

  const productsWithMeta = useMemo(
    () =>
      products.map((product, index) => ({
        product,
        meta: getProductMeta(product, index),
      })),
    [products],
  )

  const shopItems = useMemo<ShopItem[]>(
    () =>
      productsWithMeta.map(({ product, meta }, index) => {
        const categoryTitle = product.categories?.[0]?.title || "Gear"
        return {
          product,
          meta,
          categoryKey: normalizeShopCategory(categoryTitle),
          brandKey: resolveShopBrand(product),
          stock: getStock(product),
          currentPrice: Number(product.price || 0),
          discountPercent: getDiscountPercent(product),
          searchText: `${product.name} ${product.description ?? ""} ${categoryTitle} ${product.brand ?? ""}`.toLowerCase(),
          editionNumber: (seedFromString(`${product.id}-${product.slug}-${index}-shop`) % 50) + 1,
          editionTotal: 50,
        }
      }),
    [productsWithMeta],
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

    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter(({ product }) =>
        `${product.name} ${product.description ?? ""} ${product.categories?.[0]?.title ?? ""}`
          .toLowerCase()
          .includes(query),
      )
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.product.price ?? 0) - (b.product.price ?? 0))
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.product.price ?? 0) - (a.product.price ?? 0))
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

  const parsedMinPrice = useMemo(() => {
    const value = Number(minPriceInput)
    return minPriceInput.trim() && Number.isFinite(value) ? value : null
  }, [minPriceInput])

  const parsedMaxPrice = useMemo(() => {
    const value = Number(maxPriceInput)
    return maxPriceInput.trim() && Number.isFinite(value) ? value : null
  }, [maxPriceInput])

  const currentShopFilters = useMemo<ShopFilterState>(
    () => ({
      categories: shopSelectedCategories,
      brands: shopSelectedBrands,
      collections: shopSelectedCollections,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      searchQuery,
      favoritesOnly,
      wishlist,
    }),
    [
      favoritesOnly,
      parsedMaxPrice,
      parsedMinPrice,
      searchQuery,
      shopSelectedBrands,
      shopSelectedCategories,
      shopSelectedCollections,
      wishlist,
    ],
  )

  const shopFilteredProducts = useMemo(() => {
    let result = shopItems.filter((item) => matchesShopFilters(item, currentShopFilters))

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.currentPrice - b.currentPrice)
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.currentPrice - a.currentPrice)
    } else if (sortBy === "top-rated") {
      result = [...result].sort((a, b) => b.meta.rating - a.meta.rating)
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => {
        const timeA = a.product.createdAt ? new Date(a.product.createdAt).getTime() : 0
        const timeB = b.product.createdAt ? new Date(b.product.createdAt).getTime() : 0
        return timeB - timeA
      })
    }

    return result
  }, [currentShopFilters, shopItems, sortBy])

  const categoryCounts = useMemo(() => {
    const counts = new Map<ShopCategoryOption, number>()
    SHOP_CATEGORY_OPTIONS.forEach((option) => {
      counts.set(
        option,
        shopItems.filter((item) =>
          matchesShopFilters(item, {
            ...currentShopFilters,
            categories: option === "All Products" ? [] : [option],
          }),
        ).length,
      )
    })
    return counts
  }, [currentShopFilters, shopItems])

  const brandCounts = useMemo(() => {
    const counts = new Map<ShopBrandOption, number>()
    SHOP_BRAND_OPTIONS.forEach((option) => {
      counts.set(
        option,
        shopItems.filter((item) =>
          matchesShopFilters(item, { ...currentShopFilters, brands: [option] }),
        ).length,
      )
    })
    return counts
  }, [currentShopFilters, shopItems])

  const collectionCounts = useMemo(() => {
    const counts = new Map<ShopCollectionOption, number>()
    SHOP_COLLECTION_OPTIONS.forEach((option) => {
      counts.set(
        option,
        shopItems.filter((item) =>
          matchesShopFilters(item, {
            ...currentShopFilters,
            collections: [option],
          }),
        ).length,
      )
    })
    return counts
  }, [currentShopFilters, shopItems])

  useEffect(() => {
    if (!isShopSidebarLayout) return
    setCurrentPage(1)
  }, [
    favoritesOnly,
    isShopSidebarLayout,
    itemsPerPage,
    maxPriceInput,
    minPriceInput,
    searchQuery,
    shopSelectedBrands,
    shopSelectedCategories,
    shopSelectedCollections,
    sortBy,
    viewMode,
  ])

  const totalShopPages = Math.max(1, Math.ceil(shopFilteredProducts.length / itemsPerPage))
  const paginatedShopProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return shopFilteredProducts.slice(start, start + itemsPerPage)
  }, [currentPage, itemsPerPage, shopFilteredProducts])

  const activeShopChips = useMemo(
    () => [
      ...shopSelectedCategories.map((value) => ({
        key: `category-${value}`,
        group: "category" as const,
        value,
        label: value,
      })),
      ...shopSelectedBrands.map((value) => ({
        key: `brand-${value}`,
        group: "brand" as const,
        value,
        label: value,
      })),
      ...shopSelectedCollections.map((value) => ({
        key: `collection-${value}`,
        group: "collection" as const,
        value,
        label: SHOP_COLLECTION_META[value].label,
      })),
      ...(parsedMinPrice != null || parsedMaxPrice != null
        ? [
            {
              key: "price",
              group: "price" as const,
              value: "price",
              label: `${parsedMinPrice != null ? `$${parsedMinPrice}` : "$0"} - ${parsedMaxPrice != null ? `$${parsedMaxPrice}` : "up"}`,
            },
          ]
        : []),
      ...(searchQuery.trim()
        ? [
            {
              key: "search",
              group: "search" as const,
              value: "search",
              label: `Search: ${searchQuery.trim()}`,
            },
          ]
        : []),
    ],
    [
      parsedMaxPrice,
      parsedMinPrice,
      searchQuery,
      shopSelectedBrands,
      shopSelectedCategories,
      shopSelectedCollections,
    ],
  )

  const totalInStock = useMemo(
    () => products.filter((product) => getStock(product) > 0).length,
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
    const id = coinIdRef.current++
    setCoins((current) => [
      ...current,
      {
        id,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: window.innerWidth - 36,
        endY: 42,
        active: false,
      },
    ])
    window.requestAnimationFrame(() => {
      setCoins((current) =>
        current.map((coin) => (coin.id === id ? { ...coin, active: true } : coin)),
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

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>, product: Product) => {
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
    if (!isShopSidebarLayout) spawnCoin(event)
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
    setShopSelectedCategories([])
    setShopSelectedBrands([])
    setShopSelectedCollections([])
    setMinPriceInput("")
    setMaxPriceInput("")
    setItemsPerPage(24)
    setCurrentPage(1)
  }

  const toggleShopSection = (section: keyof typeof shopSectionsOpen) => {
    setShopSectionsOpen((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  const toggleShopCategory = (option: ShopCategoryOption) => {
    if (option === "All Products") {
      setShopSelectedCategories([])
      return
    }
    setShopSelectedCategories((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option],
    )
  }

  const toggleShopBrand = (option: ShopBrandOption) => {
    setShopSelectedBrands((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option],
    )
  }

  const toggleShopCollection = (option: ShopCollectionOption) => {
    setShopSelectedCollections((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option],
    )
  }

  const removeShopChip = (
    group: "category" | "brand" | "collection" | "price" | "search",
    value: string,
  ) => {
    if (group === "category") {
      setShopSelectedCategories((current) => current.filter((item) => item !== value))
      return
    }
    if (group === "brand") {
      setShopSelectedBrands((current) => current.filter((item) => item !== value))
      return
    }
    if (group === "collection") {
      setShopSelectedCollections((current) => current.filter((item) => item !== value))
      return
    }
    if (group === "price") {
      setMinPriceInput("")
      setMaxPriceInput("")
      return
    }
    setSearchQuery("")
  }

  useEffect(() => {
    if (!isShopSidebarLayout) return
    if (currentPage > totalShopPages) {
      setCurrentPage(totalShopPages)
    }
  }, [currentPage, isShopSidebarLayout, totalShopPages])

  if (loading && products.length === 0) {
    return <div className="rounded-[24px] border border-black/10 bg-white p-8 text-center">Loading products...</div>
  }

  if (error) {
    return <div className="rounded-[24px] border border-[#E52222]/20 bg-[#FFF2F1] p-8 text-center">{error}</div>
  }

  if (products.length === 0) {
    return <div className="rounded-[24px] border border-black/10 bg-white p-8 text-center">{emptyMessage}</div>
  }

  if (isShopSidebarLayout) {
    return (
      <div className="space-y-5 rounded-[28px] border border-black/10 p-4 md:p-6" style={graphPaperStyle}>
        <div className="rounded-[20px] border border-black/10 bg-[#FBF7EE] px-4 py-3 text-[12px] uppercase tracking-[0.1em] text-black/70" style={monoFontStyle}>
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <span className="mx-2 text-black/35">&rsaquo;</span>
          <span className="text-black">All Products</span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-[220px] lg:flex-none">
            <div className="rounded-[24px] border border-black/10 bg-[#FBF8EF] p-4 lg:sticky lg:top-24 lg:border-r">
              <div className="space-y-4">
                {([
                  { key: "category", label: "Category" },
                  { key: "brand", label: "Brand" },
                  { key: "collection", label: "Collection" },
                  { key: "price", label: "Price" },
                ] as const).map((section) => (
                  <div key={section.key} className={section.key === "price" ? "" : "border-b border-black/10 pb-4"}>
                    <button type="button" onClick={() => toggleShopSection(section.key)} className="flex w-full items-center justify-between text-left">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-black" style={monoFontStyle}>
                        {section.label}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-black/60 transition-transform ${shopSectionsOpen[section.key] ? "rotate-0" : "-rotate-90"}`} />
                    </button>

                    {shopSectionsOpen[section.key] ? (
                      <div className="mt-3">
                        {section.key === "category" ? (
                          <div className="space-y-2">
                            {SHOP_CATEGORY_OPTIONS.map((option) => {
                              const checked = option === "All Products" ? shopSelectedCategories.length === 0 : shopSelectedCategories.includes(option)
                              return (
                                <label key={option} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/70">
                                  <span className="flex items-center gap-3">
                                    <input type="checkbox" checked={checked} onChange={() => toggleShopCategory(option)} className="h-4 w-4 rounded border-black/20 text-[#0A0E1A] focus:ring-[#0A0E1A]" />
                                    <span className="text-[12px] uppercase tracking-[0.08em] text-black/80" style={monoFontStyle}>{option}</span>
                                  </span>
                                  <span className="text-[11px] text-black/45" style={monoFontStyle}>{categoryCounts.get(option) ?? 0}</span>
                                </label>
                              )
                            })}
                          </div>
                        ) : null}

                        {section.key === "brand" ? (
                          <div className="space-y-2">
                            {SHOP_BRAND_OPTIONS.map((option) => (
                              <label key={option} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/70">
                                <span className="flex items-center gap-3">
                                  <input type="checkbox" checked={shopSelectedBrands.includes(option)} onChange={() => toggleShopBrand(option)} className="h-4 w-4 rounded border-black/20 text-[#0A0E1A] focus:ring-[#0A0E1A]" />
                                  <span className="text-[12px] uppercase tracking-[0.08em] text-black/80" style={monoFontStyle}>{option}</span>
                                </span>
                                <span className="text-[11px] text-black/45" style={monoFontStyle}>{brandCounts.get(option) ?? 0}</span>
                              </label>
                            ))}
                          </div>
                        ) : null}

                        {section.key === "collection" ? (
                          <div className="space-y-2">
                            {SHOP_COLLECTION_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleShopCollection(option)}
                                className={`flex w-full items-center justify-between gap-3 rounded-full border px-3 py-2 text-left transition-colors ${shopSelectedCollections.includes(option) ? "border-black/15 bg-white text-black" : "border-transparent bg-transparent text-black/80 hover:bg-white/65"}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${option === "DROP" ? "animate-pulse" : ""}`} style={{ backgroundColor: SHOP_COLLECTION_META[option].color }} />
                                  <span className="text-[12px] uppercase tracking-[0.08em]" style={monoFontStyle}>{SHOP_COLLECTION_META[option].label}</span>
                                </span>
                                <span className="text-[11px] text-black/45" style={monoFontStyle}>{collectionCounts.get(option) ?? 0}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {section.key === "price" ? (
                          <div className="flex items-center gap-2">
                            <input value={minPriceInput} onChange={(event) => setMinPriceInput(event.target.value)} inputMode="numeric" placeholder="Min" className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/30" style={monoFontStyle} />
                            <span className="text-black/35" style={monoFontStyle}>-</span>
                            <input value={maxPriceInput} onChange={(event) => setMaxPriceInput(event.target.value)} inputMode="numeric" placeholder="Max" className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/30" style={monoFontStyle} />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}

                <button type="button" onClick={resetFilters} className="mt-2 w-full rounded-full border border-black/15 bg-[#0A0E1A] px-4 py-3 text-[12px] uppercase tracking-[0.12em] text-[#F8B800] transition-colors hover:bg-black" style={monoFontStyle}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="rounded-[24px] border border-black/10 bg-[#FBF7EE] p-4 md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-[3rem] uppercase leading-[0.88] text-[#0A0E1A]" style={barlowFontStyle}>All Products</h2>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.08em] text-black/60" style={monoFontStyle}>
                    {shopFilteredProducts.length} products found
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-black/65" style={monoFontStyle}>
                    <span>Sort</span>
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="bg-transparent text-black outline-none">
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price Low to High</option>
                      <option value="price-desc">Price High to Low</option>
                      <option value="top-rated">Top Rated</option>
                      <option value="newest">Newest</option>
                    </select>
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-black/65" style={monoFontStyle}>
                    <span>Per page</span>
                    <select value={itemsPerPage} onChange={(event) => setItemsPerPage(Number(event.target.value))} className="bg-transparent text-black outline-none">
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </label>
                  <div className="inline-flex overflow-hidden rounded-full border border-black/10 bg-white">
                    <button type="button" onClick={() => setViewMode("grid")} className={`grid h-10 w-10 place-items-center ${viewMode === "grid" ? "bg-[#0A0E1A] text-[#F8B800]" : "text-black/55"}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setViewMode("list")} className={`grid h-10 w-10 place-items-center border-l border-black/10 ${viewMode === "list" ? "bg-[#0A0E1A] text-[#F8B800]" : "text-black/55"}`} aria-label="List view"><List className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              {activeShopChips.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeShopChips.map((chip) => (
                    <button key={chip.key} type="button" onClick={() => removeShopChip(chip.group, chip.value)} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-black/70 transition-colors hover:border-black/20 hover:text-black" style={monoFontStyle}>
                      <span>{chip.label}</span>
                      <span className="text-black/40">x</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {shopFilteredProducts.length === 0 ? (
              <div className="rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center">
                <p className="text-[13px] uppercase tracking-[0.12em] text-black/55" style={monoFontStyle}>No matching products</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                {paginatedShopProducts.map((item) => {
                  const { product, meta, stock, currentPrice } = item
                  const hasWish = wishlist.has(product.id)
                  const isAdding = addingId === product.id
                  const categoryLabel = product.categories?.[0]?.title || item.categoryKey
                  const imageUrl = product.images?.[0]?.url
                  const hasImage = Boolean(imageUrl) && !imageErrors[product.id]
                  const priceColor = meta.badge === "DROP" ? "#F8B800" : "#0A0E1A"
                  const buttonClass = meta.badge === "DROP" ? "bg-[#F8B800] text-[#0A0E1A] hover:bg-[#FFD24D]" : "bg-[#0A0E1A] text-white hover:bg-[#1A2334]"

                  return (
                    <article key={product.id} className={`group overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_14px_34px_rgba(10,14,26,0.08)] ${viewMode === "grid" ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,14,26,0.12)]" : ""}`}>
                      <div className={viewMode === "list" ? "flex flex-col md:flex-row" : ""}>
                        <Link href={`/product/${product.slug}`} className={`block ${viewMode === "list" ? "relative md:w-[280px] md:flex-none" : ""}`}>
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE2D5]">
                            {hasImage ? (
                              <Image src={imageUrl!} alt={product.images?.[0]?.alt || product.name} fill sizes={viewMode === "grid" ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" : "(max-width: 768px) 100vw, 280px"} onError={() => setImageErrors((current) => current[product.id] ? current : { ...current, [product.id]: true })} className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.18em] text-black/35" style={monoFontStyle}>Image Soon</div>
                            )}

                            <div className="absolute left-4 top-4 z-10">
                              {meta.badge === "SALE" && item.discountPercent ? (
                                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[#E52222] px-2 text-[11px] text-white" style={monoFontStyle}>-{item.discountPercent}%</span>
                              ) : (
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.08em] ${meta.badge === "DROP" ? "animate-pulse" : ""}`} style={{ ...monoFontStyle, backgroundColor: SHOP_COLLECTION_META[meta.badge].color, color: meta.badge === "DROP" ? "#0A0E1A" : "#FFFFFF" }}>
                                  {SHOP_COLLECTION_META[meta.badge].label}
                                </span>
                              )}
                            </div>

                            {showWishlist ? (
                              <button type="button" onClick={(event) => { event.preventDefault(); toggleWishlist(product.id) }} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-[#0A0E1A] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100" aria-label={hasWish ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}>
                                <Heart className={`h-4 w-4 ${hasWish ? "fill-[#E52222] text-[#E52222]" : ""}`} />
                              </button>
                            ) : null}

                            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/28 to-transparent" />
                            <div className={`absolute inset-x-0 bottom-0 z-10 p-4 ${viewMode === "grid" ? "pb-20" : ""}`}>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-white/72" style={monoFontStyle}>{categoryLabel}</p>
                              <h3 className={`mt-1 line-clamp-2 uppercase text-white ${viewMode === "grid" ? "text-[2.15rem] leading-[0.82]" : "text-[2rem] leading-[0.86]"}`} style={barlowFontStyle}>{product.name}</h3>
                            </div>

                            {viewMode === "grid" ? (
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
                                <button type="button" onClick={(event) => handleAddToCart(event, product)} disabled={stock <= 0} className={`pointer-events-auto inline-flex h-11 w-full items-center justify-center rounded-full text-[12px] uppercase tracking-[0.12em] opacity-0 translate-y-6 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35 ${buttonClass}`} style={monoFontStyle}>
                                  {stock <= 0 ? config.ui.soldOutText : isAdding ? "Added" : config.ui.addToCartText}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </Link>

                        <div className={`${viewMode === "list" ? "flex flex-1 flex-col p-5" : "space-y-3 px-4 py-4"}`}>
                          {viewMode === "list" ? (
                            <p className="text-sm leading-relaxed text-black/68">
                              {product.description || "Built for the streets with clean silhouettes and durable setup details."}
                            </p>
                          ) : null}

                          <div className={`${viewMode === "list" ? "mt-auto" : ""} space-y-3`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`${viewMode === "list" ? "text-[1.6rem]" : "text-[1.7rem]"} leading-none`} style={{ ...barlowFontStyle, color: priceColor }}>{formatPrice(currentPrice)}</span>
                                  {typeof product.originalPrice === "number" && product.originalPrice > currentPrice ? (
                                    <span className="text-[12px] text-black/35 line-through" style={monoFontStyle}>{formatPrice(product.originalPrice)}</span>
                                  ) : null}
                                </div>
                                {meta.badge === "COLLAB" ? (
                                  <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-black/55" style={monoFontStyle}>#{item.editionNumber}/{item.editionTotal}</p>
                                ) : null}
                              </div>
                              <p className="text-right text-[11px] uppercase tracking-[0.08em] text-[#E52222]" style={monoFontStyle}>
                                {stock > 0 ? `${stock} left` : "Sold out"}
                              </p>
                            </div>

                            {item.discountPercent ? (
                              <div className="space-y-1.5">
                                <div className="h-1.5 overflow-hidden rounded-full bg-[#F2DDD8]">
                                  <div className="h-full rounded-full bg-[#E52222]" style={{ width: getStockBarWidth(stock) }} />
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.08em] text-[#E52222]" style={monoFontStyle}>Selling fast</p>
                              </div>
                            ) : null}

                            {viewMode === "list" ? (
                              <button type="button" onClick={(event) => handleAddToCart(event, product)} disabled={stock <= 0} className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[12px] uppercase tracking-[0.12em] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35 ${buttonClass}`} style={monoFontStyle}>
                                {stock <= 0 ? config.ui.soldOutText : isAdding ? "Added" : config.ui.addToCartText}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
            {shopFilteredProducts.length > 0 && totalShopPages > 1 ? (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[11px] uppercase tracking-[0.08em] text-black/65 transition-colors hover:text-black disabled:cursor-not-allowed disabled:text-black/25" style={monoFontStyle}>Prev</button>
                {Array.from({ length: totalShopPages }, (_, index) => index + 1).map((page) => (
                  <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`grid h-10 min-w-10 place-items-center rounded-full border text-[11px] uppercase tracking-[0.08em] transition-colors ${page === currentPage ? "border-[#0A0E1A] bg-[#0A0E1A] text-[#F8B800]" : "border-black/10 bg-white text-black/65 hover:text-black"}`} style={monoFontStyle}>{page}</button>
                ))}
                <button type="button" onClick={() => setCurrentPage((value) => Math.min(totalShopPages, value + 1))} disabled={currentPage === totalShopPages} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[11px] uppercase tracking-[0.08em] text-black/65 transition-colors hover:text-black disabled:cursor-not-allowed disabled:text-black/25" style={monoFontStyle}>Next</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-5">
      <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-black/65" style={monoFontStyle}>{sectionTitle}</span>
      </div>

      {showTopStats ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3"><p className="text-[2rem] leading-none text-[#E52222]" style={barlowFontStyle}>{products.length}</p><p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-black/55" style={monoFontStyle}>Products</p></div>
          <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3"><p className="text-[2rem] leading-none text-[#2B7FFF]" style={barlowFontStyle}>{totalInStock}</p><p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-black/55" style={monoFontStyle}>In Stock</p></div>
          <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3"><p className="text-[2rem] leading-none text-[#00AA00]" style={barlowFontStyle}>{avgRating.toFixed(1)}</p><p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-black/55" style={monoFontStyle}>Avg Rating</p></div>
          <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3"><p className="text-[2rem] leading-none text-[#F8B800]" style={barlowFontStyle}>{tabs.length - 1}</p><p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-black/55" style={monoFontStyle}>Categories</p></div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-black/10 bg-[#FBF7EE] p-3">
        {showCategoryTabs ? tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setSelectedCategory(tab)} className={`rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.08em] ${selectedCategory === tab ? "border-[#0A0E1A] bg-[#0A0E1A] text-[#F8B800]" : "border-black/10 bg-white text-black/70"}`} style={monoFontStyle}>{tab}</button>
        )) : null}
        {showBadgeFilter ? (
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-black/65" style={monoFontStyle}>
            <span>Badge</span>
            <select value={selectedBadge} onChange={(event) => setSelectedBadge(event.target.value as BadgeFilterOption)} className="bg-transparent text-black outline-none">
              <option value="ALL">All</option><option value="NEW">New</option><option value="HOT">Hot</option><option value="SALE">Sale</option><option value="COLLAB">Collab</option><option value="DROP">Drop</option>
            </select>
          </label>
        ) : null}
        {showSort ? (
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-black/65" style={monoFontStyle}>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="bg-transparent text-black outline-none">
              <option value="featured">Featured</option><option value="price-asc">Price Low to High</option><option value="price-desc">Price High to Low</option><option value="top-rated">Top Rated</option><option value="newest">Newest</option>
            </select>
          </label>
        ) : null}
        {showSearch ? (
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2"><Search className="h-4 w-4 text-black/45" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products" className="w-48 text-sm text-black outline-none placeholder:text-black/35" style={monoFontStyle} /></label>
        ) : null}
        {showViewToggle ? (
          <div className="inline-flex overflow-hidden rounded-full border border-black/10 bg-white">
            <button type="button" onClick={() => setViewMode("grid")} className={`grid h-10 w-10 place-items-center ${viewMode === "grid" ? "bg-[#0A0E1A] text-[#F8B800]" : "text-black/55"}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setViewMode("list")} className={`grid h-10 w-10 place-items-center border-l border-black/10 ${viewMode === "list" ? "bg-[#0A0E1A] text-[#F8B800]" : "text-black/55"}`} aria-label="List view"><List className="h-4 w-4" /></button>
          </div>
        ) : null}
        <button type="button" onClick={resetFilters} className="rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-black/60" style={monoFontStyle}>Reset</button>
      </div>

      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
        {filteredProducts.map(({ product, meta }) => {
          const hasWish = wishlist.has(product.id)
          const imageUrl = product.images?.[0]?.url
          const hasImage = Boolean(imageUrl) && !imageErrors[product.id]
          const stock = getStock(product)
          return (
            <article key={product.id} className={`group overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_14px_34px_rgba(10,14,26,0.08)] ${viewMode === "grid" ? "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,14,26,0.12)]" : "flex flex-col gap-4 p-4 md:flex-row"}`}>
              <Link href={`/product/${product.slug}`} className={`${viewMode === "list" ? "relative block overflow-hidden rounded-[18px] bg-[#EEE8DB] md:w-[220px] md:flex-none" : "block"}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EEE8DB]">
                  {hasImage ? (
                    <Image src={imageUrl!} alt={product.images?.[0]?.alt || product.name} fill sizes={viewMode === "grid" ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" : "(max-width: 768px) 100vw, 220px"} onError={() => setImageErrors((current) => current[product.id] ? current : { ...current, [product.id]: true })} className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.18em] text-black/35" style={monoFontStyle}>{meta.fallbackLabel}</div>
                  )}
                  <div className="absolute left-4 top-4 z-10"><span className="inline-flex rounded-full bg-[#0A0E1A] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-[#F8B800]" style={monoFontStyle}>{meta.badge}</span></div>
                  {showWishlist ? (
                    <button type="button" onClick={(event) => { event.preventDefault(); toggleWishlist(product.id) }} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-[#0A0E1A] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100" aria-label={hasWish ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}><Heart className={`h-4 w-4 ${hasWish ? "fill-[#E52222] text-[#E52222]" : ""}`} /></button>
                  ) : null}
                </div>
              </Link>
              <div className={`${viewMode === "list" ? "flex flex-1 flex-col" : "space-y-3 px-4 py-4"}`}>
                <div><h3 className="text-[2rem] uppercase leading-[0.86] text-[#0A0E1A]" style={barlowFontStyle}>{product.name}</h3><p className="mt-1 text-sm text-black/65">{product.description || "Premium streetwear essentials."}</p></div>
                {viewMode === "list" ? (
                  <div className="mt-auto flex items-end justify-between gap-4">
                    <span className="text-[1.6rem] leading-none text-[#0A0E1A]" style={barlowFontStyle}>{formatPrice(Number(product.price || 0))}</span>
                    <button type="button" onClick={(event) => handleAddToCart(event, product)} disabled={stock <= 0} className="inline-flex h-11 items-center justify-center rounded-full bg-[#0A0E1A] px-5 text-[12px] uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35" style={monoFontStyle}>{stock <= 0 ? config.ui.soldOutText : config.ui.addToCartText}</button>
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={`${product.id}-${index}`} className={`h-3.5 w-3.5 ${index < Math.round(meta.rating) ? "fill-[#F8B800] text-[#F8B800]" : "text-black/20"}`} />
                        ))}
                      </div>
                      <span className="mt-2 block text-[1.7rem] leading-none text-[#0A0E1A]" style={barlowFontStyle}>{formatPrice(Number(product.price || 0))}</span>
                    </div>
                    <button type="button" onClick={(event) => handleAddToCart(event, product)} disabled={stock <= 0} className="inline-flex h-11 items-center justify-center rounded-full bg-[#0A0E1A] px-5 text-[12px] uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35" style={monoFontStyle}><ShoppingCart className="mr-2 h-4 w-4" />{stock <= 0 ? config.ui.soldOutText : config.ui.addToCartText}</button>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-[24px] border border-black/10 bg-[#0A0E1A] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[2rem] uppercase leading-none text-[#F8B800]" style={barlowFontStyle}>Deal</p><p className="mt-1 text-[12px] uppercase tracking-[0.08em] text-white/72" style={monoFontStyle}>{promoText}</p></div>
          <button type="button" className="rounded-full bg-[#F8B800] px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-[#0A0E1A]" style={monoFontStyle}>{promoCtaText}</button>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[70]">
        {coins.map((coin) => (
          <span key={coin.id} className="fixed text-xl" style={{ left: coin.active ? coin.endX : coin.startX, top: coin.active ? coin.endY : coin.startY, transform: `translate(-50%, -50%) scale(${coin.active ? 0.3 : 1})`, opacity: coin.active ? 0 : 1, transition: "left 650ms cubic-bezier(0.68,-0.6,0.32,1.6), top 650ms cubic-bezier(0.68,-0.6,0.32,1.6), transform 650ms cubic-bezier(0.68,-0.6,0.32,1.6), opacity 650ms ease-out" }}>*</span>
        ))}
      </div>
    </div>
  )
}
