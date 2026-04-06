"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { AnimatePresence, motion, useAnimate } from "framer-motion"
import { ChevronDown, Heart, Menu, ShoppingBag, User, X } from "lucide-react"
import type { ComponentType } from "react"
import {
  ApparelIcon,
  BearingIcon,
  ShoeIcon,
  SkateDeckIcon,
  TruckIcon,
  WheelIcon,
} from "@/components/icons/SkateIcons"
import { SearchBar } from "@/components/SearchBar"
import { useGlobalConfig } from "@/components/global-config-provider"
import { useCart } from "@/hooks/use-cart"
import { attachMagneticEffect } from "@/lib/gsap-magnetic"
import { useWishlist } from "@/lib/stores/wishlistStore"
import { EASE_SNAP } from "@/lib/motion"

interface NavbarProps {
  categories?: { title: string; slug: string; image?: string }[]
  locationMenu?: {
    enabled: boolean
    label: string
    href: string
  }
  topOffset?: number
}

type DesktopDropdownKey = "shop" | "community"

type NavLink = {
  href: string
  label: string
  dropdown?: DesktopDropdownKey
}

type ShopMenuCategory = {
  slug: string
  label: string
  Icon: ComponentType<{
    size?: number
    color?: string
    className?: string
  }>
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "HOME" },
  { href: "/shop", label: "SHOP", dropdown: "shop" },
  { href: "/drops", label: "DROPS" },
  { href: "/teams", label: "TEAM" },
  { href: "/community", label: "COMMUNITY", dropdown: "community" },
  { href: "/about", label: "ABOUT" },
]

const SHOP_MENU_CATEGORIES: ShopMenuCategory[] = [
  { slug: "deck", label: "Decks", Icon: SkateDeckIcon },
  { slug: "wheel", label: "Wheels", Icon: WheelIcon },
  { slug: "truck", label: "Trucks", Icon: TruckIcon },
  { slug: "bearing", label: "Bearings", Icon: BearingIcon },
  { slug: "shoe", label: "Shoes", Icon: ShoeIcon },
  { slug: "apparel", label: "Apparel", Icon: ApparelIcon },
]

const SHOP_FEATURED_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?badge=NEW" },
  { label: "Hot Right Now", href: "/shop?badge=HOT" },
  { label: "Sale", href: "/shop?badge=SALE" },
  { label: "Collab", href: "/shop?badge=COLLAB" },
  { label: "Drops", href: "/drops" },
]

const COMMUNITY_LINKS = [
  { label: "News & Events", href: "/news" },
  { label: "Skate Videos", href: "/videos" },
  { label: "Skate Parks", href: "/skateparks" },
]

