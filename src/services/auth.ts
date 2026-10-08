import type { Role, Session, User } from '../types/auth'
import { ApiError, serverMessage } from '../types/api'
import { API_BASE_URL } from './config'

const SESSION_KEY = 'cuestionario.sesion'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  usuario: User
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export async function login(
  correoElectronico: string,
  contraseña: string,
): Promise<Session> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correoElectronico, contraseña }),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  const body = await readBody(response)

  if (!response.ok) {
    throw new ApiError(serverMessage(body), response.status)
  }

  const data = body as unknown as LoginResponse
  const session: Session = {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: tokenExpiry(data.accessToken),
    user: data.usuario,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function refreshSession(): Promise<boolean> {
  const session = getSession()
  if (!session?.refreshToken) return false

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
  } catch {
    return false
  }

  const body = await readBody(response)
  if (!response.ok) return false

  const data = body as unknown as RefreshResponse
  const updated: Session = {
    ...session,
    token: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: tokenExpiry(data.accessToken),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  return true
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

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

export function hasRole(...roles: Role[]): boolean {
  const session = getSession()
  return (
    session !== null &&
    session.user.rol !== null &&
    roles.includes(session.user.rol)
  )
}

export function hasTokenExpired(session: Session): boolean {
  return Date.now() > session.expiresAt
}

export function expireSession(): void {
  const session = getSession()
  if (!session) return
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...session, expiresAt: Date.now() - 1 }),
  )
}

function tokenExpiry(token: string): number {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )
    return typeof json.exp === 'number' ? json.exp * 1000 : Date.now() + 3_600_000
  } catch {
    return Date.now() + 3_600_000
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}