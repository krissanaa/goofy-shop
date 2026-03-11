"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react"
import { CartSheet } from "@/components/cart-sheet"
import { useCart } from "@/hooks/use-cart"
import { useGlobalConfig } from "@/components/global-config-provider"

interface NavbarProps {
  categories?: { title: string; slug: string; image?: string }[]
  locationMenu?: {
    enabled: boolean
    label: string
    href: string
  }
}

type DesktopDropdownKey = "shop" | "products"

const WISHLIST_KEY = "goofy-shop-wishlist-v1"

const SHOP_DROPDOWN_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "New Arrivals", href: "/products?badge=new" },
  { label: "Drops", href: "/products?badge=drop" },
  { label: "Sale", href: "/products?badge=sale" },
]

const PRODUCT_CATEGORY_BLUEPRINT = [
  { label: "Decks", slug: "decks" },
  { label: "Wheels", slug: "wheels" },
  { label: "Apparel", slug: "apparel" },
  { label: "Trucks", slug: "trucks" },
  { label: "Gear", slug: "gear" },
]

const PRODUCT_BADGE_LINKS = [
  { label: "New Arrivals", badge: "new" },
  { label: "Hot", badge: "hot" },
  { label: "Sale", badge: "sale" },
  { label: "Collab", badge: "collab" },
]

const logoFontStyle = {
  fontFamily: "'Syne', var(--font-space-grotesk), sans-serif",
  fontWeight: 900 as const,
  fontStyle: "italic" as const,
}

const navFontStyle = {
  fontFamily: "'DM Mono', var(--font-mono), ui-monospace, monospace",
}

const badgeFontStyle = {
  fontFamily: "'Press Start 2P', var(--font-mono), monospace",
}

function parseWishlistCount(raw: string | null): number {
  if (!raw) return 0

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return 0
    return parsed.filter((value): value is string => typeof value === "string")
      .length
  } catch {
    return 0
  }
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

