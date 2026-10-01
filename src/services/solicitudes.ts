import { publicHttp } from './publicHttp'
import type { UnidadResponsable, SolicitudAccesoRequest } from '../types/solicitudes'

export async function fetchUnidadesActivas(): Promise<UnidadResponsable[]> {
  return publicHttp.request<UnidadResponsable[]>('/unidades-responsables/activas', { method: 'GET' })
}

export async function solicitarAcceso(data: SolicitudAccesoRequest): Promise<void> {
  await publicHttp.request<void>('/solicitudes-acceso', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}