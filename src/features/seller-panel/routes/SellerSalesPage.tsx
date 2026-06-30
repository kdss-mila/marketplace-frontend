import { useEffect, useState } from 'react'
import { getSellerSales, updateTracking } from '@/features/seller-panel/api/sellerApi'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function SellerSalesPage() {
  const [sales, setSales] = useState<Order[]>([])
  const [tracking, setTracking] = useState<Record<string, string>>({})

  async function load() {
    setSales(await getSellerSales())
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleTracking(orderId: string) {
    const code = tracking[orderId]
    if (!code) return
    await updateTracking(orderId, code)
    await load()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Minhas vendas</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rastreamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.productTitle}</TableCell>
              <TableCell>{formatCurrency(sale.total)}</TableCell>
              <TableCell>
                <Badge>{sale.status}</Badge>
              </TableCell>
              <TableCell>
                {sale.status === 'Pago' ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código de rastreamento"
                      value={tracking[sale.id] ?? ''}
                      onChange={(e) => setTracking((t) => ({ ...t, [sale.id]: e.target.value }))}
                    />
                    <Button size="sm" onClick={() => handleTracking(sale.id)}>
                      Enviar
                    </Button>
                  </div>
                ) : (
                  sale.trackingCode ?? '—'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
