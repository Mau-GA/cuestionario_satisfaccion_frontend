import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession, hasTokenExpired, logout } from '../services/auth'
import type { Role } from '../types/auth'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: Role[]
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation()
  const session = getSession()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Sesión vencida sin refreshToken: no hay forma de renovarla.
  // Con refreshToken se deja pasar y la capa http la renueva sola.
  if (hasTokenExpired(session) && !session.refreshToken) {
    logout()
    return (
      <Navigate to="/login" replace state={{ from: location, expired: true }} />
    )
  }

  if (roles && (session.user.rol === null || !roles.includes(session.user.rol))) {
    return <Navigate to="/sin-acceso" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
