import { useState } from 'react'
import type { FormEvent } from 'react'
import { Aviso, Boton, Campo, Selector, Tarjeta } from './ui'
import { VistaPrevia } from './Vista'
import { PRESETS } from '../utils/presets'
import type { Preset } from '../utils/presets'
import { ApiError } from '../services/http'
import { agregarPreguntaAEncuesta, crearYAgregarPregunta } from '../services/admin'
import type { Opcion, Pregunta, TipoRespuesta } from '../types/admin'

type Modo = 'preset' | 'nueva' | 'catalogo'

interface Props {
  idEncuesta: number
  preguntasDelCatalogo: Pregunta[]
  tiposRespuesta: TipoRespuesta[]
  opciones: Opcion[]
  onAgregada: () => Promise<void> | void
}

const esTextoLibre = (nombre: string) => nombre.trim().toLowerCase() === 'texto libre'

export function AgregarPregunta({
  idEncuesta,
  preguntasDelCatalogo,
  tiposRespuesta,
  opciones,
  onAgregada,
}: Props) {
  const [modo, setModo] = useState<Modo>('preset')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const idDeTipo = (nombre: string) =>
    tiposRespuesta.find((t) => t.tipoRespuesta.trim().toLowerCase() === nombre.trim().toLowerCase())
      ?.idTipoRespuesta

  async function enviar(accion: () => Promise<unknown>) {
    setError(null)
    setEnviando(true)
    try {
      await accion()
      await onAgregada()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo agregar la pregunta')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta titulo="Agregar pregunta">
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        <Pestana activa={modo === 'preset'} onClick={() => setModo('preset')}>
          Combinación rápida
        </Pestana>
        <Pestana activa={modo === 'nueva'} onClick={() => setModo('nueva')}>
          Escribir opciones
        </Pestana>
        <Pestana activa={modo === 'catalogo'} onClick={() => setModo('catalogo')}>
          Del catálogo
        </Pestana>
      </div>

      <Aviso tipo="error">{error}</Aviso>

      {modo === 'preset' && (
        <FormaPreset idDeTipo={idDeTipo} enviando={enviando} onEnviar={enviar} idEncuesta={idEncuesta} />
      )}
      {modo === 'nueva' && (
        <FormaNueva
          tiposRespuesta={tiposRespuesta}
          opciones={opciones}
          enviando={enviando}
          onEnviar={enviar}
          idEncuesta={idEncuesta}
        />
      )}
      {modo === 'catalogo' && (
        <FormaCatalogo
          preguntas={preguntasDelCatalogo}
          tiposRespuesta={tiposRespuesta}
          opciones={opciones}
          enviando={enviando}
          onEnviar={enviar}
          idEncuesta={idEncuesta}
        />
      )}
    </Tarjeta>
  )
}

function Pestana({
  activa,
  onClick,
  children,
}: {
  activa: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        activa ? 'bg-white text-unam-azul shadow-sm' : 'text-slate-600 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  )
}

// ---------- Combinaciones predeterminadas ----------

function FormaPreset({
  idEncuesta,
  idDeTipo,
  enviando,
  onEnviar,
}: {
  idEncuesta: number
  idDeTipo: (nombre: string) => number | undefined
  enviando: boolean
  onEnviar: (accion: () => Promise<unknown>) => Promise<void>
}) {
  const [elegido, setElegido] = useState<Preset>(PRESETS[0])
  const [texto, setTexto] = useState('')

  function agregar(evento: FormEvent) {
    evento.preventDefault()
    const idTipoRespuesta = idDeTipo(elegido.tipoRespuesta)
    if (!idTipoRespuesta) return
    void onEnviar(async () => {
      await crearYAgregarPregunta(idEncuesta, {
        pregunta: texto,
        idTipoRespuesta,
        opcionesNuevas: elegido.opciones.length ? elegido.opciones : undefined,
      })
      setTexto('')
    })
  }

  return (
    <form onSubmit={agregar} className="space-y-4">
      <Campo
        etiqueta="Pregunta"
        required
        maxLength={500}
        placeholder="¿Cómo calificas la atención recibida?"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <div>
        <p id="titulo-escala" className="mb-2 text-sm font-medium text-slate-700">
          Escala
        </p>
        {/* Cada tarjeta es un div y no un button: adentro va la vista previa, que
            trae sus propios botones, y anidar botones es HTML inválido. */}
        <div role="radiogroup" aria-labelledby="titulo-escala" className="grid gap-3">
          {PRESETS.map((p) => (
            <div
              key={p.id}
              role="radio"
              tabIndex={0}
              aria-checked={elegido.id === p.id}
              onClick={() => setElegido(p)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  setElegido(p)
                }
              }}
              className={`cursor-pointer rounded-lg border p-3 text-left transition focus:ring-2 focus:ring-unam-azul/30 focus:outline-none ${
                elegido.id === p.id
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
      </div>

      <Boton type="submit" disabled={enviando}>
        {enviando ? 'Agregando…' : 'Agregar a la encuesta'}
      </Boton>
    </form>
  )
}

// ---------- Pregunta nueva con opciones propias o existentes ----------

function FormaNueva({
  idEncuesta,
  tiposRespuesta,
  opciones,
  enviando,
  onEnviar,
}: {
  idEncuesta: number
  tiposRespuesta: TipoRespuesta[]
  opciones: Opcion[]
  enviando: boolean
  onEnviar: (accion: () => Promise<unknown>) => Promise<void>
}) {
  const [texto, setTexto] = useState('')
  const [idTipo, setIdTipo] = useState('')
  const [fuente, setFuente] = useState<'nuevas' | 'existentes'>('nuevas')
  const [nuevas, setNuevas] = useState([
    { opcion: '', peso: 1 },
    { opcion: '', peso: 2 },
  ])
  const [elegidas, setElegidas] = useState<number[]>([])

  const tipo = tiposRespuesta.find((t) => String(t.idTipoRespuesta) === idTipo)
  const sinOpciones = tipo ? esTextoLibre(tipo.tipoRespuesta) : false

  const paraVistaPrevia =
    fuente === 'nuevas'
      ? nuevas.filter((o) => o.opcion.trim()).map((o) => ({ opcion: o.opcion, peso: o.peso }))
      : opciones
          .filter((o) => elegidas.includes(o.idOpcion))
          .map((o) => ({ opcion: o.opcion, peso: o.peso === null ? null : Number(o.peso) }))

  function agregar(evento: FormEvent) {
    evento.preventDefault()
    void onEnviar(async () => {
      await crearYAgregarPregunta(idEncuesta, {
        pregunta: texto,
        idTipoRespuesta: Number(idTipo),
        opcionesNuevas:
          sinOpciones || fuente !== 'nuevas'
            ? undefined
            : nuevas.filter((o) => o.opcion.trim()).map((o) => ({ opcion: o.opcion.trim(), peso: o.peso })),
        idOpciones: sinOpciones || fuente !== 'existentes' ? undefined : elegidas,
      })
      setTexto('')
      setNuevas([
        { opcion: '', peso: 1 },
        { opcion: '', peso: 2 },
      ])
      setElegidas([])
    })
  }

  return (
    <form onSubmit={agregar} className="space-y-4">
      <Campo
        etiqueta="Pregunta"
        required
        maxLength={500}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <Selector
        etiqueta="Forma de responder"
        required
        value={idTipo}
        onChange={(e) => setIdTipo(e.target.value)}
      >
        <option value="">Selecciona una…</option>
        {tiposRespuesta.map((t) => (
          <option key={t.idTipoRespuesta} value={t.idTipoRespuesta}>
            {t.tipoRespuesta}
          </option>
        ))}
      </Selector>

      {idTipo && !sinOpciones && (
        <>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={fuente === 'nuevas'}
                onChange={() => setFuente('nuevas')}
              />
              Escribir opciones nuevas
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={fuente === 'existentes'}
                onChange={() => setFuente('existentes')}
              />
              Usar las del catálogo
            </label>
          </div>

          {fuente === 'nuevas' ? (
            <div className="space-y-2">
              {nuevas.map((o, i) => (
                <div key={i} className="flex items-end gap-2">
                  <Campo
                    etiqueta={i === 0 ? 'Opciones (de la más negativa a la más positiva)' : ''}
                    value={o.opcion}
                    maxLength={255}
                    placeholder={`Opción ${i + 1}`}
                    onChange={(e) =>
                      setNuevas((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, opcion: e.target.value } : x)),
                      )
                    }
                    className="flex-1"
                  />
                  <Campo
                    etiqueta={i === 0 ? 'Peso' : ''}
                    type="number"
                    step="0.01"
                    value={o.peso}
                    onChange={(e) =>
                      setNuevas((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, peso: Number(e.target.value) } : x)),
                      )
                    }
                    className="w-20"
                  />
                  {nuevas.length > 2 && (
                    <Boton
                      type="button"
                      variante="secundario"
                      onClick={() => setNuevas((prev) => prev.filter((_, j) => j !== i))}
                    >
                      ×
                    </Boton>
                  )}
                </div>
              ))}
              <Boton
                type="button"
                variante="secundario"
                onClick={() =>
                  setNuevas((prev) => [...prev, { opcion: '', peso: prev.length + 1 }])
                }
              >
                + Otra opción
              </Boton>
            </div>
          ) : (
            <div className="space-y-1.5">
              {opciones.map((o) => (
                <label key={o.idOpcion} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={elegidas.includes(o.idOpcion)}
                    onChange={(e) =>
                      setElegidas((prev) =>
                        e.target.checked ? [...prev, o.idOpcion] : prev.filter((x) => x !== o.idOpcion),
                      )
                    }
                  />
                  <span className="text-slate-700">{o.opcion}</span>
                  <span className="text-xs text-slate-400">peso {o.peso ?? '—'}</span>
                </label>
              ))}
            </div>
          )}
        </>
      )}

      {idTipo && (
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Así se verá
          </p>
          <VistaPrevia tipoRespuesta={tipo?.tipoRespuesta ?? ''} opciones={paraVistaPrevia} />
        </div>
      )}

      <Boton type="submit" disabled={enviando}>
        {enviando ? 'Agregando…' : 'Agregar a la encuesta'}
      </Boton>
    </form>
  )
}

// ---------- Pregunta que ya está en el catálogo ----------

function FormaCatalogo({
  idEncuesta,
  preguntas,
  tiposRespuesta,
  opciones,
  enviando,
  onEnviar,
}: {
  idEncuesta: number
  preguntas: Pregunta[]
  tiposRespuesta: TipoRespuesta[]
  opciones: Opcion[]
  enviando: boolean
  onEnviar: (accion: () => Promise<unknown>) => Promise<void>
}) {
  const [idPregunta, setIdPregunta] = useState('')
  const [idTipo, setIdTipo] = useState('')
  const [elegidas, setElegidas] = useState<number[]>([])

  const tipo = tiposRespuesta.find((t) => String(t.idTipoRespuesta) === idTipo)
  const sinOpciones = tipo ? esTextoLibre(tipo.tipoRespuesta) : false

  function agregar(evento: FormEvent) {
    evento.preventDefault()
    void onEnviar(async () => {
      await agregarPreguntaAEncuesta(idEncuesta, {
        idPregunta: Number(idPregunta),
        idTipoRespuesta: Number(idTipo),
        idOpciones: sinOpciones ? undefined : elegidas,
      })
      setIdPregunta('')
      setElegidas([])
    })
  }

  return (
    <form onSubmit={agregar} className="space-y-4">
      <p className="text-sm text-slate-500">
        Reutilizar una pregunta ya usada permite comparar resultados entre encuestas.
      </p>
      <Selector
        etiqueta="Pregunta"
        required
        value={idPregunta}
        onChange={(e) => setIdPregunta(e.target.value)}
      >
        <option value="">Selecciona una…</option>
        {preguntas.map((p) => (
          <option key={p.idPregunta} value={p.idPregunta}>
            {p.pregunta}
          </option>
        ))}
      </Selector>
      <Selector
        etiqueta="Forma de responder"
        required
        value={idTipo}
        onChange={(e) => setIdTipo(e.target.value)}
      >
        <option value="">Selecciona una…</option>
        {tiposRespuesta.map((t) => (
          <option key={t.idTipoRespuesta} value={t.idTipoRespuesta}>
            {t.tipoRespuesta}
          </option>
        ))}
      </Selector>

      {idTipo && !sinOpciones && (
        <div className="space-y-1.5">
          {opciones.map((o) => (
            <label key={o.idOpcion} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={elegidas.includes(o.idOpcion)}
                onChange={(e) =>
                  setElegidas((prev) =>
                    e.target.checked ? [...prev, o.idOpcion] : prev.filter((x) => x !== o.idOpcion),
                  )
                }
              />
              <span className="text-slate-700">{o.opcion}</span>
              <span className="text-xs text-slate-400">peso {o.peso ?? '—'}</span>
            </label>
          ))}
        </div>
      )}

      {idTipo && (
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Así se verá
          </p>
          <VistaPrevia
            tipoRespuesta={tipo?.tipoRespuesta ?? ''}
            opciones={opciones
              .filter((o) => elegidas.includes(o.idOpcion))
              .map((o) => ({ opcion: o.opcion, peso: o.peso === null ? null : Number(o.peso) }))}
          />
        </div>
      )}

      <Boton type="submit" disabled={enviando}>
        {enviando ? 'Agregando…' : 'Agregar a la encuesta'}
      </Boton>
    </form>
  )
}
