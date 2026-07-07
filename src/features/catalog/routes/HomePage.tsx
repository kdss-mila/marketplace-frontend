import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { listProducts } from '@/features/catalog/api/catalogApi'
import { getDepartmentBySlug, getProductListParams } from '@/features/catalog/constants/departments'
import { HeroCarousel } from '@/features/catalog/components/HeroCarousel'
import { ValuePropositions } from '@/features/catalog/components/ValuePropositions'
import { CategoryChips } from '@/features/catalog/components/CategoryChips'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { Product } from '@/types'

function ProductCarousel({ products }: { products: Product[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on('reInit', onSelect)
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api, onSelect])

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold sm:text-xl">Destaques para você</h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canScrollNext}
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Carousel setApi={setApi} opts={{ align: 'start' }} className="w-full">
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  )
}

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    setLoading(true)
    const dept = category === 'all' ? undefined : getDepartmentBySlug(category)
    const params = dept ? getProductListParams(dept) : undefined
    listProducts(params)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="space-y-6">
      <HeroCarousel />
      <ValuePropositions />
      <CategoryChips selected={category} onSelect={setCategory} />

      <section>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </p>
        ) : (
          <ProductCarousel products={products} />
        )}
      </section>
    </div>
  )
}
