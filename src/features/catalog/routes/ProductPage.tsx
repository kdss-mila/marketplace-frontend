import { useEffect, useMemo, useState } from 'react'
import { listProducts, listCategories } from '@/features/catalog/api/catalogApi'
import { getDepartmentByCategoryId, getDepartmentBySlug } from '@/features/catalog/constants/departments'
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import type { Category, Product } from '@/types'

export function SearchPage() {
  const { filters, listParams } = useCatalogFilters()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const filterKey = JSON.stringify(listParams)

  useEffect(() => {
    setLoading(true)
    listProducts(Object.keys(listParams).length > 0 ? listParams : undefined)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [filterKey, listParams])

  const pageTitle = useMemo(() => {
    if (filters.dept) {
      const dept = getDepartmentBySlug(filters.dept)
      if (filters.sub && dept?.subcategories) {
        const sub = dept.subcategories.find((item) => item.slug === filters.sub)
        if (sub) return sub.label
      }
      return dept?.label ?? 'Categoria'
    }
    if (filters.categoryId) {
      const dept = getDepartmentByCategoryId(filters.categoryId)
      const category = categories.find((c) => c.id === filters.categoryId)
      return dept?.label ?? category?.name ?? 'Categoria'
    }
    if (filters.q) return `Resultados para "${filters.q}"`
    return 'Todos os produtos'
  }, [filters, categories])

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">{pageTitle}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {loading ? 'Carregando...' : `${products.length} produto(s) encontrado(s)`}
      </p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
