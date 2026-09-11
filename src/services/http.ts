import { getSession, hasTokenExpired, logout } from './auth'

const NETWORK_DELAY_MS = 250

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface ServerResponse {
  ok: boolean
  status: number
  body: unknown
}

const MOCK_SURVEYS = [
  { id: 1, title: 'Encuesta de clima laboral', responses: 42 },
  { id: 2, title: 'Satisfacción del cliente', responses: 17 },
]

function mockServer(
  path: string,
  method: string,
): Promise<ServerResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = getSession()

      if (!session?.token || hasTokenExpired(session)) {
        resolve({
          ok: false,
          status: 401,
          body: { message: 'La sesión ha expirado. Vuelve a iniciar sesión.' },
        })
        return
      }

      if (path === '/surveys' && method === 'GET') {
        resolve({ ok: true, status: 200, body: MOCK_SURVEYS })
        return
      }

      resolve({ ok: false, status: 404, body: { message: 'No encontrado' } })
    }, NETWORK_DELAY_MS)
  })
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const session = getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  const response = await mockServer(path, method)

  if (response.status === 401) {
    logout()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    const message = getServerMessage(response.body)
    throw new ApiError(message, 401)
  }

  if (!response.ok) {
    throw new ApiError(getServerMessage(response.body), response.status)
  }

  return response.body as T
}

function getServerMessage(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
  ) {
    return (body as { message: string }).message
  }
  return 'Error del servidor'
}

export const http = { request }