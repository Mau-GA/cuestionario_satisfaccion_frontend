import { http } from './http'
import type { User, PaginatedResponse, UserListParams } from '../types/admin'

const BASE = '/usuarios'

interface BackendUser {
  idUsuario: number
  correoElectronico: string
  contrasena: string | null
  activo: boolean
  fechaCreacion: string
  fechaUltimaModificacion: string | null
  idUnidadResponsable: number | null
  idRol: number | null
  unidadResponsable?: { idUnidadResponsable: number; nombre: string }
  rol?: { idRol: number; rol: string }
}

interface CreateUserPayload {
  correoElectronico: string
  contrasena: string
  activo?: boolean
  idUnidadResponsable?: number
  idRel?: number
  idrel?: number
}

interface UpdateUserPayload {
  correoElectronico?: string
  contrasena?: string
  activo?: boolean
  idUnidadResponsable?: number
  idRel?: number
  idrel?: number
}

function toUnidadResponsable(bu: BackendUser['unidadResponsable']): User['unidadResponsable'] {
  if (!bu) return undefined
  return {
    idUnidadResponsable: bu.idUnidadResponsable,
    nombre: bu.nombre,
    activo: true,
    fechaCreacion: new Date().toISOString(),
  }
}

function toRole(bu: BackendUser['rol']): User['rol'] {
  if (!bu) return undefined
  return {
    idRol: bu.idRol,
    rol: bu.rol,
    activo: true,
    fechaCreacion: new Date().toISOString(),
  }
}

function toUser(bu: BackendUser): User {
  return {
    idUsuario: bu.idUsuario,
    correoElectronico: bu.correoElectronico,
    contrasena: bu.contrasena,
    activo: bu.activo,
    fechaCreacion: bu.fechaCreacion,
    fechaUltimaModificacion: bu.fechaUltimaModificacion,
    idUnidadResponsable: bu.idUnidadResponsable,
    idRol: bu.idRol,
    unidadResponsable: toUnidadResponsable(bu.unidadResponsable),
    rol: toRole(bu.rol),
  }
}

export async function listUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)
  if (params.activo !== undefined) searchParams.set('activo', String(params.activo))
  if (params.idUnidadResponsable) searchParams.set('idUnidadResponsable', String(params.idUnidadResponsable))
  if (params.idRol) searchParams.set('idRol', String(params.idRol))

  // Backend devuelve array directo TB_Usuario[], hacemos paginación en frontend
  const allUsers = await http.request<BackendUser[]>(`${BASE}?${searchParams.toString()}`, { method: 'GET' })

  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = allUsers.slice(start, end).map(toUser)

  return {
    data: paginatedData,
    total: allUsers.length,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages: Math.ceil(allUsers.length / limit)
  }
}

export async function getUser(id: number): Promise<User> {
  const bu = await http.request<BackendUser>(`${BASE}/${id}`, { method: 'GET' })
  return toUser(bu)
}

export async function createUser(data: CreateUserPayload): Promise<User> {
  const bu = await http.request<BackendUser>(BASE, { method: 'POST', body: data })
  return toUser(bu)
}

export async function updateUser(id: number, data: UpdateUserPayload): Promise<User> {
  const bu = await http.request<BackendUser>(`${BASE}/${id}`, { method: 'PATCH', body: data })
  return toUser(bu)
}

export async function deleteUser(id: number): Promise<void> {
  await http.request<void>(`${BASE}/${id}`, { method: 'DELETE' })
}

export async function toggleUserActive(id: number, activo: boolean): Promise<User> {
  const bu = await http.request<BackendUser>(`${BASE}/${id}`, { method: 'PATCH', body: { activo } })
  return toUser(bu)
}