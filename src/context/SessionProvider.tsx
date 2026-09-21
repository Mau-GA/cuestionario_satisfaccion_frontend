import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { borrarSesion, EVENTO_NO_AUTORIZADO, guardarSesion, leerSesion } from '../services/session'
import { login as loginRequest } from '../services/auth'
import { SessionContext } from './session-context'
import type { Sesion } from '../types/auth'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => leerSesion())

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setSesion(null)
  }, [])

  // El cliente HTTP avisa por evento cuando el API responde 401: puede pasar
  // en cualquier petición, no solo en las que dispara esta pantalla.
  useEffect(() => {
    window.addEventListener(EVENTO_NO_AUTORIZADO, cerrarSesion)
    return () => window.removeEventListener(EVENTO_NO_AUTORIZADO, cerrarSesion)
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    const nueva = await loginRequest(correo, contrasena)
    guardarSesion(nueva)
    setSesion(nueva)
  }, [])

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, cerrarSesion }),
    [sesion, iniciarSesion, cerrarSesion],
  )

  return <SessionContext value={valor}>{children}</SessionContext>
}
