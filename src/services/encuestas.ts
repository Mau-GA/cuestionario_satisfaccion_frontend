import { http } from './http'

export type EstadoEncuesta = 'borrador' | 'programada' | 'abierta' | 'cerrada'

export type AccionEncuesta = 'editar' | 'cerrar' | 'eliminar'

export const ESTADOS: EstadoEncuesta[] = [
  'borrador',
  'programada',
  'abierta',
  'cerrada',
]

export const ESTADO_LABEL: Record<EstadoEncuesta, string> = {
  borrador: 'Borrador',
  programada: 'Programada',
  abierta: 'Abierta',
  cerrada: 'Cerrada',
}

export interface TipoEncuesta {
  idTipoEncuesta: number
  tipoEncuesta: string
  activo: boolean | number
}

export interface UnidadEncuesta {
  idUnidadResponsable: number
  nombre: string
  activo: boolean | number
}

export interface Encuesta {
  idEncuesta: number
  titulo: string
  tipoEncuesta: TipoEncuesta | null
  unidadResponsable: UnidadEncuesta | null
  fechaInicioVigencia: string | null
  fechaFinVigencia: string | null
  activo: boolean | number
  fechaCreacion: string
  fechaUltimaModificacion: string | null
}

export interface CreateEncuestaDto {
  titulo: string
  idTipoEncuesta: number
  idUnidadResponsable: number
  fechaInicioVigencia?: string | null
  fechaFinVigencia?: string | null
}

export interface UpdateEncuestaDto {
  titulo?: string
  idTipoEncuesta?: number
  idUnidadResponsable?: number
  fechaInicioVigencia?: string | null
  fechaFinVigencia?: string | null
  activo?: boolean
}

function esActivo(valor: boolean | number): boolean {
  return valor === true || valor === 1
}

export function calcularEstado(encuesta: Encuesta): EstadoEncuesta {
  if (!esActivo(encuesta.activo)) return 'cerrada'
  if (!encuesta.fechaInicioVigencia) return 'borrador'

  const ahora = Date.now()
  const inicio = new Date(encuesta.fechaInicioVigencia).getTime()
  if (Number.isNaN(inicio)) return 'borrador'
  if (ahora < inicio) return 'programada'

  if (encuesta.fechaFinVigencia) {
    const fin = new Date(encuesta.fechaFinVigencia).getTime()
    if (!Number.isNaN(fin) && ahora > fin) return 'cerrada'
  }

  return 'abierta'
}

export function accionesPorEstado(estado: EstadoEncuesta): AccionEncuesta[] {
  switch (estado) {
    case 'borrador':
      return ['editar', 'eliminar']
    case 'programada':
      return ['editar', 'cerrar']
    case 'abierta':
      return ['cerrar']
    case 'cerrada':
      return []
  }
}

export function listEncuestas(): Promise<Encuesta[]> {
  return http.request<Encuesta[]>('/encuestas')
}

export function listTiposEncuesta(): Promise<TipoEncuesta[]> {
  return http.request<TipoEncuesta[]>('/tipos-encuesta/activos')
}

export function crearEncuesta(dto: CreateEncuestaDto): Promise<Encuesta> {
  return http.request<Encuesta>('/encuestas', { method: 'POST', body: dto })
}

export function actualizarEncuesta(
  idEncuesta: number,
  dto: UpdateEncuestaDto,
): Promise<Encuesta> {
  return http.request<Encuesta>(`/encuestas/${idEncuesta}`, {
    method: 'PATCH',
    body: dto,
  })
}

export function cerrarEncuesta(idEncuesta: number): Promise<void> {
  return http.request<void>(`/encuestas/${idEncuesta}`, { method: 'DELETE' })
}
