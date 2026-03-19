"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils/format"

interface SearchSuggestionItem {
  id: string | number
  slug: string
  name: string
  price: number
  images?: string[] | null
}

interface SearchSuggestionsProps {
  query: string
  onSelect?: () => void
}

export function SearchSuggestions({
  query,
  onSelect,
}: SearchSuggestionsProps) {
  const router = useRouter()
  const [results, setResults] = useState<SearchSuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const normalizedQuery = query.trim()

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/search/products?q=${encodeURIComponent(normalizedQuery)}&limit=5`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        )

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          data?: { items?: SearchSuggestionItem[] }
        }
        setResults(payload.data?.items ?? [])
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [normalizedQuery])

  if (normalizedQuery.length < 2) {
    return null
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-[var(--bordw)] bg-[var(--black)] shadow-[0_18px_44px_rgba(0,0,0,0.42)]">
      <div className="max-h-[360px] overflow-y-auto">
        {results.map((product) => {
          const image = product.images?.[0] || "/placeholder.jpg"

          return (
            <button
              key={product.slug}
              type="button"
              onClick={() => {
                onSelect?.()
                router.push(`/shop/${product.slug}`)
              }}
              className="flex w-full items-center gap-3 border-b border-[var(--bordw)] px-3 py-3 text-left transition-colors hover:bg-white/[0.03] last:border-b-0"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#111]">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate goofy-display text-[24px] leading-none text-[var(--white)]">
                  {product.name}
                </p>
                <p className="mt-1 goofy-mono text-[9px] uppercase tracking-[0.16em] text-white/44">
                  {formatPrice(Number(product.price ?? 0))}
                </p>
              </div>
            </button>
          )
        })}

        {!loading && results.length === 0 ? (
          <div className="px-3 py-4 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
            No matching products
          </div>
        ) : null}

        {loading ? (
          <div className="px-3 py-4 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/34">
            Searching...
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          onSelect?.()
          router.push(`/shop?q=${encodeURIComponent(normalizedQuery)}`)
        }}
        className="flex w-full items-center justify-between border-t border-[var(--bordw)] px-3 py-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/48 transition-colors hover:text-[var(--gold)]"
      >
        <span>See all results</span>
        <span>-{">"}</span>
      </button>
    </div>
  )
}
