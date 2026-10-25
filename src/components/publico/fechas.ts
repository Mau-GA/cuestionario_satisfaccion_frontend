/**
 * Texto de cierre de una tarjeta publica. Vive aparte de los componentes
 * porque fast refresh exige que un modulo de componentes solo exporte
 * componentes.
 */
export function cierre(fecha: string | null): string {
  if (fecha === null) return 'Sin fecha de cierre'
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return 'Sin fecha de cierre'
  return `Abierta hasta el ${d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`
}
