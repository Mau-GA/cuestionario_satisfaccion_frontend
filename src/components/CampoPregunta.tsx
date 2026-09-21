import { useId, useRef, useState } from 'react'
import { normalizar, partirPorCoincidencia } from '../utils/texto'
import type { Pregunta } from '../types/admin'

const MAX_SUGERENCIAS = 6

interface Props {
  valor: string
  onCambiar: (texto: string) => void
  /** Se fija al elegir una del catálogo; se limpia al volver a escribir. */
  idPreguntaElegida: number | null
  onElegirDelCatalogo: (pregunta: Pregunta | null) => void
  catalogo: Pregunta[]
  /** Las que ya están en la encuesta: no tiene caso ofrecerlas. */
  yaEnLaEncuesta: Set<number>
}

/**
 * Campo para escribir la pregunta, que va ofreciendo las del catálogo que se
 * parecen a lo que la persona lleva escrito.
 *
 * La idea es que reutilizar sea lo fácil y no lo que hay que ir a buscar:
 * dos áreas que preguntan lo mismo con textos distintos producen resultados
 * que después no se pueden comparar.
 */
export function CampoPregunta({
  valor,
  onCambiar,
  idPreguntaElegida,
  onElegirDelCatalogo,
  catalogo,
  yaEnLaEncuesta,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [resaltada, setResaltada] = useState(0)
  const idLista = useId()
  const contenedor = useRef<HTMLDivElement>(null)

  const busqueda = normalizar(valor)
  const sugerencias =
    busqueda.length < 2 || idPreguntaElegida !== null
      ? []
      : catalogo
          .filter((p) => !yaEnLaEncuesta.has(p.idPregunta) && normalizar(p.pregunta).includes(busqueda))
          .slice(0, MAX_SUGERENCIAS)

  const mostrar = abierto && sugerencias.length > 0

  function elegir(pregunta: Pregunta) {
    onCambiar(pregunta.pregunta)
    onElegirDelCatalogo(pregunta)
    setAbierto(false)
  }

  function alEscribir(texto: string) {
    onCambiar(texto)
    // Cambiar el texto deja de ser "la del catálogo" y pasa a ser una nueva.
    if (idPreguntaElegida !== null) onElegirDelCatalogo(null)
    setResaltada(0)
    setAbierto(true)
  }

  function alTeclear(e: React.KeyboardEvent) {
    if (!mostrar) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setResaltada((i) => (i + 1) % sugerencias.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setResaltada((i) => (i - 1 + sugerencias.length) % sugerencias.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      elegir(sugerencias[resaltada])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  return (
    <div
      ref={contenedor}
      className="relative"
      onBlur={(e) => {
        // Solo cerrar cuando el foco sale del campo Y de la lista.
        if (!contenedor.current?.contains(e.relatedTarget as Node)) setAbierto(false)
      }}
    >
      <label className="block text-sm font-medium text-slate-700" htmlFor={`${idLista}-input`}>
        Pregunta
      </label>
      <input
        id={`${idLista}-input`}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={idLista}
        aria-autocomplete="list"
        autoComplete="off"
        maxLength={500}
        required
        value={valor}
        placeholder="Escribe la pregunta…"
        onChange={(e) => alEscribir(e.target.value)}
        onFocus={() => setAbierto(true)}
        onKeyDown={alTeclear}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
      />

      {idPreguntaElegida !== null ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700">
          <span aria-hidden>↺</span>
          Se reutilizará esta pregunta del catálogo, así sus resultados se pueden comparar con los
          de otras encuestas.
        </p>
      ) : (
        valor.trim().length > 0 && (
          <p className="mt-1.5 text-xs text-slate-500">Se creará como pregunta nueva del catálogo.</p>
        )
      )}

      {mostrar && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <li className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-500">
            Ya existen en el catálogo
          </li>
          {sugerencias.map((p, i) => (
            <li key={p.idPregunta}>
              <button
                type="button"
                role="option"
                aria-selected={i === resaltada}
                onMouseEnter={() => setResaltada(i)}
                onClick={() => elegir(p)}
                className={`block w-full px-3 py-2 text-left text-sm transition ${
                  i === resaltada ? 'bg-unam-azul/5 text-unam-azul' : 'text-slate-700'
                }`}
              >
                {partirPorCoincidencia(p.pregunta, valor).map((parte, j) => (
                  <span key={j} className={parte.coincide ? 'font-semibold' : undefined}>
                    {parte.texto}
                  </span>
                ))}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
