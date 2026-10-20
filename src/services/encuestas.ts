import { http } from './http'

export type EstadoEncuesta = 'borrador' | 'programada' | 'abierta' | 'cerrada'

export type AccionEncuesta =
  'ver' | 'editar' | 'duplicar' | 'publicar' | 'cerrar' | 'eliminar'

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
  visibleEnInicio: boolean | number
  tokenPublico: string | null
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

export function esActivo(valor: boolean | number): boolean {
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

export function accionesPorEstado(
  estado: EstadoEncuesta,
  tieneEnlace = true,
): AccionEncuesta[] {
  switch (estado) {
    case 'borrador':
      return ['editar', 'duplicar', 'publicar', 'eliminar']
    case 'programada':
      return ['editar', 'duplicar', 'publicar', 'cerrar']
    case 'abierta':
      return tieneEnlace
        ? ['ver', 'duplicar', 'cerrar']
        : ['ver', 'duplicar', 'publicar', 'cerrar']
    case 'cerrada':
      return ['ver', 'duplicar']
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

// Cierra de verdad: adelanta el fin de la vigencia a este momento (BE-26).
// No toca `activo` ni borra la encuesta, al contrario de eliminarEncuesta().
export function cerrarEncuesta(idEncuesta: number): Promise<Encuesta> {
  return http.request<Encuesta>(`/encuestas/${idEncuesta}/cerrar`, {
    method: 'POST',
  })
}

// Baja logica: solo apaga `activo`, sin tocar la vigencia. Es para un
// borrador que nunca se publico; una encuesta ya abierta se cierra con
// cerrarEncuesta(), no se elimina.
export function eliminarEncuesta(idEncuesta: number): Promise<void> {
  return http.request<void>(`/encuestas/${idEncuesta}`, { method: 'DELETE' })
}

export function publicarEncuesta(
  idEncuesta: number,
  visibleEnInicio: boolean,
): Promise<Encuesta> {
  return http.request<Encuesta>(`/encuestas/${idEncuesta}/publicar`, {
    method: 'POST',
    body: { visibleEnInicio },
  })
}
