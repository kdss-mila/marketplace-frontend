import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Truck, ShoppingCart } from 'lucide-react'
import { useCart } from '@/app/providers/CartProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatInstallment, getProductMeta } from '@/utils/format'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [favorited, setFavorited] = useState(false)
  const meta = getProductMeta(product.id, product.price)

  function handleAddToCart() {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      weight: product.weight,
      dimensions: product.dimensions,
    })
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative bg-muted/40 p-4">
        {meta.discount > 0 && (
          <Badge className="absolute left-3 top-3 border-0 bg-red-500 text-white hover:bg-red-500">
            -{meta.discount}%
          </Badge>
        )}
        <button
          type="button"
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={() => setFavorited(!favorited)}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 shadow-sm transition-colors hover:bg-white"
        >
          <Heart
            className={cn('h-4 w-4', favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
          />
        </button>
        <Link to={`/produto/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="mx-auto h-36 w-full object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <Link
          to={`/produto/${product.id}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {product.title}
        </Link>

        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.floor(meta.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({meta.reviews})</span>
        </div>

        <div className="mt-2">
          {meta.discount > 0 && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(meta.originalPrice)}
            </p>
          )}
          <p className="text-xl font-bold">{formatCurrency(product.price)}</p>
          <p className="mt-0.5 text-xs font-medium text-emerald-600">
            {formatInstallment(product.price)}
          </p>
        </div>

        {meta.freeShipping && (
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
            <Truck className="h-3.5 w-3.5" />
            Frete grátis
          </div>
        )}

        <Button
          variant="outline"
          className="mt-auto w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </div>
    </article>
  )
}
