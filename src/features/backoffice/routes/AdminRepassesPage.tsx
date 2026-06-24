import { useEffect, useState } from 'react'
import { getRepasses, markRepassePaid } from '@/features/backoffice/api/adminApi'
import { formatCurrency } from '@/utils/format'
import type { Repasse } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminRepassesPage() {
  const [repasses, setRepasses] = useState<Repasse[]>([])

  async function load() {
    setRepasses(await getRepasses())
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleMarkPaid(id: string) {
    await markRepassePaid(id)
    await load()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Repasses aos vendedores</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendedor</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Frete</TableHead>
            <TableHead>Comissão</TableHead>
            <TableHead>Líquido</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repasses.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.sellerName}</TableCell>
              <TableCell>{formatCurrency(r.productAmount)}</TableCell>
              <TableCell>{formatCurrency(r.shippingAmount)}</TableCell>
              <TableCell>{formatCurrency(r.commission)}</TableCell>
              <TableCell className="font-medium">{formatCurrency(r.netAmount)}</TableCell>
              <TableCell>
                <Badge variant={r.paid ? 'secondary' : 'outline'}>
                  {r.paid ? 'Pago' : 'Pendente'}
                </Badge>
              </TableCell>
              <TableCell>
                {!r.paid && (
                  <Button size="sm" onClick={() => handleMarkPaid(r.id)}>
                    Marcar repasse realizado
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
