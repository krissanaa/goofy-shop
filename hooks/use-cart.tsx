"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const CART_STORAGE_KEY = "goofy-shop-cart-v1"

export interface CartItem {
  id: string
  productId: string
  name: string
  category: string
  image: string
  price: number
  quantity: number
  maxStock: number
  size?: string
  color?: string
}

interface AddCartItemInput {
  productId: string
  name: string
  category: string
  image: string
  price: number
  quantity: number
  maxStock: number
  size?: string
  color?: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isHydrated: boolean
  addItem: (input: AddCartItemInput) => void
  removeItem: (itemId: string) => void
  setItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function makeItemId(input: { productId: string; size?: string; color?: string }): string {
  return `${input.productId}:${input.size ?? "default-size"}:${input.color ?? "default-color"}`
}

function clampQuantity(quantity: number, maxStock: number): number {
  if (maxStock <= 0) {
    return 0
  }

  return Math.min(Math.max(quantity, 1), maxStock)
}

function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) {
    return []
  }

  try {
    const data = JSON.parse(raw)

    if (!Array.isArray(data)) {
      return []
    }

    return data
      .map((item): CartItem | null => {
        if (
          !item ||
          typeof item.id !== "string" ||
          typeof item.productId !== "string" ||
          typeof item.name !== "string" ||
          typeof item.category !== "string" ||
          typeof item.image !== "string" ||
          typeof item.price !== "number" ||
          typeof item.quantity !== "number" ||
          typeof item.maxStock !== "number"
        ) {
          return null
        }

        return {
          id: item.id,
          productId: item.productId,
          name: item.name,
          category: item.category,
          image: item.image,
          price: item.price,
          quantity: clampQuantity(item.quantity, item.maxStock),
          maxStock: Math.max(0, item.maxStock),
          size: typeof item.size === "string" ? item.size : undefined,
          color: typeof item.color === "string" ? item.color : undefined,
        }
      })
      .filter((item): item is CartItem => item !== null && item.quantity > 0)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY))
    setItems(stored)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items, isHydrated])

  const addItem = (input: AddCartItemInput) => {
    const nextId = makeItemId(input)
    const maxStock = Math.max(0, input.maxStock)

    if (maxStock <= 0 || input.quantity <= 0) {
      return
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === nextId)

      if (!existing) {
        return [
          ...current,
          {
            id: nextId,
            productId: input.productId,
            name: input.name,
            category: input.category,
            image: input.image,
            price: input.price,
            quantity: clampQuantity(input.quantity, maxStock),
            maxStock,
            size: input.size,
            color: input.color,
          },
        ]
      }

      return current.map((item) => {
        if (item.id !== nextId) {
          return item
        }

        const quantity = clampQuantity(item.quantity + input.quantity, item.maxStock)
        return { ...item, quantity }
      })
    })
  }

  const removeItem = (itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  const setItemQuantity = (itemId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.id !== itemId) {
          return item
        }

        if (quantity <= 0) {
          return []
        }

        return { ...item, quantity: clampQuantity(quantity, item.maxStock) }
      }),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  )

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    isHydrated,
    addItem,
    removeItem,
    setItemQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }

  return context
}
