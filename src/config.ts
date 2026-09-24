/** URL base del API, sin barra final. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

/**
 * Client ID de Google Identity Services. Debe ser el mismo OAuth Client ID
 * que el backend valida en GOOGLE_CLIENT_ID.
 *
 * Sin este valor no se rompe nada: el botón de Google simplemente no se
 * dibuja, igual que el backend responde 503 en vez de fallar de forma
 * confusa. Entrar con correo y contraseña sigue funcionando siempre.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
