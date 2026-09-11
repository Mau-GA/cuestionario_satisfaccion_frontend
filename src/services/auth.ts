import type { Role, Session, User } from '../types/auth'
import { ROLES } from '../types/auth'

const SESSION_KEY = 'cuestionario.sesion'
const SESSION_TTL_MS = 60_000

const USERS: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@example.com',
    role: ROLES.ADMIN,
  },
  {
    id: '2',
    name: 'Administrador de encuestas',
    email: 'encuestas@example.com',
    role: ROLES.SURVEY_ADMIN,
  },
]

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function hasTokenExpired(session: Session): boolean {
  return Date.now() > session.expiresAt
}

export function expireSession(): void {
  const session = getSession()
  if (!session) return
  const expired: Session = { ...session, expiresAt: Date.now() - 1 }
  localStorage.setItem(SESSION_KEY, JSON.stringify(expired))
}

export function hasRole(...roles: Role[]): boolean {
  const session = getSession()
  return session !== null && roles.includes(session.user.role)
}

export function login(email: string, password: string): Session {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )

  if (!user) {
    throw new Error('Credenciales incorrectas')
  }

  const normalizedPassword = `${user.role}-1234`
  if (password !== normalizedPassword) {
    throw new Error('Credenciales incorrectas')
  }

  const session: Session = {
    token: `token-${user.id}-${Date.now()}`,
    expiresAt: Date.now() + SESSION_TTL_MS,
    user,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}