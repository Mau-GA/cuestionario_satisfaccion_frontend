import { http } from './http'
import type {
  CreateOpcionData,
  CreatePreguntaData,
  CreateTipoEncuestaData,
  CreateTipoRespuestaData,
  ItemCatalogo,
  Opcion,
  Pregunta,
  TipoEncuesta,
  TipoRespuesta,
  UpdateOpcionData,
  UpdatePreguntaData,
  UpdateTipoEncuestaData,
  UpdateTipoRespuestaData,
} from '../types/catalogos'

// Endpoints del BE-19; todos requieren rol administrador.
// Editar pregunta/opción puede devolver un id distinto (renglón nuevo): 201.

export function listPreguntas(): Promise<Pregunta[]> {
  return http.request<Pregunta[]>('/preguntas')
}

export function listPreguntasActivas(): Promise<Pregunta[]> {
  return http.request<Pregunta[]>('/preguntas/activas')
}

export function createPregunta(data: CreatePreguntaData): Promise<Pregunta> {
  return http.request<Pregunta>('/preguntas', { method: 'POST', body: data })
}

export function updatePregunta(id: number, data: UpdatePreguntaData): Promise<Pregunta> {
  return http.request<Pregunta>(`/preguntas/${id}`, { method: 'PATCH', body: data })
}

export function desactivarPregunta(id: number): Promise<Pregunta> {
  return http.request<Pregunta>(`/preguntas/${id}`, { method: 'DELETE' })
}

export function listOpciones(): Promise<Opcion[]> {
  return http.request<Opcion[]>('/opciones')
}

export function createOpcion(data: CreateOpcionData): Promise<Opcion> {
  return http.request<Opcion>('/opciones', { method: 'POST', body: data })
}

export function updateOpcion(id: number, data: UpdateOpcionData): Promise<Opcion> {
  return http.request<Opcion>(`/opciones/${id}`, { method: 'PATCH', body: data })
}

export function desactivarOpcion(id: number): Promise<Opcion> {
  return http.request<Opcion>(`/opciones/${id}`, { method: 'DELETE' })
}

export function listTiposEncuesta(): Promise<TipoEncuesta[]> {
  return http.request<TipoEncuesta[]>('/tipos-encuesta')
}

export function createTipoEncuesta(data: CreateTipoEncuestaData): Promise<TipoEncuesta> {
  return http.request<TipoEncuesta>('/tipos-encuesta', { method: 'POST', body: data })
}

export function updateTipoEncuesta(id: number, data: UpdateTipoEncuestaData): Promise<TipoEncuesta> {
  return http.request<TipoEncuesta>(`/tipos-encuesta/${id}`, { method: 'PATCH', body: data })
}

export function desactivarTipoEncuesta(id: number): Promise<TipoEncuesta> {
  return http.request<TipoEncuesta>(`/tipos-encuesta/${id}`, { method: 'DELETE' })
}

export function listTiposRespuesta(): Promise<TipoRespuesta[]> {
  return http.request<TipoRespuesta[]>('/tipos-respuesta')
}

export function listTiposRespuestaActivos(): Promise<TipoRespuesta[]> {
  return http.request<TipoRespuesta[]>('/tipos-respuesta/activos')
}

export function createTipoRespuesta(data: CreateTipoRespuestaData): Promise<TipoRespuesta> {
  return http.request<TipoRespuesta>('/tipos-respuesta', { method: 'POST', body: data })
}

export function updateTipoRespuesta(id: number, data: UpdateTipoRespuestaData): Promise<TipoRespuesta> {
  return http.request<TipoRespuesta>(`/tipos-respuesta/${id}`, { method: 'PATCH', body: data })
}

export function desactivarTipoRespuesta(id: number): Promise<TipoRespuesta> {
  return http.request<TipoRespuesta>(`/tipos-respuesta/${id}`, { method: 'DELETE' })
}

// Helpers genéricos que usa CatalogosPage para no repetir lógica por catálogo.

export type ClaveCatalogo = 'preguntas' | 'opciones' | 'tipos-encuesta' | 'tipos-respuesta'

export async function listarCatalogo(clave: ClaveCatalogo): Promise<ItemCatalogo[]> {
  switch (clave) {
    case 'preguntas':
      return listPreguntas()
    case 'opciones':
      return listOpciones()
    case 'tipos-encuesta':
      return listTiposEncuesta()
    case 'tipos-respuesta':
      return listTiposRespuesta()
  }
}

export async function crearItemCatalogo(
  clave: ClaveCatalogo,
  data: Record<string, unknown>,
): Promise<ItemCatalogo> {
  switch (clave) {
    case 'preguntas':
      return createPregunta(data as unknown as CreatePreguntaData)
    case 'opciones':
      return createOpcion(data as unknown as CreateOpcionData)
    case 'tipos-encuesta':
      return createTipoEncuesta(data as unknown as CreateTipoEncuestaData)
    case 'tipos-respuesta':
      return createTipoRespuesta(data as unknown as CreateTipoRespuestaData)
  }
}

export async function actualizarItemCatalogo(
  clave: ClaveCatalogo,
  id: number,
  data: Record<string, unknown>,
): Promise<ItemCatalogo> {
  switch (clave) {
    case 'preguntas':
      return updatePregunta(id, data as unknown as UpdatePreguntaData)
    case 'opciones':
      return updateOpcion(id, data as unknown as UpdateOpcionData)
    case 'tipos-encuesta':
      return updateTipoEncuesta(id, data as unknown as UpdateTipoEncuestaData)
    case 'tipos-respuesta':
      return updateTipoRespuesta(id, data as unknown as UpdateTipoRespuestaData)
  }
}

export async function desactivarItemCatalogo(clave: ClaveCatalogo, id: number): Promise<ItemCatalogo> {
  switch (clave) {
    case 'preguntas':
      return desactivarPregunta(id)
    case 'opciones':
      return desactivarOpcion(id)
    case 'tipos-encuesta':
      return desactivarTipoEncuesta(id)
    case 'tipos-respuesta':
      return desactivarTipoRespuesta(id)
  }
}
