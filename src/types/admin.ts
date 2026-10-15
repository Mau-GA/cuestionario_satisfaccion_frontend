export interface User {
  idUsuario: number;
  correoElectronico: string;
  activo: boolean;
  fechaCreacion: string;
  fechaUltimaModificacion: string | null;
  idUnidadResponsable: number | null;
  idRol: number | null;
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

// Los nombres son los de CreateUserDto/UpdateUserDto del backend, que valida con
// forbidNonWhitelisted: cualquier otro nombre responde 400. La contraseña lleva ñ.
export interface CreateUserData {
  correoElectronico: string;
  contraseña: string;
  activo?: boolean;
  idUnidadResponsable?: number;
  idRol?: number;
}

export interface UpdateUserData {
  correoElectronico?: string;
  contraseña?: string;
  activo?: boolean;
  idUnidadResponsable?: number;
  idRol?: number;
}

export interface CreateUnidadData {
  nombre: string;
  activo?: boolean;
}

export interface UpdateUnidadData {
  nombre?: string;
  activo?: boolean;
}