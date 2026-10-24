import { http } from './http'
import type {
  EncuestaPublica,
  RespuestaEnviada,
} from '../types/encuestasPublicas'

const CLAVE_RESPONDIDA = 'encuesta.respondida.'

export function obtenerEncuestaPublica(
  token: string,
): Promise<EncuestaPublica> {
  return http.request<EncuestaPublica>(
    `/encuestas/publicas/${encodeURIComponent(token)}`,
    { auth: false },
  )
}

export async function enviarRespuestas(
  token: string,
  respuestas: RespuestaEnviada[],
): Promise<void> {
  await http.request<{ idEncuestaRespondida: number }>(
    `/encuestas/publicas/${encodeURIComponent(token)}/respuestas`,
    { method: 'POST', body: { respuestas }, auth: false },
  )
}

export function yaRespondida(token: string): boolean {
  try {
    return localStorage.getItem(CLAVE_RESPONDIDA + token) === '1'
  } catch {
    return false
  }
}

export function marcarRespondida(token: string): void {
  try {
    localStorage.setItem(CLAVE_RESPONDIDA + token, '1')
  } catch {
    // Sin almacenamiento disponible: el candado real es el token de un solo uso (BE-31).
  }
}
