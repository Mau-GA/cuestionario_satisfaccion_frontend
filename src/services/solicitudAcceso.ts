import { http } from './http'
import { type UnidadResponsable } from './unidades'
import type {
  AprobarSolicitudResponse,
  PaginatedResponse,
  SolicitudAcceso,
  SolicitudAccesoParams,
  SolicitudEstado,
} from '../types/admin'

export { type UnidadResponsable }

export async function listUnidadesActivasPublic(): Promise<UnidadResponsable[]> {
  return http.request<UnidadResponsable[]>('/unidades-responsables/activas', {
    auth: false,
  })
}

export async function solicitarAcceso(data: {
  idUnidadResponsable: number
  correoElectronico: string
}): Promise<void> {
  await http.request<void>('/solicitudes-acceso', {
    method: 'POST',
    body: data,
    auth: false,
  })
}

export async function listSolicitudes(
  params: SolicitudAccesoParams = {},
): Promise<PaginatedResponse<SolicitudAcceso>> {
  const query = new URLSearchParams()
  if (params.estado) query.set('estado', params.estado)
  if (params.correo) query.set('correo', params.correo)
  query.set('page', String(params.page ?? 1))
  query.set('limit', String(params.limit ?? 10))
  const qs = query.toString()
  return http.request<PaginatedResponse<SolicitudAcceso>>(
    `/solicitudes-acceso${qs ? `?${qs}` : ''}`,
  )
}

export async function aprobarSolicitud(
  id: number,
): Promise<AprobarSolicitudResponse> {
  return http.request<AprobarSolicitudResponse>(
    `/solicitudes-acceso/${id}/aprobar`,
    { method: 'PATCH' },
  )
}

export async function rechazarSolicitud(
  id: number,
  motivo: string,
): Promise<SolicitudAcceso> {
  return http.request<SolicitudAcceso>(`/solicitudes-acceso/${id}/rechazar`, {
    method: 'PATCH',
    body: { motivo },
  })
}

export type { SolicitudEstado }