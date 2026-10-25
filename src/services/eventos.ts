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

/** Compara nombres de evento como los compara una persona: sin acentos ni mayusculas. */
export function mismoNombre(a: string, b: string): boolean {
  const normaliza = (texto: string) =>
    texto
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
  return normaliza(a) === normaliza(b)
}
