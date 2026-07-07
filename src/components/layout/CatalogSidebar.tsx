import { Link } from 'react-router-dom'
import {
  LayoutGrid,
  Monitor,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Tag,
  ChevronRight,
  Laptop,
  Headphones,
  Watch,
} from 'lucide-react'
import { departments, getDepartmentSearchPath } from '@/features/catalog/constants/departments'
import { cn } from '@/lib/utils'

const iconBySlug: Record<string, React.ComponentType<{ className?: string }>> = {
  eletronicos: Monitor,
  informatica: Laptop,
  celulares: Smartphone,
  audio: Headphones,
  wearables: Watch,
  moda: Shirt,
  casa: Home,
}

interface CatalogSidebarProps {
  className?: string
}

export function CatalogSidebar({ className }: CatalogSidebarProps) {
  return (
    <aside className={cn('hidden w-56 shrink-0 lg:block', className)}>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <LayoutGrid className="h-4 w-4" />
          Todos os departamentos
        </div>
        <nav className="flex flex-col gap-0.5">
          {departments.map((dept) => {
            const Icon = iconBySlug[dept.slug] ?? LayoutGrid
            return (
              <Link
                key={dept.slug}
                to={getDepartmentSearchPath(dept)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {dept.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <Link
        to="/busca?categoryId=cat-1&includeSubcategories=true"
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
