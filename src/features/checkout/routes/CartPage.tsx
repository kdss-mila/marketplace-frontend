import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, MapPin, Truck } from 'lucide-react'
import { useCart } from '@/app/providers/CartProvider'
import { getShippingQuote, lookupAddressByCep } from '@/features/checkout/api/checkoutApi'
import { formatCurrency, formatCep, isValidCep, onlyDigits } from '@/utils/format'
import type { OrderAddress } from '@/types'
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
  const [cep, setCep] = useState(address?.cep ? formatCep(address.cep) : '')
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [cepError, setCepError] = useState('')
  const [addressFound, setAddressFound] = useState(Boolean(address?.street))

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

  function updateAddress(fields: Partial<OrderAddress>) {
    setAddress({
      cep: onlyDigits(cep),
      street: address?.street ?? '',
      number: address?.number ?? '',
      complement: address?.complement,
      neighborhood: address?.neighborhood,
      city: address?.city ?? '',
      state: address?.state ?? '',
      ...fields,
    })
  }

  async function buscarEnderecoPorCep(silent = false) {
    if (!isValidCep(cep)) {
      if (!silent) setCepError('Informe um CEP válido com 8 dígitos')
      return false
    }

    setLoadingCep(true)
    if (!silent) setCepError('')

    try {
      const lookup = await lookupAddressByCep(cep)
      setAddress({
        cep: lookup.cep,
        street: lookup.street,
        number: address?.number ?? '',
        complement: lookup.complement ?? address?.complement,
        neighborhood: lookup.neighborhood,
        city: lookup.city,
        state: lookup.state,
      })
      setCep(formatCep(lookup.cep))
      setAddressFound(true)
      setShippingQuote(null)
      return true
    } catch (err) {
      setAddressFound(false)
      setCepError(err instanceof Error ? err.message : 'CEP não encontrado')
      return false
    } finally {
      setLoadingCep(false)
    }
  }

  async function calcularFrete() {
    setCepError('')
    const enderecoOk = addressFound || (await buscarEnderecoPorCep())
    if (!enderecoOk) return

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
    } catch {
      setCepError('Não foi possível calcular o frete. Tente novamente.')
    } finally {
      setLoadingFrete(false)
    }
  }

  function handleCepChange(value: string) {
    const formatted = formatCep(value)
    setCep(formatted)
    setCepError('')
    setAddressFound(false)
    setShippingQuote(null)

    if (isValidCep(formatted)) {
      void buscarEnderecoPorCep(true)
    }
  }

  function handleCheckout() {
    if (!address?.street || !address?.number || !shippingQuote) return
    navigate('/checkout')
  }

  const shipping = shippingQuote?.valor ?? 0
  const total = subtotal + shipping
  const isLoading = loadingCep || loadingFrete

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
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
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço de entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void buscarEnderecoPorCep()}
                  disabled={isLoading || !isValidCep(cep)}
                >
                  {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>
              {cepError && <p className="mt-1 text-sm text-destructive">{cepError}</p>}
              {addressFound && !cepError && (
                <p className="mt-1 text-xs text-emerald-600">Endereço encontrado via Correios</p>
              )}
            </div>

            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={address?.street ?? ''}
                onChange={(e) => updateAddress({ street: e.target.value })}
                placeholder="Logradouro"
              />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={address?.neighborhood ?? ''}
                onChange={(e) => updateAddress({ neighborhood: e.target.value })}
                placeholder="Bairro"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={address?.number ?? ''}
                  onChange={(e) => updateAddress({ number: e.target.value })}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={address?.complement ?? ''}
                  onChange={(e) => updateAddress({ complement: e.target.value })}
                  placeholder="Apto, bloco..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={address?.city ?? ''}
                  readOnly={addressFound}
                  className={addressFound ? 'bg-muted' : undefined}
                  onChange={(e) => updateAddress({ city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={address?.state ?? ''}
                  readOnly={addressFound}
                  className={addressFound ? 'bg-muted' : undefined}
                  onChange={(e) => updateAddress({ state: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => void calcularFrete()}
              disabled={isLoading || !isValidCep(cep)}
            >
              {loadingFrete ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculando frete...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Calcular frete
                </>
              )}
            </Button>
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
                <p className="text-xs text-muted-foreground">
                  Prazo estimado: {shippingQuote.prazoDias} dias úteis
                </p>
              </>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              className="w-full"
              disabled={!address?.street || !address?.number || !shippingQuote}
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
