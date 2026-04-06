"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, X } from "lucide-react"
import { SearchSuggestions } from "@/components/SearchSuggestions"

function buildShopSearchHref(
  pathname: string,
  currentSearchParams: URLSearchParams,
  query: string,
): string {
  const trimmed = query.trim()
  const params = new URLSearchParams(
    pathname === "/shop" ? currentSearchParams.toString() : "",
  )

  if (trimmed.length > 0) {
    params.set("q", trimmed)
  } else {
    params.delete("q")
  }

  const nextQuery = params.toString()
  return nextQuery.length > 0 ? `/shop?${nextQuery}` : "/shop"
}

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  useEffect(() => {
    if (!open) {
      setQuery(searchParams.get("q") ?? "")
    }
  }, [open, searchParams])

  useEffect(() => {
    if (!open) {
      return
    }

    inputRef.current?.focus()

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return
      }

      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const trimmed = query.trim()
    const currentQuery = searchParams.get("q") ?? ""

    if (trimmed.length > 0 && trimmed.length < 2) {
      return
    }

    if (trimmed.length === 0 && currentQuery.length === 0) {
      return
    }

    if (pathname === "/shop" && trimmed === currentQuery) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      router.push(buildShopSearchHref(pathname, new URLSearchParams(searchParams.toString()), trimmed))
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [open, pathname, query, router, searchParams])

  const submitQuery = () => {
    const trimmed = query.trim()
    if (trimmed.length > 0 && trimmed.length < 2) {
      return
    }

    router.push(buildShopSearchHref(pathname, new URLSearchParams(searchParams.toString()), trimmed))
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="search-input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "min(260px, calc(100vw - 156px))", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-visible"
          >
            <div className="flex h-9 items-center border border-black/12 bg-white/88 text-black transition-colors duration-500 dark:border-white/10 dark:bg-[var(--black)] dark:text-white">
              <Search className="ml-3 h-4 w-4 shrink-0 text-black/38 transition-colors duration-500 dark:text-white/35" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    submitQuery()
                  }
                }}
                placeholder="Search products"
                className="h-full w-full bg-transparent px-3 goofy-mono text-[10px] uppercase tracking-[0.16em] text-black outline-none placeholder:text-black/26 transition-colors duration-500 dark:text-[var(--white)] dark:placeholder:text-white/24"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mr-2 grid h-7 w-7 place-items-center text-black/38 transition-colors hover:text-black dark:text-white/35 dark:hover:text-[var(--white)]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SearchSuggestions
              query={query}
              onSelect={() => setOpen(false)}
            />
          </motion.div>
        ) : (
          <motion.button
            key="search-trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open search"
            className="grid h-8 w-8 place-items-center text-black/55 transition-colors hover:text-black dark:text-white/50 dark:hover:text-[var(--white)]"
          >
            <Search className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
