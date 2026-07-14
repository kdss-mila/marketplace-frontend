import { http, HttpResponse } from 'msw'
import { COMMISSION_RATE, db, generateId, getUserFromToken, PLATFORM_PIX_KEY } from '../db'
import { seedDb, TEST_TOKENS } from '../seed'
import type { AuthResponse, Order, Product, Repasse, SellerProfile, User } from '@/types'

seedDb()

function unauthorized() {
  return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 })
}

function forbidden() {
  return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 })
}

function findUserByEmail(email: string) {
  return db.users.find((u) => u.email === email)
}

function createToken(userId: string): string {
  const token = `token-${generateId()}`
  db.tokens[token] = userId
  return token
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const user = findUserByEmail(body.email)
    if (!user || body.password !== '123456') {
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }
    if (user.banned) {
      return HttpResponse.json({ message: 'Usuário banido' }, { status: 403 })
    }
    const existingToken = Object.entries(db.tokens).find(([, id]) => id === user.id)?.[0]
    const token = existingToken ?? createToken(user.id)
    return HttpResponse.json<AuthResponse>({ user, token })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      name: string
      cpf: string
      password: string
    }
    if (findUserByEmail(body.email)) {
      return HttpResponse.json({ message: 'E-mail já cadastrado' }, { status: 400 })
    }
    const user: User = {
      id: generateId(),
      email: body.email,
      name: body.name,
      cpf: body.cpf.replace(/\D/g, ''),
      role: 'buyer',
      banned: false,
    }
    db.users.push(user)
    const token = createToken(user.id)
    return HttpResponse.json<AuthResponse>({ user, token }, { status: 201 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return unauthorized()
    return HttpResponse.json(user)
  }),
]

export const catalogHandlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const categoryId = url.searchParams.get('categoryId')
    const includeSubcategories = url.searchParams.get('includeSubcategories') === 'true'
    const brand = url.searchParams.get('brand')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    let products = [...db.products]
    if (q) {
      products = products.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    if (categoryId) {
      const categoryIds = includeSubcategories
        ? [
            categoryId,
            ...db.categories.filter((c) => c.parentId === categoryId).map((c) => c.id),
          ]
        : [categoryId]
      products = products.filter((p) => categoryIds.includes(p.categoryId))
    }
    if (brand) {
      products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase())
    }
    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice))
    }
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice))
    }
    return HttpResponse.json(products)
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = db.products.find((p) => p.id === params.id)
    if (!product) return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    return HttpResponse.json(product)
  }),

  http.get('/api/categories', () => HttpResponse.json(db.categories)),
]

export const checkoutHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return unauthorized()
    const body = (await request.json()) as {
      productId: string
      quantity: number
      address: Order['address']
      shippingCost: number
    }
    const product = db.products.find((p) => p.id === body.productId)
    if (!product) return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    if (product.stock < body.quantity) {
      return HttpResponse.json({ message: 'Estoque insuficiente' }, { status: 400 })
    }
    const productPrice = product.price * body.quantity
    const total = productPrice + body.shippingCost
    const order: Order = {
      id: generateId(),
      buyerId: user.id,
      buyerName: user.name,
      productId: product.id,
      productTitle: product.title,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      quantity: body.quantity,
      productPrice,
      shippingCost: body.shippingCost,
      total,
      status: 'Aguardando Comprovante',
      address: body.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.orders.push(order)
    return HttpResponse.json({ order, pixKey: PLATFORM_PIX_KEY }, { status: 201 })
  }),

  http.post('/api/orders/:id/receipt', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return unauthorized()
    const order = db.orders.find((o) => o.id === params.id)
    if (!order) return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    if (order.buyerId !== user.id) return forbidden()
    const formData = await request.formData()
    const file = formData.get('receipt')
    order.receiptUrl =
      file instanceof File ? URL.createObjectURL(file) : 'https://picsum.photos/seed/upload/400/600'
    order.status = 'Em Análise'
    order.updatedAt = new Date().toISOString()
    return HttpResponse.json(order)
  }),

  http.get('/api/orders/me', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return unauthorized()
    const orders = db.orders.filter((o) => o.buyerId === user.id)
    return HttpResponse.json(orders)
  }),
]

export const sellerHandlers = [
  http.get('/api/seller/products', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    return HttpResponse.json(db.products.filter((p) => p.sellerId === user.id))
  }),

  http.post('/api/seller/products', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const body = (await request.json()) as Omit<Product, 'id' | 'sellerId' | 'sellerName'>
    const product: Product = {
      ...body,
      id: generateId(),
      sellerId: user.id,
      sellerName: user.name,
    }
    db.products.push(product)
    return HttpResponse.json(product, { status: 201 })
  }),

  http.put('/api/seller/products/:id', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const index = db.products.findIndex((p) => p.id === params.id && p.sellerId === user.id)
    if (index === -1) return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    const body = (await request.json()) as Partial<Product>
    db.products[index] = { ...db.products[index], ...body }
    return HttpResponse.json(db.products[index])
  }),

  http.delete('/api/seller/products/:id', ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const index = db.products.findIndex((p) => p.id === params.id && p.sellerId === user.id)
    if (index === -1) return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 })
    db.products.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/seller/sales', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const sales = db.orders.filter(
      (o) => o.sellerId === user.id && ['Pago', 'Enviado', 'Entregue'].includes(o.status)
    )
    return HttpResponse.json(sales)
  }),

  http.patch('/api/seller/sales/:id/tracking', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const order = db.orders.find((o) => o.id === params.id && o.sellerId === user.id)
    if (!order) return HttpResponse.json({ message: 'Venda não encontrada' }, { status: 404 })
    const body = (await request.json()) as { trackingCode: string }
    order.trackingCode = body.trackingCode
    order.status = 'Enviado'
    order.updatedAt = new Date().toISOString()
    return HttpResponse.json(order)
  }),

  http.post('/api/seller/onboarding', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'seller') return forbidden()
    const body = (await request.json()) as SellerProfile
    const index = db.users.findIndex((u) => u.id === user.id)
    db.users[index] = {
      ...db.users[index],
      sellerProfile: { ...body, onboardingComplete: true },
    }
    return HttpResponse.json(db.users[index])
  }),
]

