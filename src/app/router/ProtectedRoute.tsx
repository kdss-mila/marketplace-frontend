import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import type { UserRole } from '@/types'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

interface RoleRouteProps {
  roles: UserRole[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
