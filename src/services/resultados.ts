import { http } from './http'
import type { Encuesta } from './encuestas'

/**
 * Las formas de este archivo son las que devuelve el API (BE-33 y BE-34), no
 * una conveniencia del front: el backend ya ordena la distribucion por peso y
 * ya calcula porcentaje y promedio, asi que aqui no se recalcula nada.
 */

export interface OpcionResultado {
  idOpcion: number
  opcion: string
  peso: number | null
  veces: number
  porcentaje: number
}

export interface PreguntaResultado {
  idEncuestaPregunta: number
  pregunta: string
  tipoRespuesta: string
  orden: number
  respuestas: number
  esTextoLibre: boolean
  distribucion: OpcionResultado[]
  promedio: number | null
}

export interface Participacion {
  envios: number
  completos: number
  incompletos: number
  totalPreguntas: number
}

export interface ResultadosEncuesta {
  encuesta: {
    idEncuesta: number
    titulo: string
    fechaInicioVigencia: string | null
    fechaFinVigencia: string | null
  }
  participacion: Participacion
  preguntas: PreguntaResultado[]
}

/** Un comentario de texto libre. El API nunca manda con que envio se relaciona. */
export interface Comentario {
  idEncuestaRespondida: number
  respuesta: string
  fechaCreacion: string
}

export interface ComentariosPaginados {
  pregunta: { idEncuestaPregunta: number; pregunta: string }
  data: Comentario[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const COMENTARIOS_POR_PAGINA = 10

export function obtenerEncuesta(idEncuesta: number): Promise<Encuesta> {
  return http.request<Encuesta>(`/encuestas/${idEncuesta}`)
}

export function obtenerResultados(
  idEncuesta: number,
): Promise<ResultadosEncuesta> {
  return http.request<ResultadosEncuesta>(`/encuestas/${idEncuesta}/resultados`)
}

/**
 * Los comentarios no vienen en el payload de resultados: son su propio endpoint
 * paginado, porque una encuesta con muchos envios puede traer miles.
 */
export function obtenerComentarios(
  idEncuesta: number,
  idEncuestaPregunta: number,
  page = 1,
  limit = COMENTARIOS_POR_PAGINA,
): Promise<ComentariosPaginados> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return http.request<ComentariosPaginados>(
    `/encuestas/${idEncuesta}/preguntas/${idEncuestaPregunta}/comentarios?${query}`,
  )
}
