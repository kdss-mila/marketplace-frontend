import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/app/providers/CartProvider'
import { getShippingQuote } from '@/features/checkout/api/checkoutApi'
import { formatCurrency, formatCep, onlyDigits } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    address,
    setAddress,
    shippingQuote,
    setShippingQuote,
  } = useCart()
  const navigate = useNavigate()
  const [cep, setCep] = useState(address?.cep ?? '')
  const [loadingFrete, setLoadingFrete] = useState(false)

  if (items.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Carrinho vazio</h1>
        <Button asChild className="mt-4">
          <Link to="/">Continuar comprando</Link>
        </Button>
      </div>
    )
  }

  async function calcularFrete() {
    setLoadingFrete(true)
    try {
      const item = items[0]
      const quote = await getShippingQuote({
        cepOrigem: '01310100',
        cepDestino: onlyDigits(cep),
        peso: item.weight * item.quantity,
        dimensoes: item.dimensions,
      })
      setShippingQuote(quote)
    } finally {
      setLoadingFrete(false)
    }
  }

  function handleCheckout() {
    if (!address || !shippingQuote) return
    navigate('/checkout')
  }

  const shipping = shippingQuote?.valor ?? 0
  const total = subtotal + shipping

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex gap-4 p-4">
              <img src={item.image} alt={item.title} className="h-20 w-20 rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Label htmlFor={`qty-${item.productId}`}>Qtd:</Label>
                  <Input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value, 10))}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Endereço de entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>CEP</Label>
              <div className="flex gap-2">
                <Input value={cep} onChange={(e) => setCep(formatCep(e.target.value))} placeholder="00000-000" />
                <Button type="button" variant="secondary" onClick={calcularFrete} disabled={loadingFrete}>
                  {loadingFrete ? '...' : 'Frete'}
                </Button>
              </div>
            </div>
            <div>
              <Label>Rua</Label>
              <Input
                value={address?.street ?? ''}
                onChange={(e) =>
                  setAddress({
                    cep: onlyDigits(cep),
                    street: e.target.value,
                    number: address?.number ?? '',
                    complement: address?.complement,
                    city: address?.city ?? '',
                    state: address?.state ?? '',
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Número</Label>
                <Input
                  value={address?.number ?? ''}
                  onChange={(e) =>
                    setAddress({
                      cep: onlyDigits(cep),
                      street: address?.street ?? '',
                      number: e.target.value,
                      complement: address?.complement,
                      city: address?.city ?? '',
                      state: address?.state ?? '',
                    })
                  }
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={address?.city ?? ''}
                  onChange={(e) =>
                    setAddress({
                      cep: onlyDigits(cep),
                      street: address?.street ?? '',
                      number: address?.number ?? '',
                      complement: address?.complement,
                      city: e.target.value,
                      state: address?.state ?? '',
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Input
                value={address?.state ?? ''}
                onChange={(e) =>
                  setAddress({
                    cep: onlyDigits(cep),
                    street: address?.street ?? '',
                    number: address?.number ?? '',
                    complement: address?.complement,
                    city: address?.city ?? '',
                    state: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {shippingQuote && (
              <>
                <div className="flex justify-between">
                  <span>Frete ({shippingQuote.transportadora})</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Prazo: {shippingQuote.prazoDias} dias úteis</p>
              </>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              className="w-full"
              disabled={!address?.street || !shippingQuote}
              onClick={handleCheckout}
            >
              Ir para checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
