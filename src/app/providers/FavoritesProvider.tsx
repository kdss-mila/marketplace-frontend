import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FavoriteItem } from '@/types/favorites'

interface FavoritesContextValue {
  favorites: FavoriteItem[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (item: FavoriteItem) => void
  removeFavorite: (productId: string) => void
  favoriteCount: number
}

const STORAGE_KEY = 'easyshop_favorites'

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as FavoriteItem[]
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.productId === productId),
    [favorites]
  )

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.productId === item.productId)
      if (exists) return prev.filter((f) => f.productId !== item.productId)
      return [...prev, item]
    })
  }, [])

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((f) => f.productId !== productId))
  }, [])

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      favoriteCount: favorites.length,
    }),
    [favorites, isFavorite, toggleFavorite, removeFavorite]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
