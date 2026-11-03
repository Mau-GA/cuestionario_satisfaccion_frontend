/**
 * Piezas del selector de catálogo que no son componentes. Viven aparte porque
 * fast refresh exige que un módulo de componentes solo exporte componentes.
 */

export interface ItemCatalogo {
  id: number
  texto: string
  /** Dato secundario que ayuda a distinguir dos textos iguales (el peso). */
  pie?: string
}

export interface SeleccionCatalogo {
  /** El renglón del catálogo elegido, o null si el texto es nuevo. */
  item: ItemCatalogo | null
  texto: string
}

/** Deja el texto como se va a guardar: sin espacios de sobra. */
export function normalizarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ')
}

/** Compara como lo haría una persona: sin acentos, mayúsculas ni espacios de sobra. */
export function mismoTexto(a: string, b: string): boolean {
  const normaliza = (texto: string) =>
    normalizarTexto(texto)
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
  return normaliza(a) === normaliza(b)
}
