import { useEffect, useState } from 'react'
import { approveOrder, getPendingOrders } from '@/features/backoffice/api/adminApi'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])

  async function load() {
    setOrders(await getPendingOrders())
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleApprove(id: string) {
    await approveOrder(id)
    await load()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Conciliação de pagamentos</h1>
      <p className="mb-4 text-muted-foreground">Pedidos aguardando análise do comprovante Pix</p>
      {orders.length === 0 ? (
        <p>Nenhum pedido em análise.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprador</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.buyerName}</TableCell>
                <TableCell>{order.productTitle}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  {order.receiptUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ver comprovante
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Comprovante — Pedido {order.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        <img src={order.receiptUrl} alt="Comprovante" className="max-h-96 w-full object-contain" />
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleApprove(order.id)}>
                    Aprovar pagamento
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
