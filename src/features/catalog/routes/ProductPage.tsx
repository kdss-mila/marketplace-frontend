import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProducts, listCategories } from '@/features/catalog/api/catalogApi'
import { getDepartmentByCategoryId } from '@/features/catalog/constants/departments'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import type { Category, Product } from '@/types'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const includeSubcategories = params.get('includeSubcategories') === 'true'
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    listProducts({
      ...(q ? { q } : {}),
      ...(categoryId ? { categoryId, includeSubcategories } : {}),
    })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [q, categoryId, includeSubcategories])

  const pageTitle = useMemo(() => {
    if (categoryId) {
      const dept = getDepartmentByCategoryId(categoryId)
      const category = categories.find((c) => c.id === categoryId)
      return dept?.label ?? category?.name ?? 'Categoria'
    }
    if (q) return `Resultados para "${q}"`
    return 'Todos os produtos'
  }, [categoryId, q, categories])

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
