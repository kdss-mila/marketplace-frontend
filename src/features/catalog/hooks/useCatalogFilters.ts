import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getProductListParamsFromFilters,
  hasActiveCatalogFilters,
  type CatalogFilterParams,
} from '@/features/catalog/constants/departments'

export function useCatalogFilters() {
  const [params, setSearchParams] = useSearchParams()

  const filters = useMemo<CatalogFilterParams>(
    () => ({
      dept: params.get('dept') ?? undefined,
      sub: params.get('sub') ?? undefined,
      q: params.get('q') ?? undefined,
      categoryId: params.get('categoryId') ?? undefined,
      includeSubcategories: params.get('includeSubcategories') === 'true' || undefined,
      brand: params.get('brand') ?? undefined,
      minPrice: params.get('minPrice') ?? undefined,
      maxPrice: params.get('maxPrice') ?? undefined,
    }),
    [params]
  )

  const isListAll = !filters.dept && !filters.q && !filters.categoryId
  const hasFilters = hasActiveCatalogFilters(filters)
  const listParams = useMemo(() => getProductListParamsFromFilters(filters), [filters])

  const updateFilters = useCallback(
    (updates: Partial<Record<keyof CatalogFilterParams, string | null>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const selectDepartment = useCallback(
    (deptSlug: string) => {
      updateFilters({ dept: deptSlug, sub: null, q: null, categoryId: null, includeSubcategories: null })
    },
    [updateFilters]
  )

  const selectSubCategory = useCallback(
    (deptSlug: string, subSlug: string) => {
      updateFilters({
        dept: deptSlug,
        sub: subSlug,
        q: null,
        categoryId: null,
        includeSubcategories: null,
      })
    },
    [updateFilters]
  )

  const selectListAll = useCallback(() => {
    updateFilters({
      dept: null,
      sub: null,
      q: null,
      categoryId: null,
      includeSubcategories: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
    })
  }, [updateFilters])

  const selectBrand = useCallback(
    (brand: string | null) => {
      updateFilters({ brand })
    },
    [updateFilters]
  )

  const selectPriceRange = useCallback(
    (min: number | null, max: number | null) => {
      updateFilters({
        minPrice: min !== null ? String(min) : null,
        maxPrice: max !== null ? String(max) : null,
      })
    },
    [updateFilters]
  )

  const clearRefinementFilters = useCallback(() => {
    updateFilters({ brand: null, minPrice: null, maxPrice: null })
  }, [updateFilters])

  return {
    filters,
    isListAll,
    hasFilters,
    listParams,
    updateFilters,
    selectDepartment,
    selectSubCategory,
    selectListAll,
    selectBrand,
    selectPriceRange,
    clearRefinementFilters,
  }
}
