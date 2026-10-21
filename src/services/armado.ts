import { http } from './http'
import type { Pregunta, TipoRespuesta } from '../types/catalogos'

// Contrato del armado de encuestas (BE-22). Editable solo en borrador o
// programada; el backend lo revalida y responde 409/400 en consecuencia.
// El orden viaja con los ids de las filas (idEncuestaPregunta) completos,
// sin faltantes ni repetidos; típico 400 si llega incompleto.

export interface PreguntaEncuesta {
  idEncuestaPregunta: number
  orden: number
  activo: boolean | number
  pregunta: Pregunta
  tipoRespuesta: TipoRespuesta
}

export interface AddPreguntaEncuestaDto {
  idPregunta: number
  idTipoRespuesta: number
  orden?: number
}

export function listarPreguntasEncuesta(
  idEncuesta: number,
): Promise<PreguntaEncuesta[]> {
  return http.request<PreguntaEncuesta[]>(`/encuestas/${idEncuesta}/preguntas`)
}

export function agregarPreguntaEncuesta(
  idEncuesta: number,
  dto: AddPreguntaEncuestaDto,
): Promise<PreguntaEncuesta> {
  return http.request<PreguntaEncuesta>(`/encuestas/${idEncuesta}/preguntas`, {
    method: 'POST',
    body: dto,
  })
}

// Devuelve la lista completa reordenada; se usa como nuevo estado.
export function reordenarPreguntasEncuesta(
  idEncuesta: number,
  orden: number[],
): Promise<PreguntaEncuesta[]> {
  return http.request<PreguntaEncuesta[]>(
    `/encuestas/${idEncuesta}/preguntas/orden`,
    { method: 'PUT', body: { orden } },
  )
}

export function quitarPreguntaEncuesta(
  idEncuesta: number,
  idEncuestaPregunta: number,
): Promise<PreguntaEncuesta> {
  return http.request<PreguntaEncuesta>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}`,
    { method: 'DELETE' },
  )
}