export function Navbar({
  categories: _categories = [],
  locationMenu: _locationMenu,
  topOffset = 0,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopDropdown, setDesktopDropdown] =
    useState<DesktopDropdownKey | null>(null)
  const { itemCount, isHydrated } = useCart()
  const wishlist = useWishlist()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const config = useGlobalConfig()
  const headerRef = useRef<HTMLElement | null>(null)
  const previousItemCount = useRef(0)
  const [cartIconScope, animateCartIcon] = useAnimate()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/shop") return pathname === "/shop"
    if (href === "/community") {
      return ["/community", "/news", "/videos", "/skateparks"].some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      )
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const isDropdownItemActive = (href: string) => {
    const [targetPath, targetQuery = ""] = href.split("?")
    if (pathname !== targetPath) return false

    if (!targetQuery) {
      return searchParams.toString().length === 0
    }

    const targetParams = new URLSearchParams(targetQuery)
    for (const [key, value] of targetParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }

    return true
  }

  useEffect(() => {
    setMobileOpen(false)
    setDesktopDropdown(null)
  }, [pathname, searchParams])

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

  useEffect(() => {
    if (!isHydrated) return

    if (itemCount > previousItemCount.current) {
      void animateCartIcon(
        cartIconScope.current,
        { scale: [1, 1.35, 1] },
        { duration: 0.35, ease: "easeOut" },
      )
    }

    previousItemCount.current = itemCount
  }, [animateCartIcon, cartIconScope, isHydrated, itemCount])

  const logo = (config.siteName.split(" ")[0] || "GOOFY").toUpperCase()

  const navLinkClass = (active: boolean) =>
    `goofy-mono text-[9px] tracking-[0.18em] transition-colors ${
      active
        ? "text-black dark:text-[var(--white)]"
        : "text-black/45 hover:text-black dark:text-white/35 dark:hover:text-[var(--white)]"
    }`

  const dropdownItemClass = (active: boolean) =>
    `goofy-mono flex items-center justify-between border-b border-black/8 py-3 text-[10px] uppercase tracking-[0.18em] transition-colors dark:border-white/6 ${
      active
        ? "text-black dark:text-[var(--white)]"
        : "text-black/58 hover:text-black dark:text-white/52 dark:hover:text-[var(--gold)]"
    }`

  useGSAP(
    () => {
      const header = headerRef.current
      if (!header) return

      const magneticTargets = gsap.utils.toArray<HTMLElement>(
        "[data-magnetic-nav]",
        header,
      )
      const cleanups = magneticTargets.map((element) =>
        attachMagneticEffect(element, { strength: 0.16, duration: 0.26 }),
      )

      return () => {
        cleanups.forEach((cleanup) => cleanup())
      }
    },
    { scope: headerRef, dependencies: [desktopDropdown, pathname, searchParams] },
  )

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 z-[55] border-b border-black/8 bg-[rgba(245,245,245,0.94)] text-black backdrop-blur-md transition-colors duration-500 dark:border-[var(--bordw)] dark:bg-[rgba(10,10,10,0.96)] dark:text-[var(--white)]"
        style={{ top: topOffset }}
      >
        <nav className="mx-auto grid h-[52px] max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
          <Link href="/" className="shrink-0 justify-self-start">
            <span className="goofy-display text-[30px] leading-none tracking-[-0.05em] text-black transition-colors duration-500 dark:text-[var(--white)]">
              {logo}
            </span>
            <span className="goofy-display text-[30px] leading-none tracking-[-0.05em] text-[var(--gold)]">
              .
            </span>
          </Link>

          <div className="hidden items-center justify-self-center md:flex md:gap-5">
            {NAV_LINKS.map((link, index) => {
              const isDropdownMenu = Boolean(link.dropdown)
              const isMenuOpen = link.dropdown
                ? desktopDropdown === link.dropdown
                : false
              const isShopTrigger = link.dropdown === "shop"

              return (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  className="relative flex items-center gap-1"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: EASE_SNAP }}
                  onMouseEnter={() => {
                    if (link.dropdown) setDesktopDropdown(link.dropdown)
                  }}
                  onMouseLeave={() => {
                    if (link.dropdown === "community") {
                      setDesktopDropdown(null)
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    data-magnetic-nav
                    className={`${navLinkClass(isActive(link.href))} group`}
                  >
                    <motion.span className="relative inline-flex pb-[2px]" whileHover="hover">
                      <span>{link.label}</span>
                      <motion.span
                        className="absolute bottom-0 left-0 h-[1px] w-full bg-[var(--gold)]"
                        variants={{
                          initial: { scaleX: 0, originX: 0 },
                          hover: { scaleX: 1, originX: 0 },
                        }}
                        initial="initial"
                        transition={{ duration: 0.25, ease: EASE_SNAP }}
                      />
                    </motion.span>
                  </Link>

                  {isDropdownMenu ? (
                    <button
                      type="button"
                      data-magnetic-nav
                      aria-label={`Toggle ${link.label} menu`}
                      aria-expanded={isMenuOpen}
                      className={`transition-colors ${
                        isMenuOpen
                          ? "text-black dark:text-[var(--white)]"
                          : "text-black/45 hover:text-black dark:text-white/35 dark:hover:text-[var(--white)]"
                      }`}
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

                  {!isShopTrigger && link.dropdown === "community" ? (
                    <div
                      className={`absolute left-0 top-full mt-[1px] w-[290px] border border-black/8 bg-white/96 p-5 text-black transition-all duration-150 dark:border-[var(--bordw)] dark:bg-[#101010] dark:text-white ${
                        isMenuOpen
                          ? "visible translate-y-0 opacity-100"
                          : "invisible pointer-events-none translate-y-2 opacity-0"
                      }`}
                    >
                      <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-black/42 transition-colors duration-500 dark:text-[var(--gray)]">
                        Community
                      </p>
                      <div>
                        {COMMUNITY_LINKS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={dropdownItemClass(
                              isDropdownItemActive(item.href),
                            )}
                          >
                            <span>{item.label}</span>
                            <span className="text-[var(--gray)]">/</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 justify-self-end">
            <SearchBar />

            <Link
              href="/wishlist"
              data-magnetic-nav
              aria-label="Open wishlist"
              className={`goofy-mono relative inline-flex h-8 items-center gap-2 rounded-[2px] border border-black/10 px-3 text-[9px] font-medium uppercase tracking-[0.18em] transition-colors dark:border-white/12 ${
                isActive("/wishlist")
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "text-black/62 hover:border-black hover:text-black dark:text-white/60 dark:hover:border-[var(--gold)] dark:hover:text-[var(--gold)]"
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
              <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-black/8 px-1 text-[7px] text-black transition-colors duration-500 dark:bg-white/8 dark:text-[var(--white)]">
                {wishlist.hydrated ? wishlist.items.length : 0}
              </span>
            </Link>

            <Link
              href="/cart"
              data-magnetic-nav
              aria-label="Open cart"
              className="goofy-mono relative inline-flex h-8 items-center gap-2 rounded-[2px] bg-[var(--gold)] px-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--black)] transition-transform hover:-translate-y-[1px]"
            >
              <motion.div ref={cartIconScope}>
                <ShoppingBag className="h-4 w-4" />
              </motion.div>
              <span className="hidden sm:inline">Cart</span>
              <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--black)] px-1 text-[7px] text-[var(--white)]">
                {isHydrated ? itemCount : 0}
              </span>
            </Link>

            <Link
              href="/account"
              data-magnetic-nav
              aria-label="Open account"
              className={`grid h-8 w-8 place-items-center transition-colors ${
                isActive("/account")
                  ? "text-black dark:text-[var(--white)]"
                  : "text-black/55 hover:text-black dark:text-white/50 dark:hover:text-[var(--white)]"
              }`}
            >
              <User className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="grid h-8 w-8 place-items-center text-black/55 transition-colors hover:text-black dark:text-white/50 dark:hover:text-[var(--white)] md:hidden"
              aria-label={mobileOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {desktopDropdown === "shop" ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 top-full z-50 border-b border-black/8 bg-white/96 text-black transition-colors duration-500 dark:border-[var(--bordw)] dark:bg-[var(--black)] dark:text-white"
              onMouseEnter={() => setDesktopDropdown("shop")}
              onMouseLeave={() => setDesktopDropdown(null)}
            >
              <div className="grid grid-cols-3 border-t border-black/8 dark:border-[var(--bordw)] md:grid-cols-6">
                {SHOP_MENU_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop?category=${category.slug}`}
                    className="group flex flex-col items-center gap-3 border-r border-black/8 px-4 py-8 transition-colors hover:bg-black/[0.03] dark:border-[var(--bordw)] dark:hover:bg-white/[0.03] last:border-r-0"
                  >
                    <category.Icon
                      size={40}
                      color="currentColor"
                      className="text-black/82 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 dark:text-[#F4F0EB]"
                    />
                    <span className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-black/54 transition-colors group-hover:text-black dark:text-white/50 dark:group-hover:text-[var(--gold)]">
                      {category.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-black/8 px-8 py-3 dark:border-[var(--bordw)]">
                <span className="goofy-mono text-[7px] uppercase tracking-[0.2em] text-black/28 transition-colors duration-500 dark:text-white/20">
                  Browse by category
                </span>
                <Link
                  href="/shop"
                  data-magnetic-nav
                  className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--gold)] transition-colors hover:text-black dark:hover:text-white"
                >
                  View All Products -{">"}
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[54] overflow-y-auto bg-[rgba(245,245,245,0.98)] px-5 pb-8 pt-6 text-black transition-colors duration-500 dark:bg-[rgba(10,10,10,0.98)] dark:text-white md:hidden"
          style={{ top: topOffset + 52 }}
        >
          <div className="mx-auto max-w-xl border border-black/8 bg-white/96 p-5 transition-colors duration-500 dark:border-[var(--bordw)] dark:bg-[#101010]">
            <div className="space-y-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`goofy-mono block border-b border-black/8 pb-4 text-[10px] uppercase tracking-[0.22em] dark:border-white/8 ${
                    isActive(link.href)
                      ? "text-black dark:text-[var(--white)]"
                      : "text-black/62 dark:text-white/58"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-6">
              <div>
                <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-black/42 transition-colors duration-500 dark:text-[var(--gray)]">
                  Shop
                </p>
                <div className="grid gap-2">
                  {SHOP_FEATURED_LINKS.map((item) => (
                    <Link
                      key={`mobile-shop-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="goofy-mono border border-black/8 px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-black/72 transition-colors duration-500 dark:border-white/8 dark:text-white/72"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {SHOP_MENU_CATEGORIES.map((item) => (
                    <Link
                      key={`mobile-category-${item.slug}`}
                      href={`/shop?category=${item.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="goofy-mono border border-black/8 px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-black/72 transition-colors duration-500 dark:border-white/8 dark:text-white/72"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-black/42 transition-colors duration-500 dark:text-[var(--gray)]">
                  Community
                </p>
                <div className="grid gap-2">
                  {COMMUNITY_LINKS.map((item) => (
                    <Link
                      key={`mobile-community-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="goofy-mono border border-black/8 px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-black/72 transition-colors duration-500 dark:border-white/8 dark:text-white/72"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
