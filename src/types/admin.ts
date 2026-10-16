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

export type SolicitudEstado = 'pendiente' | 'aprobada' | 'rechazada';

// El backend calcula `estado` desde `autorizada` (null -> pendiente,
// true -> aprobada, false -> rechazada). usuarioRevision trae solo
// idusuario y correoElectronico (addSelect del servicio).
export interface SolicitudAcceso {
  idSolicitudAcceso: number;
  correoElectronico: string;
  autorizada: boolean | null;
  estado: SolicitudEstado;
  motivosRechazo: string | null;
  fechaSolicitud: string;
  fechaRevision: string | null;
  usuarioRevision: {
    idusuario: number;
    correoElectronico: string;
  } | null;
  unidad: UnidadResponsable | null;
}

// Nombres exactos de FiltroSolicitudesDto del backend
// (forbidNonWhitelisted: cualquier otro nombre responde 400).
export interface SolicitudAccesoParams {
  estado?: SolicitudEstado;
  correo?: string;
  page?: number;
  limit?: number;
}

export interface AprobarSolicitudResponse {
  mensaje: string;
  solicitud: {
    idSolicitudAcceso: number;
    estado: SolicitudEstado;
    fechaRevision: string | null;
  };
  usuario: {
    idusuario: number;
    correoElectronico: string;
    activo: boolean;
    idUnidadResponsable: number;
    rol: string;
  };
}

export interface CreateUnidadData {
  nombre: string;
  activo?: boolean;
}

export interface UpdateUnidadData {
  nombre?: string;
  activo?: boolean;
}