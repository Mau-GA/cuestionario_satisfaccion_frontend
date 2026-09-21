/**
 * Rampa divergente para escalas de satisfacción.
 *
 * La polaridad es el dato: las opciones van de lo más negativo a lo más
 * positivo, así que el color va de un tono a otro con un gris neutro en medio,
 * no de claro a oscuro en un solo tono. Un solo tono diría "más o menos" y lo
 * que se quiere decir es "peor o mejor".
 *
 * Cada brazo está validado como rampa ordinal de un tono contra superficie
 * blanca (luminosidad monótona, paso visible, extremo claro por encima de 2:1).
 */
const BRAZO_NEGATIVO = ['#f0a3a2', '#d9615f', '#b32b2b'] // del centro al extremo
const BRAZO_POSITIVO = ['#86b6ef', '#3987e5', '#1c5cab']

/** Gris recesivo: lo neutro no debe competir con los extremos. */
const NEUTRO = '#c3c2b7'

function pasos(brazo: string[], cuantos: number) {
  if (cuantos <= 0) return []
  if (cuantos === 1) return [brazo[brazo.length - 1]]
  return Array.from(
    { length: cuantos },
    (_, i) => brazo[Math.round((i / (cuantos - 1)) * (brazo.length - 1))],
  )
}

/** Devuelve `n` colores, del más negativo al más positivo. */
export function rampaDivergente(n: number): string[] {
  if (n <= 0) return []
  if (n === 1) return [NEUTRO]
  const conNeutro = n % 2 === 1
  const porBrazo = Math.floor(n / 2)
  return [
    ...pasos(BRAZO_NEGATIVO, porBrazo).reverse(),
    ...(conNeutro ? [NEUTRO] : []),
    ...pasos(BRAZO_POSITIVO, porBrazo),
  ]
}

/**
 * Color del punto que acompaña a una cifra de satisfacción.
 *
 * Va en una marca al lado del número, nunca en el número: un texto teñido con
 * el color del dato pierde legibilidad y gasta el canal de identidad. La marca
 * da la polaridad, el texto se queda en tinta.
 */
export function marcaDeSatisfaccion(pct: number) {
  if (pct >= 60) return '#1c5cab'
  if (pct > 40) return '#c3c2b7'
  return '#b32b2b'
}
