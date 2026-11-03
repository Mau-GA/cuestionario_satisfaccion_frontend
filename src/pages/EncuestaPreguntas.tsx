import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import EstadoBadge from '../components/EstadoBadge'
import VistaPreviaEncuestaModal from '../components/VistaPreviaEncuestaModal'
import SelectorCatalogo from '../components/preguntas/SelectorCatalogo'
import TarjetaPregunta from '../components/preguntas/TarjetaPregunta'
import { esTipoAbierto } from '../components/preguntas/tipos'
import type {
  ItemCatalogo,
  SeleccionCatalogo,
} from '../components/preguntas/catalogo'
import {
  agregarOpcionEncuesta,
  agregarPreguntaEncuesta,
  cambiarTipoRespuestaEncuesta,
  listarOpcionesEncuesta,
  listarPreguntasEncuesta,
  quitarOpcionEncuesta,
  quitarPreguntaEncuesta,
  reordenarPreguntasEncuesta,
  type PreguntaEncuesta,
} from '../services/armado'
import {
  createOpcion,
  createPregunta,
  listOpcionesActivas,
  listPreguntasActivas,
  listTiposRespuestaActivos,
} from '../services/catalogos'
import {
  calcularEstado,
  obtenerEncuesta,
  type Encuesta,
} from '../services/encuestas'
import type { Opcion, Pregunta, TipoRespuesta } from '../types/catalogos'
import { ApiError } from '../types/api'

const LIMITES = [
  'Hay cuatro formas de responder y nada más: caritas, estrellas, barra y texto.',
  'Las opciones llevan peso, que es lo que las ordena de lo más negativo a lo más positivo.',
  'Todas las preguntas son obligatorias y no hay secciones ni preguntas que dependan de otra respuesta.',
  'Una pregunta no se repite dentro de la misma encuesta.',
  'Corregir el texto de una pregunta deja una versión nueva en el catálogo: las encuestas ya aplicadas conservan el texto que la gente leyó.',
]

function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Error inesperado'
}

function sugerenciasDeOpciones(opciones: Opcion[]): ItemCatalogo[] {
  return opciones.map((opcion) => ({
    id: opcion.idOpcion,
    texto: opcion.opcion,
    pie: `peso ${opcion.peso ?? '—'}`,
  }))
}

/**
 * El armado de la encuesta, con la forma de un formulario: una tarjeta por
 * pregunta, el texto se escribe (y se da de alta en el catálogo si no estaba),
 * el tipo de respuesta se elige con un botón y las opciones se agregan en la
 * misma tarjeta. Cada cambio se guarda solo; no hay un botón de guardar.
 */
