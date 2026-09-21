import type { Sesion } from '../types/auth'

const CLAVE = 'encuestas.sesion'

/** Evento que dispara el cliente HTTP cuando el API responde 401. */
export const EVENTO_NO_AUTORIZADO = 'auth:no-autorizado'

export function leerSesion(): Sesion | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as Sesion) : null
  } catch {
    // Storage bloqueado o JSON corrupto: se trata como "sin sesión".
    return null
  }
}

export function guardarSesion(sesion: Sesion) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    // Sin persistencia la sesión vive solo en memoria; no es motivo de error.
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    /* nada que hacer */
  }
}
