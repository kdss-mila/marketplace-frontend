import api from '@/lib/axios'
import type { AuthResponse, User } from '@/types'

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function registerRequest(payload: {
  email: string
  name: string
  cpf: string
  password: string
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function meRequest(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}
