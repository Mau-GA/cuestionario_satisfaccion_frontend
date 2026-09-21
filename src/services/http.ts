import { API_BASE_URL } from '../config'
import { borrarSesion, EVENTO_NO_AUTORIZADO, leerSesion } from './session'

/** Error con el mensaje que mandó el API, no uno genérico. */
export class ApiError extends Error {
  status: number

  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

interface Opciones extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Rutas públicas (login, solicitar acceso) no mandan token. */
  autenticada?: boolean
}

export async function api<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { body, autenticada = true, headers, ...resto } = opciones

  const cabeceras = new Headers(headers)
  if (body !== undefined) cabeceras.set('Content-Type', 'application/json')
  if (autenticada) {
    const token = leerSesion()?.accessToken
    if (token) cabeceras.set('Authorization', `Bearer ${token}`)
  }

  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...resto,
    headers: cabeceras,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // El token venció o la cuenta se desactivó: se cierra sesión y se avisa a la app.
  if (respuesta.status === 401 && autenticada) {
    borrarSesion()
    window.dispatchEvent(new Event(EVENTO_NO_AUTORIZADO))
  }

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, await mensajeDeError(respuesta))
  }

  return respuesta.status === 204 ? (undefined as T) : ((await respuesta.json()) as T)
}

async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = await respuesta.json()
    const mensaje = cuerpo?.message
    // Nest manda un arreglo cuando falla la validación de varios campos.
    if (Array.isArray(mensaje)) return mensaje.join('. ')
    if (typeof mensaje === 'string') return mensaje
  } catch {
    /* el cuerpo no era JSON */
  }
  return `Error ${respuesta.status}`
}
