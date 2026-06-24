import api from '@/lib/axios'
import type { Order, OrderAddress, ShippingQuote } from '@/types'

export async function createOrder(payload: {
  productId: string
  quantity: number
  address: OrderAddress
  shippingCost: number
}): Promise<{ order: Order; pixKey: string }> {
  const { data } = await api.post<{ order: Order; pixKey: string }>('/orders', payload)
  return data
}

export async function uploadReceipt(orderId: string, file: File): Promise<Order> {
  const formData = new FormData()
  formData.append('receipt', file)
  const { data } = await api.post<Order>(`/orders/${orderId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders/me')
  return data
}

export async function getShippingQuote(payload: {
  cepOrigem: string
  cepDestino: string
  peso: number
  dimensoes: { width: number; height: number; length: number }
}): Promise<ShippingQuote> {
  const { data } = await api.post<ShippingQuote>('/shipping/quote', payload)
  return data
}
