import { http } from './http'
import type { Encuesta } from './encuestas'

export interface ConteoOpcion {
  idOpcion: number | null
  etiqueta: string
  peso: number | string | null
  total: number
}

export interface TextoRespuesta {
  respuesta: string | null
  total: number
}

export interface PreguntaResultado {
  idEncuestaPregunta: number
  pregunta: string
  tipo: string
  totalRespuestas: number
  opciones: ConteoOpcion[]
  textos: TextoRespuesta[]
}

export interface ResultadosEncuesta {
  idEncuesta: number
  titulo: string
  participacion: number
  totalPreguntas: number
  preguntas: PreguntaResultado[]
}

export function obtenerEncuesta(idEncuesta: number): Promise<Encuesta> {
  return http.request<Encuesta>(`/encuestas/${idEncuesta}`)
}

export function obtenerResultados(
  idEncuesta: number,
): Promise<ResultadosEncuesta> {
  return http.request<ResultadosEncuesta>(`/encuestas/${idEncuesta}/resultados`)
}

export function esPreguntaDeOpciones(tipo: string): boolean {
  const normalizado = tipo.trim().toLowerCase()
  return (
    normalizado === 'caritas' ||
    normalizado === 'estrellas' ||
    normalizado === 'barra'
  )
}
