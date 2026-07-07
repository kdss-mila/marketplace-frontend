import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { getMyOrders } from '@/features/checkout/api/checkoutApi'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusVariant: Record<Order['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  'Aguardando Comprovante': 'outline',
  'Em Análise': 'secondary',
  Pago: 'default',
  Enviado: 'default',
  Entregue: 'default',
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando pedidos...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Meus pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{order.productTitle}</CardTitle>
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Total: {formatCurrency(order.total)}</p>
                <p>
                  Data: {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {order.trackingCode && (
                  <p className="font-medium">Rastreamento: {order.trackingCode}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
