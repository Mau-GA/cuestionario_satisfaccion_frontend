import { useState } from 'react'
import type { FormEvent } from 'react'
import { Aviso, Boton, Selector } from './ui'
import { CampoPregunta } from './CampoPregunta'
import { EditorOpciones } from './EditorOpciones'
import type { OpcionEnEdicion } from './EditorOpciones'
import { VistaPrevia } from './Vista'
import { PRESETS } from '../utils/presets'
import type { Preset } from '../utils/presets'
import { ApiError } from '../services/http'
import { crearYAgregarPregunta } from '../services/admin'
import type { Opcion, Pregunta, TipoRespuesta } from '../types/admin'

const TEXTO_LIBRE = 'texto libre'
const esTextoLibre = (nombre: string) => nombre.trim().toLowerCase() === TEXTO_LIBRE

interface Props {
  idEncuesta: number
  catalogo: Pregunta[]
  yaEnLaEncuesta: Set<number>
  tiposRespuesta: TipoRespuesta[]
  catalogoOpciones: Opcion[]
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
  catalogoOpciones,
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

  return (
    <Formulario
      {...{ idEncuesta, catalogo, yaEnLaEncuesta, tiposRespuesta, catalogoOpciones, onAgregada }}
      onCerrar={() => setAbierto(false)}
    />
  )
}

function Formulario({
  idEncuesta,
  catalogo,
  yaEnLaEncuesta,
  tiposRespuesta,
  catalogoOpciones,
  onAgregada,
  onCerrar,
}: Props & { onCerrar: () => void }) {
  const [texto, setTexto] = useState('')
  const [delCatalogo, setDelCatalogo] = useState<Pregunta | null>(null)
  const [idTipoRespuesta, setIdTipoRespuesta] = useState<number | null>(
    tiposRespuesta[0]?.idTipoRespuesta ?? null,
  )
  const [opciones, setOpciones] = useState<OpcionEnEdicion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const tipoElegido = tiposRespuesta.find((t) => t.idTipoRespuesta === idTipoRespuesta)
  const textoLibre = tipoElegido ? esTextoLibre(tipoElegido.tipoRespuesta) : false

  function elegirTipo(id: number) {
    setIdTipoRespuesta(id)
    const nuevoTipo = tiposRespuesta.find((t) => t.idTipoRespuesta === id)
    if (nuevoTipo && esTextoLibre(nuevoTipo.tipoRespuesta)) setOpciones([])
  }

  function usarPlantilla(preset: Preset) {
    const tipo = tiposRespuesta.find(
      (t) => t.tipoRespuesta.trim().toLowerCase() === preset.tipoRespuesta.trim().toLowerCase(),
    )
    if (!tipo) {
      setError(`El catálogo no tiene el tipo de respuesta "${preset.tipoRespuesta}".`)
      return
    }
    setError(null)
    setIdTipoRespuesta(tipo.idTipoRespuesta)
    setOpciones(
      preset.opciones.map((o) => ({
        clave: `nueva-${crypto.randomUUID()}`,
        origen: 'nueva',
        opcion: o.opcion,
        peso: o.peso,
      })),
    )
  }

  async function agregar(evento: FormEvent) {
    evento.preventDefault()
    if (!idTipoRespuesta) {
      setError('Elige cómo se va a responder.')
      return
    }
    if (!textoLibre && opciones.length < 2) {
      setError('Una pregunta con opciones necesita al menos dos.')
      return
    }
    setError(null)
    setEnviando(true)
    try {
      const idOpciones = opciones.filter((o) => o.origen === 'existente').map((o) => o.idOpcion!)
      const opcionesNuevas = opciones
        .filter((o) => o.origen === 'nueva')
        .map((o) => ({ opcion: o.opcion, peso: o.peso }))
      await crearYAgregarPregunta(idEncuesta, {
        // O se reutiliza la del catálogo, o se crea con el texto escrito.
        ...(delCatalogo ? { idPregunta: delCatalogo.idPregunta } : { pregunta: texto.trim() }),
        idTipoRespuesta,
        idOpciones: idOpciones.length ? idOpciones : undefined,
        opcionesNuevas: opcionesNuevas.length ? opcionesNuevas : undefined,
      })
      await onAgregada()
      setTexto('')
      setDelCatalogo(null)
      setOpciones([])
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

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="py-1 text-xs text-slate-500">Empezar desde una escala común:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => usarPlantilla(p)}
              title={p.descripcion}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-unam-azul-claro hover:text-unam-azul"
            >
              {p.nombre}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <Selector
            etiqueta="Tipo de respuesta"
            value={idTipoRespuesta ?? ''}
            onChange={(e) => elegirTipo(Number(e.target.value))}
          >
            {tiposRespuesta.map((t) => (
              <option key={t.idTipoRespuesta} value={t.idTipoRespuesta}>
                {t.tipoRespuesta}
              </option>
            ))}
          </Selector>
        </div>

        {tipoElegido &&
          (textoLibre ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs text-slate-500">Así se verá: un espacio abierto, sin opciones.</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <VistaPrevia tipoRespuesta={tipoElegido.tipoRespuesta} opciones={[]} />
              </div>
            </div>
          ) : (
            <EditorOpciones
              tipoRespuesta={tipoElegido.tipoRespuesta}
              catalogo={catalogoOpciones}
              opciones={opciones}
              onCambiar={setOpciones}
            />
          ))}
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