function EncuestaPreguntas() {
  const { id } = useParams<{ id: string }>()
  const idEncuesta = Number(id)
  const idValido = Number.isFinite(idEncuesta) && idEncuesta > 0

  const [encuesta, setEncuesta] = useState<Encuesta | null>(null)
  const [items, setItems] = useState<PreguntaEncuesta[]>([])
  const [opcionesPorPregunta, setOpcionesPorPregunta] = useState<
    Record<number, Opcion[]>
  >({})
  const [catalogoPreguntas, setCatalogoPreguntas] = useState<Pregunta[]>([])
  const [catalogoOpciones, setCatalogoOpciones] = useState<Opcion[]>([])
  const [tipos, setTipos] = useState<TipoRespuesta[]>([])
  const [idTipoNueva, setIdTipoNueva] = useState<number | null>(null)

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enVuelo, setEnVuelo] = useState(0)
  const [guardado, setGuardado] = useState(false)
  const [previaAbierta, setPreviaAbierta] = useState(false)

  const dragDesde = useRef<number | null>(null)
  const [arrastrando, setArrastrando] = useState<number | null>(null)
  // Si se sueltan dos arrastres seguidos, solo se aplica la respuesta del más
  // reciente: una atrasada pisaría en pantalla un orden ya desactualizado.
  const ultimoOrden = useRef(0)

  const cargar = useCallback(async (): Promise<void> => {
    if (!idValido) return
    try {
      const [datos, filas] = await Promise.all([
        obtenerEncuesta(idEncuesta),
        listarPreguntasEncuesta(idEncuesta),
      ])
      const ordenadas = [...filas].sort((a, b) => a.orden - b.orden)
      setEncuesta(datos)
      setItems(ordenadas)
      setErrorCarga(null)

      // Las opciones de todas las preguntas cerradas, en paralelo: si una
      // falla, su tarjeta lo dice y el resto de la encuesta sigue en pie.
      const cerradas = ordenadas.filter(
        (fila) => !esTipoAbierto(fila.tipoRespuesta.tipoRespuesta),
      )
      const resultados = await Promise.allSettled(
        cerradas.map((fila) =>
          listarOpcionesEncuesta(idEncuesta, fila.idEncuestaPregunta),
        ),
      )
      const mapa: Record<number, Opcion[]> = {}
      const fallos: string[] = []
      cerradas.forEach((fila, i) => {
        const resultado = resultados[i]
        if (resultado.status === 'fulfilled') {
          mapa[fila.idEncuestaPregunta] = resultado.value
        } else {
          fallos.push(
            `Opciones de «${fila.pregunta.pregunta}»: ${getErrorMessage(resultado.reason)}`,
          )
        }
      })
      setOpcionesPorPregunta(mapa)
      setError(fallos.length > 0 ? fallos.join(' · ') : null)
    } catch (err) {
      setEncuesta(null)
      setErrorCarga(
        err instanceof ApiError && err.status === 404
          ? 'Esta encuesta no existe o no pertenece a tu unidad.'
          : getErrorMessage(err),
      )
    } finally {
      setCargando(false)
    }
  }, [idEncuesta, idValido])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  useEffect(() => {
    listPreguntasActivas()
      .then(setCatalogoPreguntas)
      .catch(() => setCatalogoPreguntas([]))
    listOpcionesActivas()
      .then(setCatalogoOpciones)
      .catch(() => setCatalogoOpciones([]))
    listTiposRespuestaActivos()
      .then((lista) => {
        setTipos(lista)
        const caritas = lista.find(
          (tipo) => tipo.tipoRespuesta.trim().toLowerCase() === 'caritas',
        )
        setIdTipoNueva((caritas ?? lista[0])?.idTipoRespuesta ?? null)
      })
      .catch(() => setTipos([]))
  }, [])

  /** Marca lo que está en vuelo y deja el aviso de «Guardado» al terminar. */
  async function conGuardado<T>(accion: () => Promise<T>): Promise<T | null> {
    setEnVuelo((n) => n + 1)
    setError(null)
    try {
      const resultado = await accion()
      setGuardado(true)
      return resultado
    } catch (err) {
      setError(getErrorMessage(err))
      setGuardado(false)
      return null
    } finally {
      setEnVuelo((n) => n - 1)
    }
  }

  /**
   * El id del catálogo para lo que se escribió. Si el texto es nuevo se da de
   * alta; el backend devuelve el renglón que ya existía cuando alguien más lo
   * registró antes, así que esto no duplica el catálogo.
   */
  async function idPreguntaDe(seleccion: SeleccionCatalogo): Promise<number> {
    if (seleccion.item) return seleccion.item.id
    const creada = await createPregunta({ pregunta: seleccion.texto })
    setCatalogoPreguntas((prev) =>
      prev.some((p) => p.idPregunta === creada.idPregunta)
        ? prev
        : [...prev, creada],
    )
    return creada.idPregunta
  }

  async function idOpcionDe(
    seleccion: SeleccionCatalogo,
    peso: number | null,
    pesoSiguiente: number,
  ): Promise<number> {
    if (seleccion.item) return seleccion.item.id
    const creada = await createOpcion({
      opcion: seleccion.texto,
      peso: peso ?? pesoSiguiente,
    })
    setCatalogoOpciones((prev) =>
      prev.some((o) => o.idOpcion === creada.idOpcion) ? prev : [...prev, creada],
    )
    return creada.idOpcion
  }

  function handleAgregarPregunta(seleccion: SeleccionCatalogo): void {
    if (idTipoNueva === null) {
      setError('No hay tipos de respuesta disponibles en el catálogo.')
      return
    }
    void conGuardado(async () => {
      const idPregunta = await idPreguntaDe(seleccion)
      await agregarPreguntaEncuesta(idEncuesta, {
        idPregunta,
        idTipoRespuesta: idTipoNueva,
      })
      await cargar()
    })
  }

  /**
   * Cambiar el texto es cambiar de pregunta del catálogo, y el armado solo
   * sabe agregar y quitar: se agrega la nueva en el mismo lugar, se le pasan
   * las opciones que ya tenía y se quita la anterior.
   */
  function handleCambiarTexto(
    item: PreguntaEncuesta,
    seleccion: SeleccionCatalogo,
  ): void {
    void conGuardado(async () => {
      const idPregunta = await idPreguntaDe(seleccion)
      if (idPregunta === item.pregunta.idPregunta) return
      const nueva = await agregarPreguntaEncuesta(idEncuesta, {
        idPregunta,
        idTipoRespuesta: item.tipoRespuesta.idTipoRespuesta,
        orden: item.orden,
      })
      for (const opcion of opcionesPorPregunta[item.idEncuestaPregunta] ?? []) {
        await agregarOpcionEncuesta(
          idEncuesta,
          nueva.idEncuestaPregunta,
          opcion.idOpcion,
        )
      }
      await quitarPreguntaEncuesta(idEncuesta, item.idEncuestaPregunta)
      await cargar()
    })
  }

  function handleCambiarTipo(
    item: PreguntaEncuesta,
    idTipoRespuesta: number,
  ): void {
    if (idTipoRespuesta === item.tipoRespuesta.idTipoRespuesta) return
    void conGuardado(async () => {
      const fila = await cambiarTipoRespuestaEncuesta(
        idEncuesta,
        item.idEncuestaPregunta,
        idTipoRespuesta,
      )
      setItems((prev) =>
        prev.map((x) =>
          x.idEncuestaPregunta === fila.idEncuestaPregunta ? fila : x,
        ),
      )
      // La caché de opciones queda obsoleta con el tipo nuevo.
      setOpcionesPorPregunta((prev) => {
        const copia = { ...prev }
        delete copia[item.idEncuestaPregunta]
        return copia
      })
      if (!esTipoAbierto(fila.tipoRespuesta.tipoRespuesta)) {
        const opciones = await listarOpcionesEncuesta(
          idEncuesta,
          fila.idEncuestaPregunta,
        )
        setOpcionesPorPregunta((prev) => ({
          ...prev,
          [fila.idEncuestaPregunta]: opciones,
        }))
      }
    })
  }

  function handleQuitar(item: PreguntaEncuesta): void {
    if (
      !window.confirm(
        `¿Quitar «${item.pregunta.pregunta}» de esta encuesta?`,
      )
    ) {
      return
    }
    void conGuardado(async () => {
      await quitarPreguntaEncuesta(idEncuesta, item.idEncuestaPregunta)
      await cargar()
    })
  }

  function handleAgregarOpcion(
    item: PreguntaEncuesta,
    seleccion: SeleccionCatalogo,
    peso: number | null,
  ): void {
    void conGuardado(async () => {
      const actuales = opcionesPorPregunta[item.idEncuestaPregunta] ?? []
      const pesos = actuales
        .map((opcion) => opcion.peso)
        .filter((valor): valor is number => valor !== null)
      const pesoSiguiente = pesos.length > 0 ? Math.max(...pesos) + 1 : 1
      const idOpcion = await idOpcionDe(seleccion, peso, pesoSiguiente)
      const lista = await agregarOpcionEncuesta(
        idEncuesta,
        item.idEncuestaPregunta,
        idOpcion,
      )
      setOpcionesPorPregunta((prev) => ({
        ...prev,
        [item.idEncuestaPregunta]: lista,
      }))
    })
  }

  function handleQuitarOpcion(item: PreguntaEncuesta, idOpcion: number): void {
    void conGuardado(async () => {
      const lista = await quitarOpcionEncuesta(
        idEncuesta,
        item.idEncuestaPregunta,
        idOpcion,
      )
      setOpcionesPorPregunta((prev) => ({
        ...prev,
        [item.idEncuestaPregunta]: lista,
      }))
    })
  }

  /**
   * Una opción del catálogo es un texto con su peso, y editarla en el catálogo
   * cambiaría todas las encuestas que la usan. Por eso aquí se busca (o se da
   * de alta) el renglón con el texto y peso nuevos, se agrega a la pregunta y
   * se quita el anterior: las demás encuestas no se enteran.
   */
  function handleEditarOpcion(
    item: PreguntaEncuesta,
    opcion: Opcion,
    texto: string,
    peso: number | null,
  ): Promise<boolean> {
    return conGuardado(async () => {
      const nueva = await createOpcion({
        opcion: texto,
        peso: peso ?? undefined,
      })
      setCatalogoOpciones((prev) =>
        prev.some((o) => o.idOpcion === nueva.idOpcion) ? prev : [...prev, nueva],
      )
      if (nueva.idOpcion === opcion.idOpcion) return true
      const actuales = opcionesPorPregunta[item.idEncuestaPregunta] ?? []
      if (actuales.some((o) => o.idOpcion === nueva.idOpcion)) {
        throw new ApiError(
          `La pregunta ya tiene la opción «${nueva.opcion}» con peso ${nueva.peso ?? '—'}.`,
          409,
        )
      }
      // Primero se agrega y luego se quita, para que la pregunta nunca se
      // quede sin opciones a medio camino.
      await agregarOpcionEncuesta(idEncuesta, item.idEncuestaPregunta, nueva.idOpcion)
      const lista = await quitarOpcionEncuesta(
        idEncuesta,
        item.idEncuestaPregunta,
        opcion.idOpcion,
      )
      setOpcionesPorPregunta((prev) => ({
        ...prev,
        [item.idEncuestaPregunta]: lista,
      }))
      return true
    }).then((resultado) => resultado === true)
  }

  async function guardarOrden(lista: PreguntaEncuesta[]): Promise<void> {
    const envio = ++ultimoOrden.current
    const resultado = await conGuardado(() =>
      reordenarPreguntasEncuesta(
        idEncuesta,
        lista.map((item) => item.idEncuestaPregunta),
      ),
    )
    if (envio !== ultimoOrden.current) return
    if (resultado) {
      setItems(resultado)
    } else {
      // Si el guardado falló, en pantalla quedó un orden que no existe.
      await cargar()
    }
  }

  function mover(desde: number, hasta: number): void {
    if (hasta < 0 || hasta >= items.length || desde === hasta) return
    const copia = [...items]
    const [movido] = copia.splice(desde, 1)
    copia.splice(hasta, 0, movido)
    setItems(copia)
    void guardarOrden(copia)
  }

  function handleDragStart(indice: number, event: React.DragEvent): void {
    // dataTransfer es necesario para que el arrastre inicie en Firefox.
    event.dataTransfer.setData('text/plain', '')
    event.dataTransfer.effectAllowed = 'move'
    dragDesde.current = indice
    setArrastrando(indice)
  }

  function handleDragEnter(indice: number): void {
    const desde = dragDesde.current
    if (desde === null || desde === indice) return
    const copia = [...items]
    const [movido] = copia.splice(desde, 1)
    copia.splice(indice, 0, movido)
    setItems(copia)
    dragDesde.current = indice
    setArrastrando(indice)
  }

  function handleDragEnd(): void {
    const moviendo = dragDesde.current !== null
    dragDesde.current = null
    setArrastrando(null)
    // El orden ya está en pantalla; aquí recién se guarda.
    if (moviendo) void guardarOrden(items)
  }

  const volver = (
    <Link
      to={idValido ? `/dashboard/encuestas/${idEncuesta}` : '/dashboard'}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-azul-unam no-underline hover:underline"
    >
      ← Volver a la encuesta
    </Link>
  )

  if (!idValido || errorCarga) {
    return (
      <AppLayout>
        {volver}
        <section className="mt-4 bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
          <h1 className="text-ink">Encuesta no disponible</h1>
          <p className="mt-2">
            {idValido
              ? errorCarga
              : 'El identificador de la encuesta no es válido.'}
          </p>
        </section>
      </AppLayout>
    )
  }

  if (cargando || !encuesta) {
    return (
      <AppLayout>
        {volver}
        <p className="mt-4">Cargando…</p>
      </AppLayout>
    )
  }

  const estado = calcularEstado(encuesta)
  const editable = estado === 'borrador' || estado === 'programada'
  const ocupada = enVuelo > 0
  const yaEnLaEncuesta = new Set(items.map((item) => item.pregunta.idPregunta))
  const sugerenciasPreguntas: ItemCatalogo[] = catalogoPreguntas.map((p) => ({
    id: p.idPregunta,
    texto: p.pregunta,
  }))
  const sugerenciasNuevas = sugerenciasPreguntas.filter(
    (sugerencia) => !yaEnLaEncuesta.has(sugerencia.id),
  )

  return (
    <AppLayout>
      {volver}

      <section className="mt-4 bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-ink break-words">{encuesta.titulo}</h1>
            <p className="mt-1 text-sm opacity-70">
              Preguntas de la encuesta · {items.length}
              {items.length === 1 ? ' pregunta' : ' preguntas'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              aria-live="polite"
              className="text-sm font-bold text-azul-unam min-w-[76px] text-right"
            >
              {ocupada ? 'Guardando…' : guardado ? 'Guardado' : ''}
            </span>
            <EstadoBadge estado={estado} />
          </div>
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreviaAbierta(true)}
            className="text-sm font-bold rounded-lg border bg-transparent text-azul-unam border-azul-unam
              cursor-pointer px-[14px] py-2 transition-colors hover:bg-accent-soft"
          >
            Vista previa
          </button>
        </div>

        {error && (
          <p
            className="mt-4 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="alert"
          >
            {error}
          </p>
        )}

        {!editable && (
          <p className="mt-4 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam">
            La encuesta ya inició o está cerrada: puedes consultar sus preguntas,
            pero no cambiarlas. Si necesitas una versión distinta, duplícala.
          </p>
        )}

        {items.length === 0 ? (
          <p className="mt-6 text-center opacity-70 text-sm">
            Esta encuesta todavía no tiene preguntas.
          </p>
        ) : (
          <ol className="m-0 mt-5 p-0 list-none flex flex-col gap-3">
            {items.map((item, indice) => (
              <TarjetaPregunta
                key={item.idEncuestaPregunta}
                item={item}
                indice={indice}
                total={items.length}
                editable={editable}
                ocupada={ocupada}
                arrastrando={arrastrando === indice}
                tipos={tipos}
                sugerenciasPreguntas={sugerenciasPreguntas}
                sugerenciasOpciones={sugerenciasDeOpciones(catalogoOpciones)}
                opciones={
                  esTipoAbierto(item.tipoRespuesta.tipoRespuesta)
                    ? []
                    : opcionesPorPregunta[item.idEncuestaPregunta]
                }
                onCambiarTexto={handleCambiarTexto}
                onCambiarTipo={handleCambiarTipo}
                onMover={mover}
                onQuitar={handleQuitar}
                onAgregarOpcion={handleAgregarOpcion}
                onQuitarOpcion={handleQuitarOpcion}
                onEditarOpcion={handleEditarOpcion}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
              />
            ))}
          </ol>
        )}

        {editable && (
          <div className="mt-4 rounded-xl border border-dashed border-azul-unam/50 p-4 sm:p-5">
            <p className="m-0 text-sm font-bold text-ink">Agregar pregunta</p>
            <p className="mt-1 text-xs opacity-70">
              Escríbela: si no está en el catálogo se da de alta y queda
              disponible para las demás encuestas.
            </p>
            <div className="mt-3">
              <SelectorCatalogo
                etiqueta="Pregunta nueva"
                placeholder="Escribe la pregunta…"
                sugerencias={sugerenciasNuevas}
                disabled={ocupada}
                limpiarAlConfirmar
                onConfirmar={handleAgregarPregunta}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold opacity-70">
                Se responde con:
              </span>
              {tipos.map((tipo) => (
                <button
                  key={tipo.idTipoRespuesta}
                  type="button"
                  aria-pressed={tipo.idTipoRespuesta === idTipoNueva}
                  onClick={() => setIdTipoNueva(tipo.idTipoRespuesta)}
                  className={`text-sm font-bold rounded-lg border px-3 py-1.5 cursor-pointer transition-colors ${
                    tipo.idTipoRespuesta === idTipoNueva
                      ? 'bg-azul-unam text-white border-azul-unam'
                      : 'bg-transparent text-azul-unam border-outline hover:bg-accent-soft'
                  }`}
                >
                  {tipo.tipoRespuesta}
                </button>
              ))}
            </div>
          </div>
        )}

        <aside className="mt-6 pt-4 border-t border-outline">
          <p className="m-0 text-sm font-bold text-ink">
            Lo que este editor no hace
          </p>
          <ul className="mt-2 mb-0 pl-5 text-sm opacity-80 flex flex-col gap-1">
            {LIMITES.map((limite) => (
              <li key={limite}>{limite}</li>
            ))}
          </ul>
        </aside>
      </section>

      {previaAbierta && (
        <VistaPreviaEncuestaModal
          encuesta={encuesta}
          onClose={() => setPreviaAbierta(false)}
        />
      )}
    </AppLayout>
  )
}

export default EncuestaPreguntas
