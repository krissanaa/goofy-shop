"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type SearchProduct = {
  id: number | string
  slug: string
  name: string
  category: string
  price: number
}

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    function onOpenSearch() {
      setOpen(true)
    }

    window.addEventListener("open-search-command", onOpenSearch)
    return () => window.removeEventListener("open-search-command", onOpenSearch)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/search/products", { cache: "no-store" })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { data?: { items?: SearchProduct[] } }
        if (!cancelled) {
          setProducts(payload.data?.items ?? [])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        title="Search (Ctrl/Cmd+K)"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground/20 bg-card text-muted-foreground shadow-xl backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, categories..." />
        <CommandList>
          <CommandEmpty>{loading ? "Loading products..." : "No results found."}</CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((product) => (
              <CommandItem
                key={product.slug}
                onSelect={() => {
                  router.push(`/shop/${product.slug}`)
                  setOpen(false)
                }}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">${product.price}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Pages">
            <CommandItem
              onSelect={() => {
                router.push("/drop")
                setOpen(false)
              }}
            >
              Hype Drop
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/admin")
                setOpen(false)
              }}
            >
              Admin Dashboard
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
