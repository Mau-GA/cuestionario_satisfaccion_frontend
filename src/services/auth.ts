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
