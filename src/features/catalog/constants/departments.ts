export interface SubCategory {
  label: string
  slug: string
  categoryId?: string
  searchQuery?: string
}

export interface Department {
  label: string
  slug: string
  categoryId?: string
  searchQuery?: string
  includeSubcategories?: boolean
  subcategories?: SubCategory[]
}

export const priceRanges = [
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 – R$ 500', min: 100, max: 500 },
  { label: 'R$ 500 – R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 – R$ 5.000', min: 1000, max: 5000 },
  { label: 'Acima de R$ 5.000', min: 5000, max: undefined as number | undefined },
] as const

export const brands = ['Samsung', 'Apple', 'Kingston', 'Dell', 'Lenovo', 'Sony', 'LG'] as const

export const departments: Department[] = [
  {
    label: 'Eletrônicos',
    slug: 'eletronicos',
    categoryId: 'cat-1',
    includeSubcategories: true,
    subcategories: [
      { label: 'Celulares', slug: 'celulares', categoryId: 'cat-2' },
      { label: 'Fones e áudio', slug: 'audio', searchQuery: 'fone' },
      { label: 'Wearables', slug: 'wearables', searchQuery: 'relógio' },
    ],
  },
  {
    label: 'Informática',
    slug: 'informatica',
    categoryId: 'cat-info',
    includeSubcategories: true,
    subcategories: [
      { label: 'Notebooks', slug: 'notebooks', categoryId: 'cat-info-notebooks' },
      { label: 'Memórias', slug: 'memorias', categoryId: 'cat-info-memorias' },
      { label: 'SSD', slug: 'ssd', categoryId: 'cat-info-ssd' },
    ],
  },
  { label: 'Moda', slug: 'moda', categoryId: 'cat-3' },
  { label: 'Casa', slug: 'casa', categoryId: 'cat-4' },
]

export function getDepartmentSearchPath(dept: Department): string {
  const params = new URLSearchParams({ dept: dept.slug })
  return `/?${params.toString()}`
}

export function getDepartmentByCategoryId(categoryId: string): Department | undefined {
  return departments.find((d) => d.categoryId === categoryId)
}

export function getDepartmentBySlug(slug: string): Department | undefined {
  return departments.find((d) => d.slug === slug)
}

export function getSubCategory(dept: Department, subSlug: string): SubCategory | undefined {
  return dept.subcategories?.find((s) => s.slug === subSlug)
}

export function getProductListParams(dept: Department, subSlug?: string): {
  q?: string
  categoryId?: string
  includeSubcategories?: boolean
} {
  if (subSlug && dept.subcategories) {
    const sub = getSubCategory(dept, subSlug)
    if (sub) {
      if (sub.categoryId) return { categoryId: sub.categoryId }
      if (sub.searchQuery) return { q: sub.searchQuery }
    }
  }

  if (dept.categoryId) {
    return {
      categoryId: dept.categoryId,
      includeSubcategories: dept.includeSubcategories,
    }
  }
  if (dept.searchQuery) return { q: dept.searchQuery }
  return { q: dept.slug }
}

export interface CatalogFilterParams {
  dept?: string
  sub?: string
  q?: string
  categoryId?: string
  includeSubcategories?: boolean
  brand?: string
  minPrice?: string
  maxPrice?: string
}

export function getProductListParamsFromFilters(filters: CatalogFilterParams): {
  q?: string
  categoryId?: string
  includeSubcategories?: boolean
  brand?: string
  minPrice?: number
  maxPrice?: number
} {
  const result: ReturnType<typeof getProductListParamsFromFilters> = {}

  if (filters.dept) {
    const department = getDepartmentBySlug(filters.dept)
    if (department) {
      Object.assign(result, getProductListParams(department, filters.sub))
    }
  } else if (filters.q) {
    result.q = filters.q
  } else if (filters.categoryId) {
    result.categoryId = filters.categoryId
    result.includeSubcategories = filters.includeSubcategories
  }

  if (filters.brand) result.brand = filters.brand
  if (filters.minPrice) result.minPrice = Number(filters.minPrice)
  if (filters.maxPrice) result.maxPrice = Number(filters.maxPrice)

  return result
}

export function hasActiveCatalogFilters(filters: CatalogFilterParams): boolean {
  return Boolean(
    filters.dept ||
      filters.sub ||
      filters.q ||
      filters.categoryId ||
      filters.brand ||
      filters.minPrice ||
      filters.maxPrice
  )
}