export function Navbar({ categories = [], locationMenu }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [desktopDropdown, setDesktopDropdown] =
    useState<DesktopDropdownKey | null>(null)
  const { itemCount, isHydrated } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const config = useGlobalConfig()
  const headerRef = useRef<HTMLElement | null>(null)

  const showStickyCartSidebar =
    !config.godMode.enabled || config.godMode.conversion.showStickyCartSidebar

  const openSearch = () => {
    window.dispatchEvent(new Event("open-search-command"))
  }

  const configuredMainMenu = useMemo(
    () =>
      config.mainMenu.map((item) => ({
        label: normalizeLabel(item.label),
        href: item.url,
      })),
    [config.mainMenu],
  )

  const getConfiguredHref = (
    key:
      | "shop"
      | "drops"
      | "products"
      | "skateparks"
      | "about",
    fallback: string,
  ) => {
    const match = configuredMainMenu.find((item) => {
      if (key === "shop") {
        return item.href === "/" || item.label.includes("shop")
      }

      if (key === "drops") {
        return item.href.startsWith("/drop") || item.label.includes("drop")
      }

      if (key === "products") {
        return item.href.startsWith("/products") || item.label.includes("product")
      }

      if (key === "skateparks") {
        return (
          item.href.startsWith("/skateparks") ||
          item.label.includes("skatepark") ||
          item.label.includes("location")
        )
      }

      return item.href.startsWith("/about") || item.label.includes("about")
    })

    return match?.href || fallback
  }

  const navLinks: {
    href: string
    label: string
    dropdown?: DesktopDropdownKey
  }[] = useMemo(() => {
    const skateparksHref = locationMenu?.href || "/skateparks"
    const skateparksLabel = (locationMenu?.label || "Skateparks").toUpperCase()

    return [
      {
        href: getConfiguredHref("shop", "/"),
        label: "SHOP",
        dropdown: "shop",
      },
      {
        href: getConfiguredHref("drops", "/drop"),
        label: "DROPS",
      },
      {
        href: getConfiguredHref("products", "/products"),
        label: "PRODUCTS",
        dropdown: "products",
      },
      {
        href: getConfiguredHref("skateparks", skateparksHref),
        label: skateparksLabel,
      },
      {
        href: getConfiguredHref("about", "/about"),
        label: "ABOUT",
      },
    ]
  }, [locationMenu, configuredMainMenu])

  const productCategoryLinks = useMemo(
    () =>
      PRODUCT_CATEGORY_BLUEPRINT.map((item) => {
        const match = categories.find((category) => {
          const slug = normalizeLabel(category.slug)
          const title = normalizeLabel(category.title)
          return slug === item.slug || title === item.slug
        })

        const resolvedSlug = match?.slug || item.slug
        return {
          label: item.label,
          href: `/products?category=${encodeURIComponent(resolvedSlug)}`,
        }
      }),
    [categories],
  )

  const productBadgeLinks = useMemo(
    () =>
      PRODUCT_BADGE_LINKS.map((item) => ({
        label: item.label,
        href: `/products?badge=${item.badge}`,
      })),
    [],
  )

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setDesktopDropdown(null)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!desktopDropdown) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (!headerRef.current?.contains(event.target)) {
        setDesktopDropdown(null)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [desktopDropdown])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-50 border-b border-black/10 [border-bottom-width:1.5px] bg-[#F5EFE0]/95 text-[#1A1614] transition-all duration-200 ${
          scrolled
            ? "shadow-[0_8px_24px_rgba(0,0,0,0.09)] backdrop-blur-md"
            : ""
        }`}
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-[height] duration-200 lg:px-8 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link href="/" className="shrink-0" style={logoFontStyle}>
            <span className="text-2xl leading-none tracking-[-0.04em]">
              {config.siteName.split(" ")[0] || "GOOFY"}
            </span>
            <span className="text-2xl leading-none text-[#E52222]">.</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex" style={navFontStyle}>
            {navLinks.map((link) => {
              const isDropdownMenu = Boolean(link.dropdown)
              const isMenuOpen = link.dropdown
                ? desktopDropdown === link.dropdown
                : false

              return (
                <div
                  key={`${link.href}-${link.label}`}
                  className="relative"
                  onMouseEnter={() => {
                    if (link.dropdown) setDesktopDropdown(link.dropdown)
                  }}
                  onMouseLeave={() => {
                    if (link.dropdown) setDesktopDropdown(null)
                  }}
                >
                  <div className="flex items-center">
                    <Link
                      href={link.href}
                      className={`px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors ${
                        isActive(link.href)
                          ? "text-[#1A1614]"
                          : "text-[#1A1614]/72 hover:text-[#C84B0C]"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {isDropdownMenu ? (
                      <button
                        type="button"
                        aria-label={`Toggle ${link.label} menu`}
                        className="p-1 text-[#1A1614]/72 transition-colors hover:text-[#C84B0C]"
                        onClick={() =>
                          setDesktopDropdown((current) =>
                            current === link.dropdown ? null : link.dropdown || null,
                          )
                        }
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : null}
                  </div>

                  {link.dropdown === "shop" ? (
                    <div
                      className={`absolute left-0 top-full z-50 w-64 border border-black/15 [border-width:1.5px] bg-[#F5EFE0] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-150 ${
                        isMenuOpen
                          ? "visible translate-y-0 opacity-100"
                          : "invisible pointer-events-none translate-y-1 opacity-0"
                      }`}
                    >
                      <p
                        className="mb-3 text-[9px] uppercase tracking-[0.12em] text-[#1A1614]/70"
                        style={badgeFontStyle}
                      >
                        Shop
                      </p>
                      <div className="space-y-2" style={navFontStyle}>
                        {SHOP_DROPDOWN_LINKS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block border border-black/15 [border-width:1.5px] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1614] transition-colors hover:text-[#C84B0C]"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {link.dropdown === "products" ? (
                    <div
                      className={`absolute left-0 top-full z-50 w-[360px] border border-black/15 [border-width:1.5px] bg-[#F5EFE0] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-150 ${
                        isMenuOpen
                          ? "visible translate-y-0 opacity-100"
                          : "invisible pointer-events-none translate-y-1 opacity-0"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p
                            className="mb-2 text-[9px] uppercase tracking-[0.12em] text-[#1A1614]/70"
                            style={badgeFontStyle}
                          >
                            By Category
                          </p>
                          <div className="space-y-2" style={navFontStyle}>
                            {productCategoryLinks.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block border border-black/15 [border-width:1.5px] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1614] transition-colors hover:text-[#C84B0C]"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p
                            className="mb-2 text-[9px] uppercase tracking-[0.12em] text-[#1A1614]/70"
                            style={badgeFontStyle}
                          >
                            By Badge
                          </p>
                          <div className="space-y-2" style={navFontStyle}>
                            {productBadgeLinks.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block border border-black/15 [border-width:1.5px] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#1A1614] transition-colors hover:text-[#C84B0C]"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-1" style={navFontStyle}>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              title="Search"
              className="flex h-10 w-10 items-center justify-center border border-black/15 [border-width:1.5px] text-[#1A1614]/80 transition-colors hover:text-[#C84B0C]"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/products?favorites=1")}
              className="relative flex h-10 w-10 items-center justify-center border border-black/15 [border-width:1.5px] text-[#1A1614]/80 transition-colors hover:text-[#C84B0C]"
              aria-label="Open wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-[#E52222] px-1 text-[8px] text-white"
                  style={badgeFontStyle}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              ) : null}
            </button>

            {showStickyCartSidebar ? (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center border border-black/15 [border-width:1.5px] text-[#1A1614]/80 transition-colors hover:text-[#C84B0C]"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {isHydrated && itemCount > 0 ? (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-[#E52222] px-1 text-[8px] text-white"
                    style={badgeFontStyle}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center border border-black/15 [border-width:1.5px] text-[#1A1614]/80 transition-colors hover:text-[#C84B0C] md:hidden"
              aria-label={mobileOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-[#F5EFE0]/98 backdrop-blur-md md:hidden">
          <div className="h-full overflow-y-auto px-5 pb-8 pt-20">
            <div className="mx-auto max-w-xl border border-black/15 [border-width:1.5px] bg-[#F5EFE0] p-4">
              <div className="space-y-1" style={navFontStyle}>
                {navLinks.map((link) => (
                  <Link
                    key={`mobile-${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block border-b border-black/10 py-3 text-sm uppercase tracking-[0.14em] ${
                      isActive(link.href)
                        ? "text-[#1A1614]"
                        : "text-[#1A1614]/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-5 border border-black/15 [border-width:1.5px] bg-white p-3">
                <p
                  className="mb-3 text-[9px] uppercase tracking-[0.12em] text-[#1A1614]/70"
                  style={badgeFontStyle}
                >
                  Shop
                </p>
                <div className="grid grid-cols-2 gap-2" style={navFontStyle}>
                  {SHOP_DROPDOWN_LINKS.map((item) => (
                    <Link
                      key={`mobile-shop-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="border border-black/15 [border-width:1.5px] px-2.5 py-2 text-[10px] uppercase tracking-[0.1em] text-[#1A1614]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-4 border border-black/15 [border-width:1.5px] bg-white p-3">
                <p
                  className="mb-3 text-[9px] uppercase tracking-[0.12em] text-[#1A1614]/70"
                  style={badgeFontStyle}
                >
                  Products
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p
                      className="mb-2 text-[8px] uppercase tracking-[0.1em] text-[#1A1614]/65"
                      style={badgeFontStyle}
                    >
                      By Category
                    </p>
                    <div className="space-y-2" style={navFontStyle}>
                      {productCategoryLinks.map((item) => (
                        <Link
                          key={`mobile-category-${item.href}`}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block border border-black/15 [border-width:1.5px] px-2.5 py-2 text-[10px] uppercase tracking-[0.1em] text-[#1A1614]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className="mb-2 text-[8px] uppercase tracking-[0.1em] text-[#1A1614]/65"
                      style={badgeFontStyle}
                    >
                      By Badge
                    </p>
                    <div className="space-y-2" style={navFontStyle}>
                      {productBadgeLinks.map((item) => (
                        <Link
                          key={`mobile-badge-${item.href}`}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block border border-black/15 [border-width:1.5px] px-2.5 py-2 text-[10px] uppercase tracking-[0.1em] text-[#1A1614]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showStickyCartSidebar ? (
        <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      ) : null}
    </>
  )
}
