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
