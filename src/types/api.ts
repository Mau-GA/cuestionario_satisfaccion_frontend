export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function serverMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
    if (Array.isArray(message) && message.length > 0) {
      return message.join(' · ')
    }
  }
  return 'Error del servidor'
}