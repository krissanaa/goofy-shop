"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Star,
} from "lucide-react"
import { CartSheet } from "@/components/cart-sheet"
import { useCart } from "@/hooks/use-cart"
import { useGlobalConfig } from "@/components/global-config-provider"
import { EmptyCartBoxArt } from "@/components/ui/empty-cart-box-art"

interface NavbarProps {
  categories?: { title: string; slug: string; image?: string }[]
  locationMenu?: {
    enabled: boolean
    label: string
    href: string
  }
}

const WISHLIST_KEY = "goofy-shop-wishlist-v1"
const CATEGORY_BADGE_COLORS = ["#E70009", "#FBD000"] as const
const PRODUCT_BADGE_LINKS = [
  { label: "All", href: "/products" },
  { label: "New", href: "/products?filter=new" },
  { label: "Sale", href: "/products?filter=sale" },
  { label: "Drop", href: "/products?filter=drop" },
  { label: "Hot", href: "/products?filter=hot" },
  { label: "Collab", href: "/products?filter=collab" },
]

function parseWishlistCount(raw: string | null): number {
  if (!raw) return 0

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return 0
    return parsed.filter((value): value is string => typeof value === "string").length
  } catch {
    return 0
  }
}

export function Navbar({
  categories = [],
  locationMenu,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { itemCount, isHydrated } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const config = useGlobalConfig()
  const showStickyCartSidebar =
    !config.godMode.enabled || config.godMode.conversion.showStickyCartSidebar

  const openSearch = () => {
    window.dispatchEvent(new Event("open-search-command"))
  }

  // Priority: Admin-defined mainMenu > category-derived links > hardcoded fallback
  const baseNavLinks = config.mainMenu.length > 0
    ? config.mainMenu.map((item) => ({
        href: item.url,
        label: item.label,
        star: item.iconName === "star",
      }))
    : categories.length > 0
      ? [
          { href: "/", label: "Shop", star: false },
          { href: "/drop", label: "Drops", star: true },
          { href: "/products", label: "Products", star: false },
          ...categories.slice(0, 3).map((c) => ({
            href: `/products?category=${encodeURIComponent(c.slug || c.title)}`,
            label: c.title,
            star: false,
          })),
        ]
      : [
          { href: "/", label: "Shop", star: false },
          { href: "/drop", label: "Drops", star: true },
          { href: "/products", label: "Products", star: false },
        ]

  const navLinks = !locationMenu?.enabled
    ? baseNavLinks
    : baseNavLinks.some((link) => link.href === locationMenu.href)
      ? baseNavLinks
      : [...baseNavLinks, { href: locationMenu.href, label: locationMenu.label, star: false }]

  const categoryLinks = categories
    .slice(0, 6)
    .map((category) => ({
      label: category.title,
      href: `/products?category=${encodeURIComponent(category.slug || category.title)}`,
      image: category.image,
    }))

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncWishlist = () => {
      setWishlistCount(parseWishlistCount(window.localStorage.getItem(WISHLIST_KEY)))
    }

    syncWishlist()
    window.addEventListener("storage", syncWishlist)
    window.addEventListener("wishlist-updated", syncWishlist)

    return () => {
      window.removeEventListener("storage", syncWishlist)
      window.removeEventListener("wishlist-updated", syncWishlist)
    }
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0 group">
            {config.logoUrl ? (
              <Image src={config.logoUrl} alt={config.siteName} width={120} height={40} className="h-8 w-auto" />
            ) : (
              <>
                <span className="text-2xl font-black tracking-tighter text-foreground">
                  {config.siteName.split(" ")[0] || "GOOFY"}
                </span>
                <span className="text-2xl font-black text-primary">
                  .
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <div
                key={link.href + link.label}
                className="group relative"
              >
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {link.star ? (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ) : null}
                  {link.label}
                  {(link.href.startsWith("/products") ||
                    link.label.toLowerCase().includes("product")) ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : null}
                  {isActive(link.href) ? (
                    <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-primary" />
                  ) : null}
                </Link>

                {(link.href.startsWith("/products") ||
                  link.label.toLowerCase().includes("product")) ? (
                  <div className="invisible pointer-events-none absolute left-0 top-full z-50 w-[340px] translate-y-1 border-2 border-black bg-[#F5F1E8] p-3 opacity-0 shadow-[4px_4px_0_#0A0A0A] transition-all duration-150 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
                      Category
                    </p>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {(categoryLinks.length > 0
                        ? categoryLinks
                        : [{ label: "All Categories", href: "/products", image: undefined }]
                      ).map((item, index) => (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          className="group/item relative h-20 overflow-hidden border-2 border-black bg-[#E6E6E6] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#0A0A0A]"
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.label}
                              fill
                              sizes="170px"
                              className="object-cover transition-transform duration-200 group-hover/item:scale-105"
                            />
                          ) : (
                            <EmptyCartBoxArt />
                          )}
                          <span
                            className="absolute bottom-2 left-2 border border-black px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]"
                            style={{
                              backgroundColor:
                                CATEGORY_BADGE_COLORS[index % CATEGORY_BADGE_COLORS.length],
                              color:
                                index % CATEGORY_BADGE_COLORS.length === 0
                                  ? "#FFFFFF"
                                  : "#111111",
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
                      Badge
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PRODUCT_BADGE_LINKS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="border-2 border-black bg-[#FBD000] px-2 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.1em] text-black transition-colors hover:bg-[#E70009] hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              title="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/60 transition-all hover:border-primary hover:text-primary"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-foreground/50 transition-colors hover:text-primary"
            >
              <User className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/products?favorites=1")}
              className="relative flex h-10 w-10 items-center justify-center text-foreground/50 transition-colors hover:text-primary"
              aria-label="Open favorite products"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E70009] text-[10px] font-black text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </button>

            {showStickyCartSidebar ? (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center text-foreground/50 transition-colors hover:text-primary"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {isHydrated && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center text-foreground/50 transition-colors hover:text-primary md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t-[3px] border-foreground bg-card md:hidden">
            <div className="flex flex-col px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 border-b border-border py-4 text-sm font-black uppercase tracking-wider last:border-0 last:pb-0 ${
                    isActive(link.href) ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  {link.star && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

      </header>

      {showStickyCartSidebar ? (
        <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      ) : null}
    </>
  )
}
