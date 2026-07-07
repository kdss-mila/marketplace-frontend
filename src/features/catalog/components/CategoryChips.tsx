import { LayoutGrid, Monitor, Laptop, Smartphone, Shirt, Home, Headphones, Watch } from 'lucide-react'
import { departments } from '@/features/catalog/constants/departments'
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

const categories = [
  { id: 'all', label: 'Todos', icon: LayoutGrid },
  ...departments.map((dept) => ({
    id: dept.slug,
    label: dept.label,
    icon: iconBySlug[dept.slug] ?? LayoutGrid,
  })),
]

interface CategoryChipsProps {
  selected: string
  onSelect: (id: string) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
            selected === id
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-transparent bg-white text-muted-foreground hover:border-border hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

export { categories }
