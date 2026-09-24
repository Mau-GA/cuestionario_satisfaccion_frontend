import { useState } from 'react'
import { normalizar, partirPorCoincidencia } from '../utils/texto'
import { VistaPrevia } from './Vista'
import { Boton } from './ui'
import type { Opcion } from '../types/admin'

const MAX_SUGERENCIAS = 8

export interface OpcionEnEdicion {
  clave: string
  origen: 'existente' | 'nueva'
  idOpcion?: number
  opcion: string
  peso: number
}

interface Props {
  /** Nombre del tipo de respuesta elegido: decide cómo se dibuja la vista previa. */
  tipoRespuesta: string
  catalogo: Opcion[]
  opciones: OpcionEnEdicion[]
  onCambiar: (opciones: OpcionEnEdicion[]) => void
}

/**
 * Arma las opciones de una pregunta de escala: reutilizando las que ya existen
 * en el catálogo (para que los resultados de distintas encuestas se puedan
 * comparar) o creando otras nuevas con su propio texto y ponderación.
 *
 * La carita/estrella de cada una no se elige aquí: la decide su lugar en la
 * escala una vez ordenadas por peso, igual que en la pantalla de responder.
 */
export function EditorOpciones({ tipoRespuesta, catalogo, opciones, onCambiar }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [textoNueva, setTextoNueva] = useState('')
  const [pesoNueva, setPesoNueva] = useState('')

  const yaElegidas = new Set(opciones.filter((o) => o.origen === 'existente').map((o) => o.idOpcion))
  const sugerencias = catalogo
    .filter((o) => !yaElegidas.has(o.idOpcion))
    .filter((o) => busqueda.trim().length === 0 || normalizar(o.opcion).includes(normalizar(busqueda)))
    .slice(0, MAX_SUGERENCIAS)

  function agregarExistente(o: Opcion) {
    onCambiar([
      ...opciones,
      {
        clave: `existente-${o.idOpcion}`,
        origen: 'existente',
        idOpcion: o.idOpcion,
        opcion: o.opcion,
        peso: o.peso === null ? 0 : Number(o.peso),
      },
    ])
    setBusqueda('')
  }

  function agregarNueva() {
    const texto = textoNueva.trim()
    const peso = Number(pesoNueva)
    if (!texto || pesoNueva.trim() === '' || Number.isNaN(peso)) return
    onCambiar([...opciones, { clave: `nueva-${crypto.randomUUID()}`, origen: 'nueva', opcion: texto, peso }])
    setTextoNueva('')
    setPesoNueva('')
  }

  function quitar(clave: string) {
    onCambiar(opciones.filter((o) => o.clave !== clave))
  }

  const ordenadas = [...opciones].sort((a, b) => a.peso - b.peso)

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <div>
        <p className="text-sm font-medium text-slate-700">Así se verá</p>
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {ordenadas.length >= 2 ? (
            <VistaPrevia tipoRespuesta={tipoRespuesta} opciones={ordenadas} />
          ) : (
            <p className="text-xs text-slate-500">Agrega al menos dos opciones para ver cómo queda.</p>
          )}
        </div>
      </div>

      {ordenadas.length > 0 && (
        <ul className="space-y-1.5">
          {ordenadas.map((o) => (
            <li
              key={o.clave}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-slate-700">{o.opcion}</span>
                <span className="shrink-0 text-xs text-slate-400">peso {o.peso}</span>
                {o.origen === 'existente' && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                    del catálogo
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => quitar(o.clave)}
                aria-label={`Quitar ${o.opcion}`}
                className="shrink-0 text-slate-400 transition hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <label className="block text-sm font-medium text-slate-700" htmlFor="buscar-opcion">
          Reutilizar una opción del catálogo
        </label>
        <input
          id="buscar-opcion"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          placeholder="Ej. Muy insatisfecho…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
        />
        {abierto && sugerencias.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {sugerencias.map((o) => (
              <li key={o.idOpcion}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => agregarExistente(o)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-unam-azul/5 hover:text-unam-azul"
                >
                  <span>
                    {partirPorCoincidencia(o.opcion, busqueda).map((parte, j) => (
                      <span key={j} className={parte.coincide ? 'font-semibold' : undefined}>
                        {parte.texto}
                      </span>
                    ))}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {o.peso === null ? 'sin ponderación' : `peso ${o.peso}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 p-3">
        <p className="text-sm font-medium text-slate-700">O crea una opción nueva</p>
        <div className="mt-2 flex gap-2">
          <input
            value={textoNueva}
            onChange={(e) => setTextoNueva(e.target.value)}
            placeholder="Texto de la opción"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
          />
          <input
            value={pesoNueva}
            onChange={(e) => setPesoNueva(e.target.value)}
            type="number"
            step="0.01"
            min={-999}
            max={999}
            placeholder="Peso"
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
          />
          <Boton type="button" variante="secundario" onClick={agregarNueva}>
            Agregar
          </Boton>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          El peso ordena las opciones de la más baja a la más alta y define su lugar en la escala.
        </p>
      </div>
    </div>
  )
}
