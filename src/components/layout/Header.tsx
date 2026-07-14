import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Heart,
  ClipboardList,
  ShoppingCart,
  ChevronDown,
  Menu,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useCart } from '@/app/providers/CartProvider'
import { useFavorites } from '@/app/providers/FavoritesProvider'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, type FormEvent } from 'react'
import { departments, getDepartmentSearchPath } from '@/features/catalog/constants/departments'
import { cn } from '@/lib/utils'

function NavLink({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {badge}
          </span>
        )}
      </span>
      <span className="hidden sm:block">{label}</span>
    </Link>
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { favoriteCount } = useFavorites()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const firstName = user?.name.split(' ')[0] ?? 'Conta'

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 lg:gap-6">
        <BrandLogo />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden shrink-0 gap-1.5 md:flex">
              <Menu className="h-4 w-4" />
              Categorias
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {departments.map((dept) => (
              <DropdownMenuItem
                key={dept.slug}
                onClick={() => navigate(getDepartmentSearchPath(dept))}
              >
                {dept.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <div className="relative flex w-full items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos, marcas e muito mais..."
              className="h-10 rounded-r-none border-r-0 pr-4 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-12 shrink-0 rounded-l-none rounded-r-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLink to="/favoritos" icon={Heart} label="Favoritos" badge={favoriteCount} />
          <NavLink to="/conta/pedidos" icon={ClipboardList} label="Pedidos" />
          <NavLink to="/carrinho" icon={ShoppingCart} label="Carrinho" badge={itemCount} />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-accent">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'
                    )}
                  >
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium lg:block">{firstName}</span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/conta/pedidos')}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Meus pedidos
                </DropdownMenuItem>
                {user.role === 'seller' && (
                  <DropdownMenuItem onClick={() => navigate('/vendedor/anuncios')}>
                    Painel do vendedor
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin/pagamentos')}>
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registro">Cadastrar</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
