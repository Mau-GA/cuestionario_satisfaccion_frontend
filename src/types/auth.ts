/**
 * Códigos de rol. Son los mismos que emite el API en `CA_Roles.Codigo`
 * y son inmutables: el nombre visible del rol puede cambiar sin tocar esto.
 */
export const ROL = {
  ADMINISTRADOR: 'administrador',
  ADMINISTRADOR_ENCUESTAS: 'administrador_encuestas',
} as const

export type CodigoRol = (typeof ROL)[keyof typeof ROL]

export interface Usuario {
  idUsuario: number
  correoElectronico: string
  activo: boolean
  idUnidadResponsable: number | null
  /** Código del rol: contra esto se deciden permisos. */
  rol: CodigoRol | null
  /** Nombre visible del rol: solo para mostrar. */
  rolNombre: string | null
  /** Falso en una cuenta que solo ha entrado con Google. */
  tieneContrasena: boolean
}

export interface Sesion {
  accessToken: string
  refreshToken: string
  usuario: Usuario
}
