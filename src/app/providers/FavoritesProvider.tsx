import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import type { FavoriteItem } from '@/types/favorites'

interface FavoritesContextValue {
  favorites: FavoriteItem[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (item: FavoriteItem) => void
  removeFavorite: (productId: string) => void
  favoriteCount: number
}

const STORAGE_KEY = 'easyshop_favorites'

type FavoritesStore = Record<string, FavoriteItem[]>

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function loadStore(): FavoritesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as FavoritesStore | FavoriteItem[]
    if (Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

function loadFavoritesForUser(userId: string): FavoriteItem[] {
  return loadStore()[userId] ?? []
}

function saveFavoritesForUser(userId: string, favorites: FavoriteItem[]) {
  const store = loadStore()
  store[userId] = favorites
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  useEffect(() => {
    setFavorites(userId ? loadFavoritesForUser(userId) : [])
  }, [userId])

  useEffect(() => {
    if (!userId) return
    saveFavoritesForUser(userId, favorites)
  }, [favorites, userId])

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.productId === productId),
    [favorites]
  )

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      if (!userId) return
      setFavorites((prev) => {
        const exists = prev.some((f) => f.productId === item.productId)
        if (exists) return prev.filter((f) => f.productId !== item.productId)
        return [...prev, item]
      })
    },
    [userId]
  )

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
