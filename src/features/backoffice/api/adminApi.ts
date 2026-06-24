import api from '@/lib/axios'
import type { Category, Order, Repasse, User } from '@/types'

export async function getAdminUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/admin/users')
  return data
}

export async function banUser(id: string, banned: boolean): Promise<User> {
  const { data } = await api.patch<User>(`/admin/users/${id}/ban`, { banned })
  return data
}

export async function getAdminCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/admin/categories')
  return data
}

export async function createCategory(payload: { name: string; parentId: string | null }): Promise<Category> {
  const { data } = await api.post<Category>('/admin/categories', payload)
  return data
}

export async function updateCategory(
  id: string,
  payload: { name: string; parentId: string | null }
): Promise<Category> {
  const { data } = await api.put<Category>(`/admin/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

export async function getPendingOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/admin/orders')
  return data
}

export async function approveOrder(id: string): Promise<Order> {
  const { data } = await api.post<Order>(`/admin/orders/${id}/approve`)
  return data
}

export async function getRepasses(): Promise<Repasse[]> {
  const { data } = await api.get<Repasse[]>('/admin/repasses')
  return data
}

export async function markRepassePaid(id: string): Promise<Repasse> {
  const { data } = await api.post<Repasse>(`/admin/repasses/${id}/mark-paid`)
  return data
}
