import { http } from './http'
import type { UnidadResponsable, PaginatedResponse } from '../types/admin'

const BASE = '/unidades-responsables'

export async function listUnidades(params: {
  page?: number
  limit?: number
  search?: string
  activo?: boolean
} = {}): Promise<PaginatedResponse<UnidadResponsable>> {
  // Backend devuelve array directo CA_UnidadesResponsables[] sin filtros ni
  // paginación, y activo como tinyint (1/0): todo eso se resuelve en frontend
  const respuesta = await http.request<(Omit<UnidadResponsable, 'activo'> & { activo: boolean | number })[]>(
    BASE,
    { method: 'GET' },
  )
  const termino = params.search?.trim().toLowerCase()
  const todas = respuesta
    .map(u => ({ ...u, activo: u.activo === true || u.activo === 1 }))
    .filter(u => !termino || u.nombre.toLowerCase().includes(termino))
    .filter(u => params.activo === undefined || u.activo === params.activo)

  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const start = (page - 1) * limit

  return {
    data: todas.slice(start, start + limit),
    total: todas.length,
    page,
    limit,
    totalPages: Math.ceil(todas.length / limit),
  }
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