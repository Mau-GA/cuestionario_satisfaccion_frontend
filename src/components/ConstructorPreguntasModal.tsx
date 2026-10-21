import { useCallback, useEffect, useRef, useState } from 'react'
import {
  agregarPreguntaEncuesta,
  listarPreguntasEncuesta,
  quitarPreguntaEncuesta,
  reordenarPreguntasEncuesta,
  type PreguntaEncuesta,
} from '../services/armado'
import { listPreguntasActivas, listTiposRespuestaActivos } from '../services/catalogos'
import type { Encuesta } from '../services/encuestas'
import { calcularEstado } from '../services/encuestas'
import { ApiError } from '../types/api'

const CLASE_INPUT =
  'font-normal px-[14px] py-2.5 rounded-lg border border-outline bg-surface text-ink box-border ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-outline ' +
  'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]'

interface Props {
  encuesta: Encuesta
  onClose: () => void
}

function ConstructorPreguntasModal({ encuesta, onClose }: Props) {
  const [items, setItems] = useState<PreguntaEncuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const [catalogoPreguntas, setCatalogoPreguntas] = useState<
    { idPregunta: number; pregunta: string }[]
  >([])
  const [tiposRespuesta, setTiposRespuesta] = useState<
    { idTipoRespuesta: number; tipoRespuesta: string }[]
  >([])
  const [idPreguntaSel, setIdPreguntaSel] = useState('')
  const [idTipoSel, setIdTipoSel] = useState('')
  const [agregando, setAgregando] = useState(false)

  const [quitarId, setQuitarId] = useState<PreguntaEncuesta | null>(null)
  const [quitando, setQuitando] = useState(false)

  // Reordenar arrastrando: durante el arrastre solo se reordena en pantalla;
  // el PUT salta al soltar (dragEnd cubre también el drop fuera del modal).
  const dragDesde = useRef<number | null>(null)
  const [arrastando, setArrastando] = useState<number | null>(null)
  const ordenOriginal = useRef<number[] | null>(null)
  // Si se suelta un segundo arrastre antes de que responda el PUT del
  // primero, solo se aplica la respuesta del más reciente: evita que una
  // respuesta atrasada pise en pantalla un orden ya desactualizado.
  const ultimoReorden = useRef(0)

  const editable =
    calcularEstado(encuesta) === 'borrador' ||
    calcularEstado(encuesta) === 'programada'

  const cargar = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await listarPreguntasEncuesta(encuesta.idEncuesta)
      setItems(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [encuesta.idEncuesta])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
    listPreguntasActivas()
      .then((lista) =>
        setCatalogoPreguntas(
          lista.map((p) => ({ idPregunta: p.idPregunta, pregunta: p.pregunta })),
        ),
      )
      .catch(() => setCatalogoPreguntas([]))
    listTiposRespuestaActivos()
      .then((lista) =>
        setTiposRespuesta(
          lista.map((t) => ({
            idTipoRespuesta: t.idTipoRespuesta,
            tipoRespuesta: t.tipoRespuesta,
          })),
        ),
      )
      .catch(() => setTiposRespuesta([]))
  }, [cargar])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // El catálogo muestra solo preguntas que aún no están en la encuesta.
  const idsEnEncuesta = new Set(items.map((item) => item.pregunta.idPregunta))
  const disponibles = catalogoPreguntas.filter(
    (pregunta) => !idsEnEncuesta.has(pregunta.idPregunta),
  )

  async function handleAgregar(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setAviso(null)

    if (!idPreguntaSel || !idTipoSel) {
      setError('Selecciona la pregunta y su tipo de respuesta.')
      return
    }

    setAgregando(true)
    try {
      await agregarPreguntaEncuesta(encuesta.idEncuesta, {
        idPregunta: Number(idPreguntaSel),
        idTipoRespuesta: Number(idTipoSel),
      })
      setIdPreguntaSel('')
      setIdTipoSel('')
      await cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
    } finally {
      setAgregando(false)
    }
  }

  async function handleQuitar(): Promise<void> {
    if (!quitarId) return
    setQuitando(true)
    setError(null)
    setAviso(null)
    try {
      await quitarPreguntaEncuesta(encuesta.idEncuesta, quitarId.idEncuestaPregunta)
      // El backend renumera al quitar; se recupera la lista fresca.
      await cargar()
      setQuitarId(null)
      setAviso('La pregunta se quitó de la encuesta.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
    } finally {
      setQuitando(false)
    }
  }

  function mover(desde: number, hasta: number): void {
    if (desde === hasta) return
    setItems((prev) => {
      const copia = [...prev]
      const [item] = copia.splice(desde, 1)
      copia.splice(hasta, 0, item)
      return copia
    })
  }

  function handleDragStart(indice: number): void {
    if (!editable) return
    dragDesde.current = indice
    ordenOriginal.current = items.map((item) => item.idEncuestaPregunta)
    setArrastando(indice)
  }

  function handleDragEnter(indice: number): void {
    if (dragDesde.current === null || indice === dragDesde.current) return
    mover(dragDesde.current, indice)
    dragDesde.current = indice
    setArrastando(indice)
  }

  async function handleDragEnd(): Promise<void> {
    setArrastando(null)
    const original = ordenOriginal.current
    ordenOriginal.current = null
    dragDesde.current = null
    if (!original) return

    const nuevo = items.map((item) => item.idEncuestaPregunta)
    if (
      nuevo.length === original.length &&
      nuevo.every((id, i) => id === original[i])
    ) {
      return
    }

    const envio = ++ultimoReorden.current
    setError(null)
    setAviso(null)
    try {
      // El PUT devuelve la lista con el orden guardado; si algo falla se
      // recupera el orden real del servidor.
      const res = await reordenarPreguntasEncuesta(encuesta.idEncuesta, nuevo)
      if (envio !== ultimoReorden.current) return
      setItems(res)
      setAviso('Orden guardado.')
    } catch (err) {
      if (envio !== ultimoReorden.current) return
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
      await cargar()
    }
  }

  const enArrastre = arrastando !== null && editable

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="constructor-titulo"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-6 box-border"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5">
          <h2 id="constructor-titulo" className="text-ink text-[20px]">
            Preguntas de la encuesta
          </h2>
          <p className="mt-1 text-sm opacity-70">
            {encuesta.titulo}. Agrega preguntas del catálogo, quítalas y
            reordénalas arrastrando; el orden se guarda automáticamente.
          </p>
        </header>

        {aviso && (
          <p
            className="mb-4 px-[14px] py-[10px] rounded-lg text-sm bg-green-50 border border-green-200 text-green-800"
            role="status"
          >
            {aviso}
          </p>
        )}
        {error && (
          <p
            className="mb-4 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="alert"
          >
            {error}
          </p>
        )}

        {!editable && (
          <p
            className="mb-4 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="note"
          >
            La encuesta ya inició o está cerrada: puedes consultar el orden,
            pero no modificarlo.
          </p>
        )}

        {loading ? (
          <p>Cargando…</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center opacity-70 text-sm">
            Aún no hay preguntas en esta encuesta.
          </p>
        ) : (
          <ol className="m-0 mt-1 mb-1 p-0 list-none flex flex-col gap-2">
            {items.map((item, indice) => (
              <li
                key={item.idEncuestaPregunta}
                draggable={editable}
                onDragStart={() => handleDragStart(indice)}
                onDragEnter={() => handleDragEnter(indice)}
                onDragOver={(event) => {
                  if (enArrastre) event.preventDefault()
                }}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-outline bg-ink/2 transition-[background-color,border-color,opacity] duration-150 ${
                  enArrastre ? (indice === arrastando ? 'opacity-60 cursor-grabbing' : 'cursor-grab') : ''
                }`}
              >
                <span className="text-xs font-semibold opacity-60 w-6 text-center shrink-0">
                  {indice + 1}
                </span>
                {editable && (
                  <span
                    className="select-none text-lg opacity-40 cursor-grab"
                    title="Arrastrar para reordenar"
                  >
                    ⠿
                  </span>
                )}
                <span className="flex-1 min-w-0 text-sm text-ink break-words">
                  {item.pregunta.pregunta}
                </span>
                <span
                  className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-accent-soft text-azul-unam"
                  title="Tipo de respuesta"
                >
                  {item.tipoRespuesta.tipoRespuesta}
                </span>
                <button
                  type="button"
                  onClick={() => setQuitarId(item)}
                  disabled={!editable || quitando}
                  title={editable ? 'Quitar de la encuesta' : 'No editable'}
                  className="shrink-0 text-red-600 hover:bg-red-100 rounded-lg p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
        )}

        {editable && (
          <form
            className="mt-5 pt-4 border-t border-outline flex flex-col gap-3"
            onSubmit={handleAgregar}
          >
            <p className="text-sm font-semibold text-ink">
              Agregar pregunta del catálogo
            </p>
            <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
              <select
                value={idPreguntaSel}
                onChange={(event) => setIdPreguntaSel(event.target.value)}
                aria-label="Pregunta del catálogo"
                className={CLASE_INPUT}
              >
                <option value="">
                  {disponibles.length === 0
                    ? 'Ya agregaste todas las preguntas'
                    : 'Selecciona una pregunta…'}
                </option>
                {disponibles.map((pregunta) => (
                  <option key={pregunta.idPregunta} value={pregunta.idPregunta}>
                    {pregunta.pregunta}
                  </option>
                ))}
              </select>
              <select
                value={idTipoSel}
                onChange={(event) => setIdTipoSel(event.target.value)}
                aria-label="Tipo de respuesta"
                className={CLASE_INPUT}
              >
                <option value="">Tipo de respuesta…</option>
                {tiposRespuesta.map((tipo) => (
                  <option key={tipo.idTipoRespuesta} value={tipo.idTipoRespuesta}>
                    {tipo.tipoRespuesta}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs opacity-70">
              Las preguntas de texto no llevan opciones; las cerradas
              (caritas, estrellas, barra) sí.
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={agregando || !idPreguntaSel || !idTipoSel}
                className="rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
                  transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {agregando ? 'Agregando…' : 'Agregar pregunta'}
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </div>

      {quitarId && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setQuitarId(null)}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl bg-surface border border-outline p-6 box-border"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-ink text-[18px] mb-2">¿Quitar la pregunta?</h3>
            <p className="text-sm opacity-80 mb-5 break-words">
              «{quitarId.pregunta.pregunta}» dejará de formar parte de esta
              encuesta.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuitarId(null)}
                disabled={quitando}
                className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
                  transition-[filter,transform] duration-150 hover:bg-accent-soft disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleQuitar}
                disabled={quitando}
                className="rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
                  transition-[filter,transform] duration-150 hover:brightness-110 disabled:opacity-60"
              >
                {quitando ? 'Quitando…' : 'Quitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConstructorPreguntasModal
