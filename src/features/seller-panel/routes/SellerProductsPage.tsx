import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSellerProducts, deleteSellerProduct } from '@/features/seller-panel/api/sellerApi'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  async function load() {
    setProducts(await getSellerProducts())
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleDelete(id: string) {
    await deleteSellerProduct(id)
    await load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus anúncios</h1>
        <Button asChild>
          <Link to="/vendedor/anuncios/novo">Novo anúncio</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.title}</TableCell>
              <TableCell>{formatCurrency(p.price)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
