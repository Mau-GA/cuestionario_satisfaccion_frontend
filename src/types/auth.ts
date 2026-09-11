export type Role = 'admin' | 'survey_admin'

export const ROLES: Record<string, Role> = {
  ADMIN: 'admin',
  SURVEY_ADMIN: 'survey_admin',
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Session {
  token: string
  expiresAt: number
  user: User
}