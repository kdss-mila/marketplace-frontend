import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/app/providers/CartProvider'
import { createOrder, uploadReceipt } from '@/features/checkout/api/checkoutApi'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CheckoutPage() {
  const { items, address, shippingQuote, clear } = useCart()
  const navigate = useNavigate()
  const [pixKey, setPixKey] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const item = items[0]
  if (!item || !address || !shippingQuote) {
    return <p>Dados incompletos. Volte ao carrinho.</p>
  }

  const total = item.price * item.quantity + shippingQuote.valor

  async function handleCreateOrder() {
    if (!address || !shippingQuote) return
    setLoading(true)
    setError('')
    try {
      const { order, pixKey: key } = await createOrder({
        productId: item.productId,
        quantity: item.quantity,
        address,
        shippingCost: shippingQuote.valor,
      })
      setOrderId(order.id)
      setPixKey(key)
    } catch {
      setError('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!orderId || !file) return
    setLoading(true)
    try {
      await uploadReceipt(orderId, file)
      clear()
      navigate('/conta/pedidos')
    } catch {
      setError('Erro ao enviar comprovante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{item.title} x {item.quantity}</p>
          <p>Frete: {formatCurrency(shippingQuote.valor)}</p>
          <p className="text-xl font-bold">Total: {formatCurrency(total)}</p>
        </CardContent>
      </Card>

      {!orderId ? (
        <Button onClick={handleCreateOrder} disabled={loading} className="w-full">
          {loading ? 'Gerando pedido...' : 'Gerar pedido e ver Pix'}
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pagamento via Pix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-md bg-muted p-3 font-mono text-sm">{pixKey}</p>
            <p className="text-sm text-muted-foreground">
              Faça o Pix no valor de {formatCurrency(total)} e envie o comprovante abaixo.
            </p>
            <div>
              <Label htmlFor="receipt">Comprovante (imagem ou PDF)</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
              {loading ? 'Enviando...' : 'Enviar comprovante'}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-destructive">{error}</p>}
    </div>
  )
}
