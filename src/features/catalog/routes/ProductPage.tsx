import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listProducts } from '@/features/catalog/api/catalogApi'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listProducts({ q })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Resultados para &quot;{q}&quot;</h1>
      <p className="mb-6 text-muted-foreground">{products.length} produto(s) encontrado(s)</p>
      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img src={product.images[0]} alt={product.title} className="h-40 w-full object-cover" />
              <CardContent className="p-4">
                <h2 className="font-semibold">{product.title}</h2>
                <p className="mt-1 font-bold">{formatCurrency(product.price)}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link to={`/produto/${product.id}`}>Ver produto</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
