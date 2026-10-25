export class ApiError extends Error {
  status: number
  /**
   * Discriminante que algunos endpoints mandan en el cuerpo para decir por que
   * fallaron, cuando el status por si solo no alcanza. Lo usa la pantalla
   * publica de responder para distinguir enlace invalido, encuesta sin iniciar
   * y encuesta cerrada.
   */
  motivo: string | null

  constructor(message: string, status: number, motivo: string | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.motivo = motivo
  }
}

/** Lee el `motivo` del cuerpo de un error, si el endpoint lo manda. */
export function serverMotivo(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'motivo' in body) {
    const motivo = (body as { motivo: unknown }).motivo
    if (typeof motivo === 'string' && motivo.length > 0) return motivo
  }
  return null
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