import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, PanelLayout } from '@/components/layout/Layouts'
import { ProtectedRoute, RoleRoute } from '@/app/router/ProtectedRoute'
import { HomePage } from '@/features/catalog/routes/HomePage'
import { SearchPage } from '@/features/catalog/routes/ProductPage'
import { ProductDetailPage } from '@/features/catalog/routes/ProductDetailPage'
import { LoginPage } from '@/features/auth/routes/LoginPage'
import { RegisterPage } from '@/features/auth/routes/RegisterPage'
import { CartPage } from '@/features/checkout/routes/CartPage'
import { CheckoutPage } from '@/features/checkout/routes/CheckoutPage'
import { OrdersPage } from '@/features/checkout/routes/OrdersPage'
import { SellerProductsPage } from '@/features/seller-panel/routes/SellerProductsPage'
import { NewProductPage } from '@/features/seller-panel/routes/NewProductPage'
import { SellerSalesPage } from '@/features/seller-panel/routes/SellerSalesPage'
import { SellerOnboardingPage } from '@/features/seller-panel/routes/SellerOnboardingPage'
import { AdminUsersPage } from '@/features/backoffice/routes/AdminUsersPage'
import { AdminCategoriesPage } from '@/features/backoffice/routes/AdminCategoriesPage'
import { AdminPaymentsPage } from '@/features/backoffice/routes/AdminPaymentsPage'
import { AdminRepassesPage } from '../../features/backoffice/routes/AdminRepassesPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="busca" element={<SearchPage />} />
        <Route path="produto/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="carrinho" element={<CartPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="conta/pedidos" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={['seller']} />}>
        <Route element={<PanelLayout variant="seller" />}>
          <Route path="vendedor/anuncios" element={<SellerProductsPage />} />
          <Route path="vendedor/anuncios/novo" element={<NewProductPage />} />
          <Route path="vendedor/vendas" element={<SellerSalesPage />} />
          <Route path="vendedor/onboarding" element={<SellerOnboardingPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={['admin']} />}>
        <Route element={<PanelLayout variant="admin" />}>
          <Route path="admin/usuarios" element={<AdminUsersPage />} />
          <Route path="admin/categorias" element={<AdminCategoriesPage />} />
          <Route path="admin/pagamentos" element={<AdminPaymentsPage />} />
          <Route path="admin/repasses" element={<AdminRepassesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
