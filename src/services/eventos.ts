import { http } from './http'
import type { UnidadResponsable } from './unidades'

/**
 * Eventos que agrupan encuestas (BE-38 / BE-39). GET /eventos devuelve los de
 * la unidad de quien consulta, o todos si es administrador general, asi que
 * quien pinte un selector por unidad tiene que filtrar con `deLaUnidad`.
 */
export interface Evento {
  idEvento: number
  nombre: string
  unidadResponsable: UnidadResponsable | null
  fechaInicioVigencia: string | null
  fechaFinVigencia: string | null
  activo: boolean | number
  fechaCreacion: string
}

export interface CreateEventoDto {
  nombre: string
  idUnidadResponsable: number
  fechaInicioVigencia?: string | null
  fechaFinVigencia?: string | null
}

export function listarEventos(): Promise<Evento[]> {
  return http.request<Evento[]>('/eventos')
}

export function crearEvento(dto: CreateEventoDto): Promise<Evento> {
  return http.request<Evento>('/eventos', { method: 'POST', body: dto })
}

export function deLaUnidad(
  eventos: Evento[],
  idUnidadResponsable: number | null,
): Evento[] {
  if (idUnidadResponsable === null) return []
  return eventos.filter(
    (evento) =>
      evento.unidadResponsable?.idUnidadResponsable === idUnidadResponsable,
  )
}

function normalizaNombre(texto: string): string {
  return texto
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Compara nombres de evento como los compara una persona: sin acentos ni mayusculas. */
export function mismoNombre(a: string, b: string): boolean {
  return normalizaNombre(a) === normalizaNombre(b)
}

/**
 * Si el nombre contiene todas las palabras buscadas, en cualquier orden y
 * posición: «muertos feria» encuentra «Feria de Día de Muertos 2026».
 */
export function coincideNombre(nombre: string, busqueda: string): boolean {
  const nombreNormal = normalizaNombre(nombre)
  return normalizaNombre(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((palabra) => nombreNormal.includes(palabra))
}

/** Los eventos dados de alta más recientemente primero. */
export function porRecientes(eventos: Evento[]): Evento[] {
  return [...eventos].sort(
    (a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
  )
}
