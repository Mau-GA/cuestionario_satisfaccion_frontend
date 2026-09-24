import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { borrarSesion, EVENTO_NO_AUTORIZADO, guardarSesion, leerSesion } from '../services/session'
import {
  login as loginRequest,
  loginConGoogle as loginConGoogleRequest,
  perfil as perfilRequest,
} from '../services/auth'
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

  const iniciarSesionConGoogle = useCallback(async (credential: string) => {
    const nueva = await loginConGoogleRequest(credential)
    guardarSesion(nueva)
    setSesion(nueva)
  }, [])

  // No depende de `sesion` en las dependencias: usa la forma funcional de
  // setSesion para leer el valor vigente, así su identidad no cambia cada vez
  // que cambia la sesión.
  const actualizarPerfil = useCallback(async () => {
    const usuario = await perfilRequest()
    setSesion((previa) => {
      if (!previa) return previa
      const actualizada = { ...previa, usuario }
      guardarSesion(actualizada)
      return actualizada
    })
  }, [])

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, iniciarSesionConGoogle, actualizarPerfil, cerrarSesion }),
    [sesion, iniciarSesion, iniciarSesionConGoogle, actualizarPerfil, cerrarSesion],
  )

  return <SessionContext value={valor}>{children}</SessionContext>
}
