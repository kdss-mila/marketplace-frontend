import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutGrid,
  Monitor,
  Shirt,
  Home,
  Sparkles,
  Tag,
  ChevronRight,
  ChevronDown,
  Laptop,
  List,
} from 'lucide-react'
import {
  brands,
  departments,
  getDepartmentSearchPath,
  priceRanges,
} from '@/features/catalog/constants/departments'
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters'
import { cn } from '@/lib/utils'

const iconBySlug: Record<string, React.ComponentType<{ className?: string }>> = {
  eletronicos: Monitor,
  informatica: Laptop,
  moda: Shirt,
  casa: Home,
}

interface CatalogSidebarProps {
  className?: string
}

export function CatalogSidebar({ className }: CatalogSidebarProps) {
  const {
    filters,
    isListAll,
    selectListAll,
    selectDepartment,
    selectSubCategory,
    selectBrand,
    selectPriceRange,
    clearRefinementFilters,
  } = useCatalogFilters()

  const [expandedDept, setExpandedDept] = useState<string | null>(filters.dept ?? null)

  useEffect(() => {
    if (filters.dept) setExpandedDept(filters.dept)
  }, [filters.dept])

  function toggleDepartment(slug: string) {
    setExpandedDept((current) => (current === slug ? null : slug))
  }

  function handleDepartmentClick(slug: string, hasSubcategories: boolean) {
    if (hasSubcategories) {
      setExpandedDept(slug)
      selectDepartment(slug)
    } else {
      selectDepartment(slug)
    }
  }

  const selectedPriceRange = priceRanges.find(
    (range) =>
      String(range.min) === (filters.minPrice ?? '') &&
      String(range.max ?? '') === (filters.maxPrice ?? '')
  )

  const showRefinementFilters = isListAll || Boolean(filters.dept)

  return (
    <aside className={cn('hidden w-60 shrink-0 lg:block', className)}>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <LayoutGrid className="h-4 w-4" />
          Departamentos
        </div>

        <nav className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => {
              selectListAll()
              setExpandedDept(null)
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors',
              isListAll
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <List className="h-4 w-4 shrink-0" />
            Listar todos
          </button>

          {departments.map((dept) => {
            const Icon = iconBySlug[dept.slug] ?? LayoutGrid
            const isExpanded = expandedDept === dept.slug
            const isSelected = filters.dept === dept.slug
            const hasSubcategories = Boolean(dept.subcategories?.length)

            return (
              <div key={dept.slug}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleDepartmentClick(dept.slug, hasSubcategories)}
                    className={cn(
                      'flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                      isSelected && !filters.sub
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{dept.label}</span>
                  </button>
                  {hasSubcategories && (
                    <button
                      type="button"
                      aria-label={`Expandir ${dept.label}`}
                      onClick={() => toggleDepartment(dept.slug)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  )}
                </div>

                {hasSubcategories && isExpanded && (
                  <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l pl-2">
                    {dept.subcategories!.map((sub) => (
                      <button
                        key={sub.slug}
                        type="button"
                        onClick={() => selectSubCategory(dept.slug, sub.slug)}
                        className={cn(
                          'rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                          filters.dept === dept.slug && filters.sub === sub.slug
                            ? 'bg-primary/10 font-medium text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {showRefinementFilters && (
        <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Refinar busca</p>
            {(filters.brand || filters.minPrice || filters.maxPrice) && (
              <button
                type="button"
                onClick={clearRefinementFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Valor
              </p>
              <div className="flex flex-col gap-1">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() =>
                      selectPriceRange(
                        selectedPriceRange?.label === range.label ? null : range.min,
                        selectedPriceRange?.label === range.label ? null : (range.max ?? null)
                      )
                    }
                    className={cn(
                      'rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                      selectedPriceRange?.label === range.label
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Marca
              </p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => selectBrand(filters.brand === brand ? null : brand)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      filters.brand === brand
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'border-transparent bg-muted text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Link
        to={getDepartmentSearchPath(departments[0])}
        className="mt-4 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Ofertas do dia</p>
            <p className="text-xs text-muted-foreground">Até 70% OFF</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <Link
        to="/"
        onClick={() => selectListAll()}
        className="mt-4 block rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4 transition-shadow hover:shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Destaques
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Confira as melhores ofertas selecionadas para você.
        </p>
      </Link>
    </aside>
  )
}