export const adminHandlers = [
  http.get('/api/admin/users', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    return HttpResponse.json(db.users)
  }),

  http.patch('/api/admin/users/:id/ban', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const target = db.users.find((u) => u.id === params.id)
    if (!target) return HttpResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    const body = (await request.json()) as { banned: boolean }
    target.banned = body.banned
    return HttpResponse.json(target)
  }),

  http.get('/api/admin/categories', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    return HttpResponse.json(db.categories)
  }),

  http.post('/api/admin/categories', async ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const body = (await request.json()) as { name: string; parentId: string | null }
    const category = { id: generateId(), ...body }
    db.categories.push(category)
    return HttpResponse.json(category, { status: 201 })
  }),

  http.put('/api/admin/categories/:id', async ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const index = db.categories.findIndex((c) => c.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'Categoria não encontrada' }, { status: 404 })
    const body = (await request.json()) as { name: string; parentId: string | null }
    db.categories[index] = { ...db.categories[index], ...body }
    return HttpResponse.json(db.categories[index])
  }),

  http.delete('/api/admin/categories/:id', ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const index = db.categories.findIndex((c) => c.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'Categoria não encontrada' }, { status: 404 })
    db.categories.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/admin/orders', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const orders = db.orders.filter((o) => o.status === 'Em Análise')
    return HttpResponse.json(orders)
  }),

  http.post('/api/admin/orders/:id/approve', ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const order = db.orders.find((o) => o.id === params.id)
    if (!order) return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    const product = db.products.find((p) => p.id === order.productId)
    if (product) {
      product.stock = Math.max(0, product.stock - order.quantity)
    }
    order.status = 'Pago'
    order.updatedAt = new Date().toISOString()
    const commission = order.productPrice * COMMISSION_RATE
    const repasse: Repasse = {
      id: generateId(),
      orderId: order.id,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      productAmount: order.productPrice,
      shippingAmount: order.shippingCost,
      commission,
      netAmount: order.productPrice + order.shippingCost - commission,
      paid: false,
      createdAt: new Date().toISOString(),
    }
    db.repasses.push(repasse)
    return HttpResponse.json(order)
  }),

  http.get('/api/admin/repasses', ({ request }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    return HttpResponse.json(db.repasses)
  }),

  http.post('/api/admin/repasses/:id/mark-paid', ({ request, params }) => {
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user || user.role !== 'admin') return forbidden()
    const repasse = db.repasses.find((r) => r.id === params.id)
    if (!repasse) return HttpResponse.json({ message: 'Repasse não encontrado' }, { status: 404 })
    repasse.paid = true
    return HttpResponse.json(repasse)
  }),
]

export const shippingHandlers = [
  http.get('/api/shipping/address/:cep', async ({ params }) => {
    const cep = String(params.cep).replace(/\D/g, '')
    if (cep.length !== 8) {
      return HttpResponse.json({ message: 'CEP inválido' }, { status: 400 })
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      if (!response.ok) {
        return HttpResponse.json({ message: 'Erro ao consultar CEP' }, { status: 502 })
      }
      const data = (await response.json()) as {
        cep: string
        logradouro: string
        complemento: string
        bairro: string
        localidade: string
        uf: string
        erro?: boolean
      }
      if (data.erro) {
        return HttpResponse.json({ message: 'CEP não encontrado' }, { status: 404 })
      }
      return HttpResponse.json({
        cep: cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        complement: data.complemento || undefined,
      })
    } catch {
      return HttpResponse.json({ message: 'Erro ao consultar CEP' }, { status: 502 })
    }
  }),

  http.post('/api/shipping/quote', async ({ request }) => {
    const body = (await request.json()) as {
      cepOrigem: string
      cepDestino: string
      peso: number
    }
    const origin = parseInt(body.cepOrigem.replace(/\D/g, '').slice(0, 2), 10) || 0
    const dest = parseInt(body.cepDestino.replace(/\D/g, '').slice(0, 2), 10) || 0
    const distance = Math.abs(origin - dest)
    const valor = 15 + distance * 0.5 + body.peso * 10
    const prazoDias = 3 + Math.floor(distance / 10)
    return HttpResponse.json({
      valor: Math.round(valor * 100) / 100,
      prazoDias,
      transportadora: 'Correios Simulado',
    })
  }),
]

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...checkoutHandlers,
  ...sellerHandlers,
  ...adminHandlers,
  ...shippingHandlers,
]

export { TEST_TOKENS }
