export type UserRole = 'buyer' | 'seller' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  cpf: string
  role: UserRole
  banned: boolean
  sellerProfile?: SellerProfile
}

export interface SellerProfile {
  documentType: 'cpf' | 'cnpj'
  document: string
  pixKey: string
  originCep: string
  originAddress: string
  onboardingComplete: boolean
}

export interface Category {
  id: string
  name: string
  parentId: string | null
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  stock: number
  categoryId: string
  brand: string
  sellerId: string
  sellerName: string
  images: string[]
  weight: number
  dimensions: { width: number; height: number; length: number }
}

export type OrderStatus =
  | 'Aguardando Comprovante'
  | 'Em Análise'
  | 'Pago'
  | 'Enviado'
  | 'Entregue'

export interface OrderAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
}

export interface Order {
  id: string
  buyerId: string
  buyerName: string
  productId: string
  productTitle: string
  sellerId: string
  sellerName: string
  quantity: number
  productPrice: number
  shippingCost: number
  total: number
  status: OrderStatus
  address: OrderAddress
  receiptUrl?: string
  trackingCode?: string
  createdAt: string
  updatedAt: string
}

export interface ShippingQuote {
  valor: number
  prazoDias: number
  transportadora: string
}

export interface AddressLookup {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  complement?: string
}

export interface Repasse {
  id: string
  orderId: string
  sellerId: string
  sellerName: string
  productAmount: number
  shippingAmount: number
  commission: number
  netAmount: number
  paid: boolean
  createdAt: string
}

export interface CartItem {
  productId: string
  title: string
  price: number
  quantity: number
  image: string
  sellerId: string
  sellerName: string
  weight: number
  dimensions: Product['dimensions']
}

export interface AuthResponse {
  user: User
  token: string
}
