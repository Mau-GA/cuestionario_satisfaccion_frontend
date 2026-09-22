import { getSession, hasTokenExpired, logout, refreshSession } from './auth'
import { ApiError, serverMessage } from '../types/api'
import { API_BASE_URL } from './config'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface RequestOptions {
  method?: string
  body?: unknown
}

let refreshing: Promise<boolean> | null = null

function refetchSession(): Promise<boolean> {
  refreshing ??= refreshSession().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'

  let session = getSession()

  if (!session?.token || hasTokenExpired(session)) {
    const refreshed = await refetchSession()
    if (!refreshed) {
      logout()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      throw new ApiError('La sesión ha expirado. Vuelve a iniciar sesión.', 401)
    }
    session = getSession()
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.token}`,
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  let body = await readBody(response)

  if (response.status === 401 && session?.refreshToken) {
    const refreshed = await refetchSession()
    if (!refreshed) {
      logout()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      throw new ApiError(serverMessage(body), 401)
    }
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getSession()?.token}`,
        },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
      })
    } catch {
      throw new ApiError('No se pudo conectar con el servidor', 0)
    }
    body = await readBody(response)
  }

  if (response.status === 401) {
    logout()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    throw new ApiError(serverMessage(body), 401)
  }

  if (!response.ok) {
    throw new ApiError(serverMessage(body), response.status)
  }

  return body as T
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

export const http = { request }