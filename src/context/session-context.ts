import { createContext } from 'react'
import type { Sesion } from '../types/auth'

export interface ValorSesion {
  sesion: Sesion | null
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>
  iniciarSesionConGoogle: (credential: string) => Promise<void>
  /** Vuelve a pedir /auth/perfil y actualiza sesion.usuario con lo que regrese. */
  actualizarPerfil: () => Promise<void>
  cerrarSesion: () => void
}

/** Va en su propio archivo: un módulo que exporta algo que no es componente rompe fast-refresh. */
export const SessionContext = createContext<ValorSesion | null>(null)
