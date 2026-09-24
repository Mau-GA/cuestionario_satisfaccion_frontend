import { api } from './http'
import type { Sesion, Usuario } from '../types/auth'

export function login(correoElectronico: string, contrasena: string) {
  return api<Sesion>('/auth/login', {
    method: 'POST',
    body: { correoElectronico, contrasena },
    autenticada: false,
  })
}

/** `credential` es el ID token que entrega Google Identity Services. */
export function loginConGoogle(credential: string) {
  return api<Sesion>('/auth/google', {
    method: 'POST',
    body: { credential },
    autenticada: false,
  })
}

export function perfil() {
  return api<Usuario>('/auth/perfil')
}

/** `contrasenaActual` se omite al crearla por primera vez: la cuenta no tiene ninguna que verificar. */
export function establecerContrasena(contrasenaNueva: string, contrasenaActual?: string) {
  return api<{ mensaje: string }>('/auth/contrasena', {
    method: 'POST',
    body: contrasenaActual ? { contrasenaActual, contrasenaNueva } : { contrasenaNueva },
    // Un 401 aquí es "la contraseña actual está mal", no "se venció la
    // sesión": el access token que hizo la petición sigue siendo válido.
    manejarSesionExpirada: false,
  })
}
