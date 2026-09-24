import { api } from './http'
import type { CuestionarioPublico, EncuestaEnInicio } from '../types/admin'

/** Ninguna de estas llamadas manda token: quien responde no tiene cuenta. */

export const encuestasEnInicio = () =>
  api<EncuestaEnInicio[]>('/publico/encuestas', { autenticada: false })

export const cuestionario = (token: string) =>
  api<CuestionarioPublico>(`/publico/encuestas/${token}`, { autenticada: false })

export const enviarRespuestas = (
  token: string,
  respuestas: { idEncuestaPregunta: number; idOpcion?: number; respuesta?: string }[],
) =>
  api<{ recibida: boolean; respuestasGuardadas: number; totalPreguntas: number; completa: boolean }>(
    `/publico/encuestas/${token}/respuestas`,
    { method: 'POST', body: { respuestas }, autenticada: false },
  )

/** Mismo cuestionario que `cuestionario()`, pero validado contra una invitación de un solo uso. */
export const cuestionarioPorInvitacion = (token: string) =>
  api<CuestionarioPublico>(`/publico/invitaciones/${token}`, { autenticada: false })

export const enviarRespuestasInvitacion = (
  token: string,
  respuestas: { idEncuestaPregunta: number; idOpcion?: number; respuesta?: string }[],
) =>
  api<{ recibida: boolean; respuestasGuardadas: number; totalPreguntas: number; completa: boolean }>(
    `/publico/invitaciones/${token}/respuestas`,
    { method: 'POST', body: { respuestas }, autenticada: false },
  )

export const solicitarAcceso = (correoElectronico: string, idUnidadResponsable: number) =>
  api<{ idSolicitudAcceso: number; mensaje: string }>('/publico/solicitudes-acceso', {
    method: 'POST',
    body: { correoElectronico, idUnidadResponsable },
    autenticada: false,
  })

export const listarUnidadesPublicas = () =>
  api<{ idUnidadResponsable: number; unidadResponsable: string }[]>(
    '/publico/unidades-responsables',
    { autenticada: false },
  )
