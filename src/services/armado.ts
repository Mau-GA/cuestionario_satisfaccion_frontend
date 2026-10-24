import { http } from './http'
import type { Opcion } from '../types/catalogos'
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

// Opciones por pregunta (BE-23): solo se asocia/quita el id del catálogo de
// opciones; el backend valida tipo cerrado y responde 409 si ya tiene
// respuestas. Cada llamada devuelve la lista completa resultante.

export function listarOpcionesEncuesta(
  idEncuesta: number,
  idEncuestaPregunta: number,
): Promise<Opcion[]> {
  return http.request<Opcion[]>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}/opciones`,
  )
}

export function agregarOpcionEncuesta(
  idEncuesta: number,
  idEncuestaPregunta: number,
  idOpcion: number,
): Promise<Opcion[]> {
  return http.request<Opcion[]>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}/opciones`,
    { method: 'POST', body: { idOpcion } },
  )
}

export function quitarOpcionEncuesta(
  idEncuesta: number,
  idEncuestaPregunta: number,
  idOpcion: number,
): Promise<Opcion[]> {
  return http.request<Opcion[]>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}/opciones/${idOpcion}`,
    { method: 'DELETE' },
  )
}

// Cambiar el tipo de respuesta de una pregunta ya agregada (BE-23);
// devuelve la fila con el tipo actualizado para refrescar la lista.
export function cambiarTipoRespuestaEncuesta(
  idEncuesta: number,
  idEncuestaPregunta: number,
  idTipoRespuesta: number,
): Promise<PreguntaEncuesta> {
  return http.request<PreguntaEncuesta>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}`,
    { method: 'PATCH', body: { idTipoRespuesta } },
  )
}
