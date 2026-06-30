import api from '@/lib/axios'
import type { Product, Category } from '@/types'

export async function listProducts(params?: { q?: string; categoryId?: string }): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products', { params })
  return data
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}
