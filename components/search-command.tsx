"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { products } from "@/lib/data"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Search } from "lucide-react"

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-none border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-2xl transition-colors hover:text-foreground hover:border-foreground/30 backdrop-blur-xl"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono sm:inline">
          {'⌘K'}
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, categories..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => {
                  router.push(`/product/${product.id}`)
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
            <CommandItem onSelect={() => { router.push("/drop"); setOpen(false) }}>
              Hype Drop
            </CommandItem>
            <CommandItem onSelect={() => { router.push("/admin"); setOpen(false) }}>
              Admin Dashboard
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
