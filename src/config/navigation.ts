import { ROLES, type Role } from '../types/auth'

export interface MenuItem {
  to: string
  label: string
}

const INICIO: MenuItem = { to: '/', label: 'Inicio' }

const MENU_ADMIN: MenuItem[] = [
  INICIO,
  { to: '/dashboard', label: 'Panel de encuestas' },
  { to: '/admin', label: 'Administración' },
]

const MENU_SURVEY_ADMIN: MenuItem[] = [
  INICIO,
  { to: '/dashboard', label: 'Panel de encuestas' },
]

export function menuPorRol(rol: Role | null | undefined): MenuItem[] {
  switch (rol) {
    case ROLES.ADMIN:
      return MENU_ADMIN
    case ROLES.SURVEY_ADMIN:
      return MENU_SURVEY_ADMIN
    default:
      return []
  }
}