import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { listProducts } from '@/features/catalog/api/catalogApi'
import { getDepartmentBySlug } from '@/features/catalog/constants/departments'
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters'
import { HeroCarousel } from '@/features/catalog/components/HeroCarousel'
import { ValuePropositions } from '@/features/catalog/components/ValuePropositions'
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
        <CarouselContent className="-ml-4 items-stretch">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="flex pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  )
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function HomePage() {
  const { filters, listParams, hasFilters } = useCatalogFilters()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const filterKey = JSON.stringify(listParams)

  useEffect(() => {
    setLoading(true)
    listProducts(Object.keys(listParams).length > 0 ? listParams : undefined)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [filterKey, listParams])

  const sectionTitle = useMemo(() => {
    if (filters.dept) {
      const dept = getDepartmentBySlug(filters.dept)
      if (filters.sub && dept?.subcategories) {
        const sub = dept.subcategories.find((item) => item.slug === filters.sub)
        if (sub) return sub.label
      }
      return dept?.label ?? 'Produtos'
    }
    if (hasFilters) return 'Resultados filtrados'
    return 'Destaques para você'
  }, [filters.dept, filters.sub, hasFilters])

  return (
    <div className="space-y-6">
      {!hasFilters && <HeroCarousel />}
      {!hasFilters && <ValuePropositions />}

      <section>
        {hasFilters && (
          <h2 className="mb-4 text-lg font-bold sm:text-xl">{sectionTitle}</h2>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nenhum produto encontrado com os filtros selecionados.
          </p>
        ) : hasFilters ? (
          <ProductGrid products={products} />
        ) : (
          <ProductCarousel products={products} />
        )}
      </section>
    </div>
  )
}
