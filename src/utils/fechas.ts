/** Formatea una fecha ISO del API para lectura. */
export function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Convierte un ISO del API al formato que espera <input type="datetime-local">. */
export function aInputLocal(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const desfase = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - desfase).toISOString().slice(0, 16)
}

/** Y de vuelta: lo que escribió la persona es hora local, el API recibe ISO. */
export function deInputLocal(valor: string) {
  return valor ? new Date(valor).toISOString() : undefined
}
