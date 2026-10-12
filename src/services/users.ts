import { http } from './http'
import type { User, PaginatedResponse, UserListParams, CreateUserData, UpdateUserData } from '../types/admin'

const BASE = '/usuarios'

export async function listUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)
  if (params.activo !== undefined) searchParams.set('activo', String(params.activo))
  if (params.idUnidadResponsable) searchParams.set('idUnidadResponsable', String(params.idUnidadResponsable))
  if (params.idRol) searchParams.set('idRol', String(params.idRol))

  return http.request<PaginatedResponse<User>>(`${BASE}?${searchParams.toString()}`, { method: 'GET' })
}

export async function getUser(id: number): Promise<User> {
  return http.request<User>(`${BASE}/${id}`, { method: 'GET' })
}

export async function createUser(data: CreateUserData): Promise<User> {
  return http.request<User>(BASE, { method: 'POST', body: data })
}

export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  return http.request<User>(`${BASE}/${id}`, { method: 'PATCH', body: data })
}

export async function deleteUser(id: number): Promise<void> {
  await http.request<void>(`${BASE}/${id}`, { method: 'DELETE' })
}

export async function toggleUserActive(id: number, activo: boolean): Promise<User> {
  return http.request<User>(`${BASE}/${id}`, { method: 'PATCH', body: { activo } })
}

export type { User, PaginatedResponse, UserListParams, CreateUserData, UpdateUserData }