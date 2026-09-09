import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../services/auth'
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

  if (roles && !roles.includes(session.user.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute