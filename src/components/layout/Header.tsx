import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, User } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useCart } from '@/app/providers/CartProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, type FormEvent } from 'react'

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link to="/" className="text-xl font-bold">
          Marketplace
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/carrinho" aria-label="Carrinho">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/conta/pedidos">
                  <User className="mr-1 h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Link>
              </Button>
              {user.role === 'seller' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendedor/anuncios">Vendedor</Link>
                </Button>
              )}
              {user.role === 'admin' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/pagamentos">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registro">Cadastrar</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
