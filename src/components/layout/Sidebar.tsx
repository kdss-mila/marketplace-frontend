import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const sellerLinks = [
  { to: '/vendedor/anuncios', label: 'Anúncios' },
  { to: '/vendedor/anuncios/novo', label: 'Novo anúncio' },
  { to: '/vendedor/vendas', label: 'Vendas' },
  { to: '/vendedor/onboarding', label: 'Onboarding' },
]

const adminLinks = [
  { to: '/admin/usuarios', label: 'Usuários' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/pagamentos', label: 'Pagamentos' },
  { to: '/admin/repasses', label: 'Repasses' },
]

interface SidebarProps {
  variant: 'seller' | 'admin'
}

export function Sidebar({ variant }: SidebarProps) {
  const location = useLocation()
  const links = variant === 'seller' ? sellerLinks : adminLinks
  const title = variant === 'seller' ? 'Painel do Vendedor' : 'Backoffice'

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
              location.pathname === link.to && 'bg-accent font-medium'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
