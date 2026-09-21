/**
 * Normaliza para buscar: sin acentos, sin mayúsculas, sin espacios de sobra.
 *
 * Quien escribe "como calificas" debe encontrar "¿Cómo calificas…": exigir el
 * acento convertiría el autocompletado en un examen de ortografía.
 */
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Marca en qué parte del texto cayó la coincidencia, para resaltarla. */
export function partirPorCoincidencia(texto: string, busqueda: string) {
  const n = normalizar(busqueda)
  if (!n) return [{ texto, coincide: false }]
  const indice = normalizar(texto).indexOf(n)
  if (indice < 0) return [{ texto, coincide: false }]
  return [
    { texto: texto.slice(0, indice), coincide: false },
    { texto: texto.slice(indice, indice + n.length), coincide: true },
    { texto: texto.slice(indice + n.length), coincide: false },
  ].filter((p) => p.texto.length > 0)
}
