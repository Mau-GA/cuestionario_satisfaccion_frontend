export interface User {
  idUsuario: number;
  correoElectronico: string;
  contrasena?: string | null;
  activo: boolean;
  fechaCreacion: string;
  fechaUltimaModificacion: string | null;
  idUnidadResponsable: number | null;
  idRol: number | null;
  unidadResponsable?: UnidadResponsable;
  rol?: Role;
}

export interface Role {
  idRol: number;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UnidadResponsable {
  idUnidadResponsable: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  idUnidadResponsable?: number;
  idRol?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  correoElectronico: string;
  contrasena: string;
  activo?: boolean;
  idUnidadResponsable?: number;
  idRel?: number;
  idrel?: number;
}

export interface UpdateUserData {
  correoElectronico?: string;
  contrasena?: string;
  activo?: boolean;
  idUnidadResponsable?: number;
  idRel?: number;
  idrel?: number;
}

export interface CreateUnidadData {
  nombre: string;
  activo?: boolean;
}

export interface UpdateUnidadData {
  nombre?: string;
  activo?: boolean;
}