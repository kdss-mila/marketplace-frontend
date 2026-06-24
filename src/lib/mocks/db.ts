import type { Category, Order, Product, Repasse, User } from '@/types'

export interface MockDb {
  users: User[]
  products: Product[]
  categories: Category[]
  orders: Order[]
  repasses: Repasse[]
  tokens: Record<string, string>
}

export const db: MockDb = {
  users: [],
  products: [],
  categories: [],
  orders: [],
  repasses: [],
  tokens: {},
}

export const PLATFORM_PIX_KEY = 'marketplace@pix.com.br'
export const COMMISSION_RATE = 0.1

export function resetDb() {
  db.users = []
  db.products = []
  db.categories = []
  db.orders = []
  db.repasses = []
  db.tokens = {}
}

export function getUserFromToken(authHeader: string | null): User | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const userId = db.tokens[token]
  if (!userId) return null
  return db.users.find((u) => u.id === userId) ?? null
}

export function generateId(): string {
  return crypto.randomUUID()
}
