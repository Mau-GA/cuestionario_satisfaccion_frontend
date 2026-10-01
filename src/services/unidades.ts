import { http } from './http'

export interface UnidadResponsable {
  idUnidadResponsable: number
  nombre: string
  activo: boolean
}

export function listUnidadesActivas(): Promise<UnidadResponsable[]> {
  return http.request<UnidadResponsable[]>('/unidades-responsables/activas')
}