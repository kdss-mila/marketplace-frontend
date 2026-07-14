import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { CartProvider } from '@/app/providers/CartProvider'
import { FavoritesProvider } from '@/app/providers/FavoritesProvider'
import { AppRouter } from '@/app/router/AppRouter'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppRouter />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
