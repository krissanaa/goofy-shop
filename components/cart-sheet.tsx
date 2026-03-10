"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Coins, Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EmptySupermarketCartArt } from "@/components/ui/empty-supermarket-cart-art"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, itemCount, subtotal, setItemQuantity, removeItem, clearCart } = useCart()
  const router = useRouter()

  const hasItems = items.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-l-[3px] border-foreground bg-card p-0 sm:max-w-lg">
        <div className="mario-stripe h-1.5 w-full" />

        <SheetHeader className="border-b-[3px] border-foreground bg-secondary/80 px-4 py-4">
          <div className="flex items-center justify-between gap-2 pr-8">
            <span className="mario-badge mario-badge-red">
              <ShoppingBag className="h-3 w-3 fill-current" />
              Cart
            </span>
            <span className="mario-badge mario-badge-yellow">
              <Coins className="h-3 w-3 fill-current" />
              {itemCount} Item{itemCount === 1 ? "" : "s"}
            </span>
          </div>

          <SheetTitle className="pt-2 text-lg font-black uppercase tracking-[0.12em]">
            Power-Up Bag
          </SheetTitle>
          <SheetDescription>Retro cart mode: edit quantity, then checkout.</SheetDescription>
        </SheetHeader>

        {!hasItems ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="h-44 w-44">
              <EmptySupermarketCartArt />
            </div>
            <p className="text-base font-black uppercase tracking-wider">Your cart is empty</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add products from any product page to unlock your checkout run.
            </p>
            <button
              type="button"
              className="mario-btn mario-btn-outline"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="relative flex gap-3 border-[3px] border-foreground bg-white p-3"
                >
                  <div className="mario-stripe absolute top-0 left-0 h-1.5 w-full opacity-80" />

                  <div className="relative mt-1 h-20 w-20 shrink-0 overflow-hidden border-[3px] border-foreground bg-secondary">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-black uppercase tracking-wide text-foreground">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {item.category}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="grid size-7 place-items-center border-2 border-foreground bg-secondary text-foreground transition-colors hover:bg-primary hover:text-white"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.size ? `Size ${item.size}` : "One size"}
                      {item.color ? ` | ${item.color}` : ""}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border-[2px] border-foreground bg-card">
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center text-foreground transition-colors hover:bg-secondary"
                          onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="grid h-7 min-w-9 place-items-center border-x-[2px] border-foreground text-xs font-black tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center text-foreground transition-colors hover:bg-secondary"
                          onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-black tabular-nums text-primary">
                        COIN ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <SheetFooter className="border-t-[3px] border-foreground bg-secondary/80 p-4">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between border-[2px] border-foreground bg-card px-3 py-2">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-base font-black tabular-nums">${subtotal.toFixed(2)}</span>
                </div>

                <div className="mario-badge mario-badge-green w-full justify-center">
                  <Truck className="h-3 w-3 fill-current" />
                  Free Shipping Over $150
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="mario-btn mario-btn-outline !w-full !px-0"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>

                  <button
                    type="button"
                    className="mario-btn mario-btn-red !w-full !px-0"
                    onClick={() => {
                      onOpenChange(false)
                      router.push("/checkout")
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Checkout
                  </button>
                </div>

                <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Frontend mode: checkout button is UI workflow only
                </p>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
