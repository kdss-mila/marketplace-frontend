import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useFavorites } from '@/app/providers/FavoritesProvider'
import { useCart } from '@/app/providers/CartProvider'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'

export function FavoritesPage() {
  const { user } = useAuth()
  const { favorites, removeFavorite } = useFavorites()
  const { addItem } = useCart()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Entre para ver seus favoritos</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Faça login para salvar e acessar os produtos que você curtiu.
        </p>
        <Button asChild className="mt-6">
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Nenhum favorito ainda</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Toque no coração dos produtos que você gostar para salvá-los aqui.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Explorar produtos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">Meus favoritos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {favorites.length} produto(s) salvo(s)
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((item) => (
          <article
            key={item.productId}
            className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <Link to={`/produto/${item.productId}`} className="relative bg-muted/40 p-4">
              <img
                src={item.image}
                alt={item.title}
                className="mx-auto h-36 w-full object-contain"
              />
            </Link>
            <div className="flex flex-1 flex-col p-4 pt-3">
              <Link
                to={`/produto/${item.productId}`}
                className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
              >
                {item.title}
              </Link>
              <p className="mt-2 text-lg font-bold">{formatCurrency(item.price)}</p>
              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => removeFavorite(item.productId)}
                >
                  Remover
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    addItem({
                      productId: item.productId,
                      title: item.title,
                      price: item.price,
                      quantity: 1,
                      image: item.image,
                      sellerId: item.sellerId,
                      sellerName: item.sellerName,
                      weight: item.weight,
                      dimensions: item.dimensions,
                    })
                  }
                >
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
