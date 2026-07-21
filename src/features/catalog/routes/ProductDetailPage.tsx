import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { getProduct } from '@/features/catalog/api/catalogApi'
import { useCart } from '@/app/providers/CartProvider'
import { useFavorites } from '@/app/providers/FavoritesProvider'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return
    setCurrent(embla.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => { api.off('select', onSelect) }
  }, [api, onSelect])

  if (loading) return <p>Carregando...</p>
  if (!product) return <p>Produto não encontrado.</p>

  const hasMultiple = product.images.length > 1

  function handleBuy() {
    addItem({
      productId: product!.id,
      title: product!.title,
      price: product!.price,
      quantity: 1,
      image: product!.images[0],
      sellerId: product!.sellerId,
      sellerName: product!.sellerName,
      weight: product!.weight,
      dimensions: product!.dimensions,
    })
    setAdded(true)
  }

  function handleToggleFavorite() {
    if (!product) return
    toggleFavorite({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      weight: product.weight,
      dimensions: product.dimensions,
    })
  }

  const favorited = isFavorite(product.id)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="relative px-10">
          <Carousel setApi={setApi} opts={{ loop: false }}>
            <CarouselContent>
              {product.images.map((url, i) => (
                <CarouselItem key={url}>
                  <img
                    src={url}
                    alt={`${product.title} — imagem ${i + 1}`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {hasMultiple && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </div>

        {hasMultiple && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  'h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition',
                  i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <img src={url} alt={`Miniatura ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Badge variant="secondary" className="mb-2">
          Estoque: {product.stock}
        </Badge>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <button
            type="button"
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={favorited}
            onClick={handleToggleFavorite}
            className="rounded-full border p-2.5 transition-colors hover:bg-accent"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Vendido por {product.sellerName}</p>
        <p className="mt-4 text-3xl font-bold">{formatCurrency(product.price)}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
        <Button className="mt-8" size="lg" onClick={handleBuy} disabled={product.stock === 0}>
          {added ? 'Adicionado ao carrinho!' : 'Comprar'}
        </Button>
      </div>
    </div>
  )
}
