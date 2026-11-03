/**
 * Los tipos de respuesta vistos desde el editor. Viven aparte de los
 * componentes porque fast refresh exige que un módulo de componentes solo
 * exporte componentes.
 */

/** El único tipo abierto: se responde escribiendo y no lleva opciones. */
export const TIPO_TEXTO = 'texto'

/** Glifo de cada tipo; el mismo lenguaje que ve quien responde. */
const GLIFO: Record<string, string> = {
  caritas: '🙂',
  estrellas: '★',
  barra: '▰',
  texto: 'Aa',
}

export function esTipoAbierto(tipo: string): boolean {
  return tipo.trim().toLowerCase() === TIPO_TEXTO
}

export function glifoDeTipo(tipo: string): string {
  return GLIFO[tipo.trim().toLowerCase()] ?? '•'
}
