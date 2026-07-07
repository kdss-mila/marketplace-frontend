export interface Department {
  label: string
  slug: string
  categoryId?: string
  searchQuery?: string
  includeSubcategories?: boolean
}

export const departments: Department[] = [
  {
    label: 'Eletrônicos',
    slug: 'eletronicos',
    categoryId: 'cat-1',
    includeSubcategories: true,
  },
  { label: 'Informática', slug: 'informatica', searchQuery: 'notebook' },
  { label: 'Celulares', slug: 'celulares', categoryId: 'cat-2' },
  { label: 'Áudio', slug: 'audio', searchQuery: 'fone' },
  { label: 'Wearables', slug: 'wearables', searchQuery: 'relógio' },
  { label: 'Moda', slug: 'moda', categoryId: 'cat-3' },
  { label: 'Casa', slug: 'casa', categoryId: 'cat-4' },
]

export function getDepartmentSearchPath(dept: Department): string {
  const params = new URLSearchParams()
  if (dept.categoryId) {
    params.set('categoryId', dept.categoryId)
    if (dept.includeSubcategories) {
      params.set('includeSubcategories', 'true')
    }
  } else if (dept.searchQuery) {
    params.set('q', dept.searchQuery)
  } else {
    params.set('q', dept.slug)
  }
  return `/busca?${params.toString()}`
}

export function getDepartmentByCategoryId(categoryId: string): Department | undefined {
  return departments.find((d) => d.categoryId === categoryId)
}

export function getDepartmentBySlug(slug: string): Department | undefined {
  return departments.find((d) => d.slug === slug)
}

export function getProductListParams(dept: Department): {
  q?: string
  categoryId?: string
  includeSubcategories?: boolean
} {
  if (dept.categoryId) {
    return {
      categoryId: dept.categoryId,
      includeSubcategories: dept.includeSubcategories,
    }
  }
  if (dept.searchQuery) {
    return { q: dept.searchQuery }
  }
  return { q: dept.slug }
}
