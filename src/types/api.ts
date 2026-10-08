export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function serverMessage(body: unknown): string {
  let message: unknown = null
  if (typeof body === 'object' && body !== null && 'message' in body) {
    message = (body as { message: unknown }).message
  }
  if (typeof message === 'string' && message.length > 0) {
    const sanitized = message.trim()
    if (/^Cannot\s+(GET|POST|PUT|PATCH|DELETE)/.test(sanitized)) {
      return 'La ruta solicitada no existe en el servidor'
    }
    return sanitized
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.join(' · ')
  }
  return 'Ocurrió un error al contactar el servidor'
}