import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '@/features/catalog/api/catalogApi'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Carregando produtos...</p>

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Destaques</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">            
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-48 w-full object-cover"
            />
            <CardContent className="p-4">
              <h2 className="font-semibold line-clamp-2">{product.title}</h2>
              <p className="mt-2 text-lg font-bold">{formatCurrency(product.price)}</p>
              <p className="text-sm text-muted-foreground">por {product.sellerName}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link to={`/produto/${product.id}`}>Ver produto</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
