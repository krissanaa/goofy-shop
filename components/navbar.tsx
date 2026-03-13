"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useGlobalConfig } from "@/components/global-config-provider"

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

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "HOME" },
  { href: "/shop", label: "SHOP", dropdown: "shop" },
  { href: "/drops", label: "DROPS" },
  { href: "/community", label: "COMMUNITY", dropdown: "community" },
  { href: "/about", label: "ABOUT" },
]

const SHOP_CATEGORY_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "Decks", href: "/shop?category=deck" },
  { label: "Wheels", href: "/shop?category=wheel" },
  { label: "Apparel", href: "/shop?category=apparel" },
  { label: "Trucks", href: "/shop?category=truck" },
  { label: "Gear", href: "/shop?category=gear" },
  { label: "Accessories", href: "/shop?category=accessory" },
]

const SHOP_COLLECTION_LINKS = [
  { label: "New Arrivals", href: "/shop?badge=NEW" },
  { label: "Hot Right Now", href: "/shop?badge=HOT" },
  { label: "Sale", href: "/shop?badge=SALE" },
  { label: "Collab", href: "/shop?badge=COLLAB" },
  { label: "Drop", href: "/drops" },
]

const COMMUNITY_LINKS = [
  { label: "News & Events", href: "/news" },
  { label: "Skate Videos", href: "/videos" },
  { label: "Skate Parks", href: "/parks" },
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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const config = useGlobalConfig()
  const headerRef = useRef<HTMLElement | null>(null)

  const openSearch = () => {
    window.dispatchEvent(new Event("open-search-command"))
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/shop") return pathname === "/shop"
    if (href === "/community") {
      return ["/community", "/news", "/videos", "/parks"].some(
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

  const logo = (config.siteName.split(" ")[0] || "GOOFY").toUpperCase()

  const navLinkClass = (active: boolean) =>
    `goofy-mono text-[9px] tracking-[0.18em] transition-colors ${
      active ? "text-[var(--white)]" : "text-white/35 hover:text-[var(--white)]"
    }`

  const dropdownItemClass = (active: boolean) =>
    `goofy-mono flex items-center justify-between border-b border-white/6 py-3 text-[10px] uppercase tracking-[0.18em] transition-colors ${
      active ? "text-[var(--white)]" : "text-white/52 hover:text-[var(--gold)]"
    }`

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 z-[55] border-b border-[var(--bordw)] bg-[rgba(10,10,10,0.96)] text-[var(--white)] backdrop-blur-md"
        style={{ top: topOffset }}
      >
        <nav className="mx-auto flex h-[52px] max-w-[1480px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-5">
            <Link href="/" className="shrink-0">
              <span className="goofy-display text-[30px] leading-none tracking-[-0.05em] text-[var(--white)]">
                {logo}
              </span>
              <span className="goofy-display text-[30px] leading-none tracking-[-0.05em] text-[var(--gold)]">
                .
              </span>
            </Link>

            <div className="hidden items-center gap-5 md:flex">
              {NAV_LINKS.map((link) => {
                const isDropdownMenu = Boolean(link.dropdown)
                const isMenuOpen = link.dropdown
                  ? desktopDropdown === link.dropdown
                  : false

                return (
                  <div
                    key={`${link.href}-${link.label}`}
                    className="relative flex items-center gap-1"
                    onMouseEnter={() => {
                      if (link.dropdown) setDesktopDropdown(link.dropdown)
                    }}
                    onMouseLeave={() => {
                      if (link.dropdown) setDesktopDropdown(null)
                    }}
                  >
                    <Link href={link.href} className={navLinkClass(isActive(link.href))}>
                      {link.label}
                    </Link>

                    {isDropdownMenu ? (
                      <button
                        type="button"
                        aria-label={`Toggle ${link.label} menu`}
                        aria-expanded={isMenuOpen}
                        className={`transition-colors ${
                          isMenuOpen
                            ? "text-[var(--white)]"
                            : "text-white/35 hover:text-[var(--white)]"
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

                    {link.dropdown === "shop" ? (
                      <div
                        className={`absolute left-0 top-full mt-[1px] w-[420px] border border-[var(--bordw)] bg-[#101010] p-5 transition-all duration-150 ${
                          isMenuOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible pointer-events-none translate-y-2 opacity-0"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
                              Shop
                            </p>
                            <div>
                              {SHOP_CATEGORY_LINKS.map((item) => (
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

                          <div>
                            <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
                              Collections
                            </p>
                            <div>
                              {SHOP_COLLECTION_LINKS.map((item) => (
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
                        </div>
                      </div>
                    ) : null}

                    {link.dropdown === "community" ? (
                      <div
                        className={`absolute left-0 top-full mt-[1px] w-[290px] border border-[var(--bordw)] bg-[#101010] p-5 transition-all duration-150 ${
                          isMenuOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible pointer-events-none translate-y-2 opacity-0"
                        }`}
                      >
                        <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
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
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              className="grid h-8 w-8 place-items-center text-white/50 transition-colors hover:text-[var(--white)]"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/cart"
              aria-label="Open cart"
              className="goofy-mono relative inline-flex h-8 items-center gap-2 rounded-[2px] bg-[var(--gold)] px-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--black)] transition-transform hover:-translate-y-[1px]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--black)] px-1 text-[7px] text-[var(--white)]">
                {isHydrated ? itemCount : 0}
              </span>
            </Link>

            <Link
              href="/account"
              aria-label="Open account"
              className={`grid h-8 w-8 place-items-center transition-colors ${
                isActive("/account")
                  ? "text-[var(--white)]"
                  : "text-white/50 hover:text-[var(--white)]"
              }`}
            >
              <User className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="grid h-8 w-8 place-items-center text-white/50 transition-colors hover:text-[var(--white)] md:hidden"
              aria-label={mobileOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[54] overflow-y-auto bg-[rgba(10,10,10,0.98)] px-5 pb-8 pt-6 md:hidden"
          style={{ top: topOffset + 52 }}
        >
          <div className="mx-auto max-w-xl border border-[var(--bordw)] bg-[#101010] p-5">
            <div className="space-y-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`goofy-mono block border-b border-white/8 pb-4 text-[10px] uppercase tracking-[0.22em] ${
                    isActive(link.href)
                      ? "text-[var(--white)]"
                      : "text-white/58"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-6">
              <div>
                <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
                  Shop
                </p>
                <div className="grid gap-2">
                  {[...SHOP_CATEGORY_LINKS, ...SHOP_COLLECTION_LINKS].map((item) => (
                    <Link
                      key={`mobile-shop-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="goofy-mono border border-white/8 px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-white/72"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="goofy-mono mb-3 text-[8px] uppercase tracking-[0.22em] text-[var(--gray)]">
                  Community
                </p>
                <div className="grid gap-2">
                  {COMMUNITY_LINKS.map((item) => (
                    <Link
                      key={`mobile-community-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="goofy-mono border border-white/8 px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-white/72"
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
