import api from '@/lib/axios'
import type { Order, Product, SellerProfile, User } from '@/types'

export async function getSellerProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/seller/products')
  return data
}

export async function createSellerProduct(
  payload: Omit<Product, 'id' | 'sellerId' | 'sellerName'>
): Promise<Product> {
  const { data } = await api.post<Product>('/seller/products', payload)
  return data
}

export async function updateSellerProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await api.put<Product>(`/seller/products/${id}`, payload)
  return data
}

export async function deleteSellerProduct(id: string): Promise<void> {
  await api.delete(`/seller/products/${id}`)
}

export async function getSellerSales(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/seller/sales')
  return data
}

export async function updateTracking(orderId: string, trackingCode: string): Promise<Order> {
  const { data } = await api.patch<Order>(`/seller/sales/${orderId}/tracking`, { trackingCode })
  return data
}

export async function submitOnboarding(profile: SellerProfile): Promise<User> {
  const { data } = await api.post<User>('/seller/onboarding', profile)
  return data
}
