import { api } from './http'
import type { Sesion, Usuario } from '../types/auth'

export function login(correoElectronico: string, contrasena: string) {
  return api<Sesion>('/auth/login', {
    method: 'POST',
    body: { correoElectronico, contrasena },
    autenticada: false,
  })
}

export function perfil() {
  return api<Usuario>('/auth/perfil')
}
