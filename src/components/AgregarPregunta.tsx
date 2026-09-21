import { useState } from 'react'
import type { FormEvent } from 'react'
import { Aviso, Boton } from './ui'
import { CampoPregunta } from './CampoPregunta'
import { VistaPrevia } from './Vista'
import { PRESETS } from '../utils/presets'
import type { Preset } from '../utils/presets'
import { ApiError } from '../services/http'
import { crearYAgregarPregunta } from '../services/admin'
import type { Pregunta, TipoRespuesta } from '../types/admin'

interface Props {
  idEncuesta: number
  catalogo: Pregunta[]
  yaEnLaEncuesta: Set<number>
  tiposRespuesta: TipoRespuesta[]
  onAgregada: () => Promise<void> | void
}

/**
 * Agregar una pregunta, en dos pasos: primero cuál es la pregunta, después
 * cómo se responde.
 *
 * El panel arranca cerrado. Tener el formulario siempre abierto debajo de la
 * encuesta competía visualmente con ella y hacía difícil leer lo que ya estaba
 * armado.
 */
export function AgregarPregunta({
  idEncuesta,
  catalogo,
  yaEnLaEncuesta,
  tiposRespuesta,
  onAgregada,
}: Props) {
  const [abierto, setAbierto] = useState(false)

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-4 text-sm font-medium text-unam-azul transition hover:border-unam-azul-claro hover:bg-unam-azul/5"
      >
        + Agregar pregunta
      </button>
    )
  }

  return <Formulario {...{ idEncuesta, catalogo, yaEnLaEncuesta, tiposRespuesta, onAgregada }} onCerrar={() => setAbierto(false)} />
}

function Formulario({
  idEncuesta,
  catalogo,
  yaEnLaEncuesta,
  tiposRespuesta,
  onAgregada,
  onCerrar,
}: Props & { onCerrar: () => void }) {
  const [texto, setTexto] = useState('')
  const [delCatalogo, setDelCatalogo] = useState<Pregunta | null>(null)
  const [escala, setEscala] = useState<Preset>(PRESETS[0])
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const idDeTipo = (nombre: string) =>
    tiposRespuesta.find((t) => t.tipoRespuesta.trim().toLowerCase() === nombre.trim().toLowerCase())
      ?.idTipoRespuesta

  async function agregar(evento: FormEvent) {
    evento.preventDefault()
    const idTipoRespuesta = idDeTipo(escala.tipoRespuesta)
    if (!idTipoRespuesta) {
      setError(`El catálogo no tiene el tipo de respuesta "${escala.tipoRespuesta}".`)
      return
    }
    setError(null)
    setEnviando(true)
    try {
      await crearYAgregarPregunta(idEncuesta, {
        // O se reutiliza la del catálogo, o se crea con el texto escrito.
        ...(delCatalogo ? { idPregunta: delCatalogo.idPregunta } : { pregunta: texto.trim() }),
        idTipoRespuesta,
        opcionesNuevas: escala.opciones.length ? escala.opciones : undefined,
      })
      await onAgregada()
      setTexto('')
      setDelCatalogo(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo agregar la pregunta')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={agregar}
      className="rounded-xl border border-unam-azul/30 bg-white p-5 ring-2 ring-unam-azul/10"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-unam-azul">Nueva pregunta</h3>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <CampoPregunta
        valor={texto}
        onCambiar={setTexto}
        idPreguntaElegida={delCatalogo?.idPregunta ?? null}
        onElegirDelCatalogo={setDelCatalogo}
        catalogo={catalogo}
        yaEnLaEncuesta={yaEnLaEncuesta}
      />

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-slate-700">Cómo se responde</legend>
        <div role="radiogroup" className="mt-2 grid gap-3">
          {PRESETS.map((p) => (
            <div
              key={p.id}
              role="radio"
              tabIndex={0}
              aria-checked={escala.id === p.id}
              onClick={() => setEscala(p)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  setEscala(p)
                }
              }}
              className={`cursor-pointer rounded-lg border p-3 transition focus:ring-2 focus:ring-unam-azul/30 focus:outline-none ${
                escala.id === p.id
                  ? 'border-unam-azul ring-2 ring-unam-azul/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
              <p className="mt-0.5 text-xs text-slate-500">{p.descripcion}</p>
              <div className="mt-3">
                <VistaPrevia tipoRespuesta={p.tipoRespuesta} opciones={p.opciones} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <Aviso tipo="error">{error}</Aviso>
      </div>

      <div className="mt-4 flex gap-2">
        <Boton type="submit" disabled={enviando || texto.trim().length === 0}>
          {enviando ? 'Agregando…' : 'Agregar a la encuesta'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
      </div>
    </form>
  )
}
