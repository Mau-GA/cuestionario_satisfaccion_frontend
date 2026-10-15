import { http } from './http'
import type {
  User,
  PaginatedResponse,
  UserListParams,
  CreateUserData,
  UpdateUserData,
} from '../types/admin'

const BASE = '/usuarios'

// Forma real de TB_Usuario en el backend: el id va en minúscula (idusuario),
// la contraseña nunca viaja (@Exclude) y el rol llega anidado, sin idRol plano.
// La unidad solo llega como idUnidadResponsable, sin la relación.
// activo es un tinyint y puede llegar como 1/0.
interface BackendUser {
  idusuario: number
  correoElectronico: string
  activo: boolean | number
  fechaCreacion: string
  fechaUltimaModificacion: string | null
  idUnidadResponsable: number | null
  rol?: { idRol: number; rol: string; activo: boolean | number; fechaCreacion: string } | null
}

function esActivo(valor: boolean | number): boolean {
  return valor === true || valor === 1
}

function toRole(bu: BackendUser['rol']): User['rol'] {
  if (!bu) return undefined
  return {
    idRol: bu.idRol,
    rol: bu.rol,
    activo: esActivo(bu.activo),
    fechaCreacion: bu.fechaCreacion,
  }
}

function toUser(bu: BackendUser): User {
  return {
    idUsuario: bu.idusuario,
    correoElectronico: bu.correoElectronico,
    activo: esActivo(bu.activo),
    fechaCreacion: bu.fechaCreacion,
    fechaUltimaModificacion: bu.fechaUltimaModificacion,
    idUnidadResponsable: bu.idUnidadResponsable,
    idRol: bu.rol?.idRol ?? null,
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

  // Backend devuelve array directo TB_Usuario[] e ignora los filtros, así que
  // la búsqueda y la paginación se hacen en frontend
  const respuesta = await http.request<BackendUser[]>(`${BASE}?${searchParams.toString()}`, { method: 'GET' })
  const termino = params.search?.trim().toLowerCase()
  const allUsers = termino
    ? respuesta.filter(u => u.correoElectronico.toLowerCase().includes(termino))
    : respuesta

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

export async function createUser(data: CreateUserData): Promise<User> {
  const bu = await http.request<BackendUser>(BASE, { method: 'POST', body: data })
  return toUser(bu)
}

export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
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