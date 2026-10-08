export type Role = 'administrador' | 'administrador de encuestas'

export const ROLES: Record<string, Role> = {
  ADMIN: 'administrador',
  SURVEY_ADMIN: 'administrador de encuestas',
}

export interface User {
  idusuario: number
  correoElectronico: string
  activo: boolean
  idUnidadResponsable: number | null
  idRol: number | null
  rol: Role | null
}

export interface Session {
  token: string
  refreshToken: string
  expiresAt: number
  user: User
}