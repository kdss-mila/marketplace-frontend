import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, OrderAddress, ShippingQuote } from '@/types'

interface CartState {
  items: CartItem[]
  address: OrderAddress | null
  shippingQuote: ShippingQuote | null
}

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  setAddress: (address: OrderAddress) => void
  setShippingQuote: (quote: ShippingQuote | null) => void
  subtotal: number
  itemCount: number
}

const STORAGE_KEY = 'marketplace_cart'

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], address: null, shippingQuote: null }
    return JSON.parse(raw) as CartState
  } catch {
    return { items: [], address: null, shippingQuote: null }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addItem = useCallback((item: CartItem) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { ...prev, items: [...prev.items, item] }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) return
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    }))
  }, [])

  const clear = useCallback(() => {
    setState({ items: [], address: null, shippingQuote: null })
  }, [])

  const setAddress = useCallback((address: OrderAddress) => {
    setState((prev) => ({ ...prev, address }))
  }, [])

  const setShippingQuote = useCallback((shippingQuote: ShippingQuote | null) => {
    setState((prev) => ({ ...prev, shippingQuote }))
  }, [])

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items]
  )

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  )

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      setAddress,
      setShippingQuote,
      subtotal,
      itemCount,
    }),
    [state, addItem, removeItem, updateQuantity, clear, setAddress, setShippingQuote, subtotal, itemCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
