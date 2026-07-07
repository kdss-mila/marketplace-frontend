import api from '@/lib/axios'
import type { AddressLookup, Order, OrderAddress, ShippingQuote } from '@/types'
import { isValidCep, onlyDigits } from '@/utils/format'

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

function mapViaCepResponse(data: ViaCepResponse): AddressLookup {
  return {
    cep: onlyDigits(data.cep),
    street: data.logradouro,
    neighborhood: data.bairro,
    city: data.localidade,
    state: data.uf,
    complement: data.complemento || undefined,
  }
}

async function fetchViaCep(cep: string): Promise<AddressLookup> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP')
  }
  const data = (await response.json()) as ViaCepResponse
  if (data.erro) {
    throw new Error('CEP não encontrado')
  }
  return mapViaCepResponse(data)
}

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

export async function lookupAddressByCep(cep: string): Promise<AddressLookup> {
  const digits = onlyDigits(cep)
  if (!isValidCep(digits)) {
    throw new Error('Informe um CEP válido com 8 dígitos')
  }

  try {
    const { data } = await api.get<AddressLookup>(`/shipping/address/${digits}`)
    return data
  } catch {
    return fetchViaCep(digits)
  }
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
