import { http } from './http'
import type { UnidadResponsable, PaginatedResponse } from '../types/admin'

const BASE = '/unidades-responsables'

export async function listUnidades(params: {
  page?: number
  limit?: number
  search?: string
  activo?: boolean
} = {}): Promise<PaginatedResponse<UnidadResponsable>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)
  if (params.activo !== undefined) searchParams.set('activo', String(params.activo))

  return http.request<PaginatedResponse<UnidadResponsable>>(`${BASE}?${searchParams.toString()}`, { method: 'GET' })
}

export async function listUnidadesActivas(): Promise<UnidadResponsable[]> {
  return http.request<UnidadResponsable[]>(`${BASE}/activas`, { method: 'GET' })
}

export async function getUnidad(id: number) {
  return http.request<UnidadResponsable>(`${BASE}/${id}`, { method: 'GET' })
}

export async function createUnidad(data: { nombre: string; activo?: boolean }) {
  return http.request<UnidadResponsable>(BASE, { method: 'POST', body: data })
}

export async function updateUnidad(id: number, data: { nombre?: string; activo?: boolean }) {
  return http.request<UnidadResponsable>(`${BASE}/${id}`, { method: 'PATCH', body: data })
}

export async function deleteUnidad(id: number): Promise<void> {
  await http.request<void>(`${BASE}/${id}`, { method: 'DELETE' })
}

export async function toggleUnidadActive(id: number, activo: boolean) {
  return http.request<UnidadResponsable>(`${BASE}/${id}`, { method: 'PATCH', body: { activo } })
}

export type { UnidadResponsable, PaginatedResponse }