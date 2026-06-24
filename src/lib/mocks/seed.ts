import { db, resetDb } from './db'
import type { Category, Order, Product, Repasse, User } from '@/types'

const buyerId = 'user-buyer-1'
const sellerId = 'user-seller-1'
const adminId = 'user-admin-1'

const categories: Category[] = [
  { id: 'cat-1', name: 'Eletrônicos', parentId: null },
  { id: 'cat-2', name: 'Celulares', parentId: 'cat-1' },
  { id: 'cat-3', name: 'Moda', parentId: null },
  { id: 'cat-4', name: 'Casa', parentId: null },
]

const users: User[] = [
  {
    id: buyerId,
    email: 'comprador@teste.com',
    name: 'João Comprador',
    cpf: '12345678901',
    role: 'buyer',
    banned: false,
  },
  {
    id: sellerId,
    email: 'vendedor@teste.com',
    name: 'Maria Vendedora',
    cpf: '98765432100',
    role: 'seller',
    banned: false,
    sellerProfile: {
      documentType: 'cpf',
      document: '98765432100',
      pixKey: 'vendedor@teste.com',
      originCep: '01310100',
      originAddress: 'Av. Paulista, 1000 - São Paulo/SP',
      onboardingComplete: true,
    },
  },
  {
    id: adminId,
    email: 'admin@teste.com',
    name: 'Admin Sistema',
    cpf: '11122233344',
    role: 'admin',
    banned: false,
  },
]

const products: Product[] = [
  {
    id: 'prod-1',
    title: 'Smartphone Pro Max',
    description: 'Smartphone com tela AMOLED de 6.7 polegadas, 256GB de armazenamento.',
    price: 3499.9,
    stock: 15,
    categoryId: 'cat-2',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/phone/600/600'],
    weight: 0.2,
    dimensions: { width: 8, height: 16, length: 1 },
  },
  {
    id: 'prod-2',
    title: 'Fone Bluetooth Premium',
    description: 'Fone com cancelamento de ruído ativo e bateria de 30h.',
    price: 499.9,
    stock: 30,
    categoryId: 'cat-1',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/headphone/600/600'],
    weight: 0.3,
    dimensions: { width: 20, height: 20, length: 8 },
  },
  {
    id: 'prod-3',
    title: 'Camiseta Básica Algodão',
    description: 'Camiseta 100% algodão, disponível em várias cores.',
    price: 79.9,
    stock: 100,
    categoryId: 'cat-3',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/shirt/600/600'],
    weight: 0.25,
    dimensions: { width: 30, height: 2, length: 25 },
  },
  {
    id: 'prod-4',
    title: 'Luminária de Mesa LED',
    description: 'Luminária articulada com 3 níveis de brilho.',
    price: 189.9,
    stock: 20,
    categoryId: 'cat-4',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/lamp/600/600'],
    weight: 1.2,
    dimensions: { width: 15, height: 40, length: 15 },
  },
  {
    id: 'prod-5',
    title: 'Notebook Ultra Slim',
    description: 'Notebook leve com processador de última geração e SSD 512GB.',
    price: 5299.0,
    stock: 8,
    categoryId: 'cat-1',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/laptop/600/600'],
    weight: 1.5,
    dimensions: { width: 35, height: 2, length: 25 },
  },
  {
    id: 'prod-6',
    title: 'Relógio Esportivo',
    description: 'Relógio resistente à água com monitor de frequência cardíaca.',
    price: 899.0,
    stock: 12,
    categoryId: 'cat-3',
    sellerId,
    sellerName: 'Maria Vendedora',
    images: ['https://picsum.photos/seed/watch/600/600'],
    weight: 0.1,
    dimensions: { width: 5, height: 5, length: 2 },
  },
]

const orders: Order[] = [
  {
    id: 'order-1',
    buyerId,
    buyerName: 'João Comprador',
    productId: 'prod-2',
    productTitle: 'Fone Bluetooth Premium',
    sellerId,
    sellerName: 'Maria Vendedora',
    quantity: 1,
    productPrice: 499.9,
    shippingCost: 25.5,
    total: 525.4,
    status: 'Em Análise',
    address: {
      cep: '22041080',
      street: 'Rua das Flores',
      number: '123',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    receiptUrl: 'https://picsum.photos/seed/receipt/400/600',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    buyerId,
    buyerName: 'João Comprador',
    productId: 'prod-3',
    productTitle: 'Camiseta Básica Algodão',
    sellerId,
    sellerName: 'Maria Vendedora',
    quantity: 2,
    productPrice: 159.8,
    shippingCost: 18.0,
    total: 177.8,
    status: 'Enviado',
    address: {
      cep: '22041080',
      street: 'Rua das Flores',
      number: '123',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    receiptUrl: 'https://picsum.photos/seed/receipt2/400/600',
    trackingCode: 'BR123456789BR',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const repasses: Repasse[] = [
  {
    id: 'repasse-1',
    orderId: 'order-2',
    sellerId,
    sellerName: 'Maria Vendedora',
    productAmount: 159.8,
    shippingAmount: 18.0,
    commission: 15.98,
    netAmount: 161.82,
    paid: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function seedDb() {
  resetDb()
  db.users = [...users]
  db.categories = [...categories]
  db.products = [...products]
  db.orders = [...orders]
  db.repasses = [...repasses]
  db.tokens['token-buyer'] = buyerId
  db.tokens['token-seller'] = sellerId
  db.tokens['token-admin'] = adminId
}

export const TEST_CREDENTIALS = {
  buyer: { email: 'comprador@teste.com', password: '123456' },
  seller: { email: 'vendedor@teste.com', password: '123456' },
  admin: { email: 'admin@teste.com', password: '123456' },
}

export const TEST_TOKENS = {
  buyer: 'token-buyer',
  seller: 'token-seller',
  admin: 'token-admin',
}
