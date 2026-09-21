import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '../context/useSession'
import type { CodigoRol } from '../types/auth'

interface Props {
  children: ReactNode
  /** Si se omite, basta con tener sesión. */
  roles?: CodigoRol[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { sesion } = useSession()
  const ubicacion = useLocation()

  if (!sesion) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />
  }

  // Con sesión pero sin el rol: se dice explícitamente que falta permiso.
  // Mandarlo al login sería confuso, porque la sesión sí es válida.
  if (roles && (!sesion.usuario.rol || !roles.includes(sesion.usuario.rol))) {
    return <Navigate to="/sin-permiso" replace />
  }

  return <>{children}</>
}
