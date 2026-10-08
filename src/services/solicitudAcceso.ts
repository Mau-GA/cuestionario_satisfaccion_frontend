import { http } from './http'
import { type UnidadResponsable } from './unidades'

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