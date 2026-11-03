import { Fragment, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import EstadoBadge from '../components/EstadoBadge'
import EncuestaFormModal from '../components/EncuestaFormModal'
import ConstructorPreguntasModal from '../components/ConstructorPreguntasModal'
import VistaPreviaEncuestaModal from '../components/VistaPreviaEncuestaModal'
import { getSession } from '../services/auth'
import {
  accionesPorEstado,
  calcularEstado,
  cerrarEncuesta,
  duplicarEncuesta,
  eliminarEncuesta,
  esActivo,
  listTiposEncuesta,
  obtenerEncuesta,
  publicarEncuesta,
  type AccionEncuesta,
  type Encuesta,
  type EstadoEncuesta,
  type TipoEncuesta,
} from '../services/encuestas'
import { listarEventos, type Evento } from '../services/eventos'
import {
  listUnidadesActivas,
  type UnidadResponsable,
} from '../services/unidades'
import { ApiError } from '../types/api'

const LABEL_ACCION: Record<AccionEncuesta, string> = {
  armar: 'Preguntas',
  ver: 'Ver',
  editar: 'Editar',
  duplicar: 'Duplicar',
  publicar: 'Publicar',
  cerrar: 'Cerrar',
  eliminar: 'Eliminar',
}

// Sin color de fondo: cada variante pone el suyo, para no dejar dos
// utilidades de fondo peleando en la misma clase.
const CLASE_ACCION =
  'text-sm font-bold rounded-lg border cursor-pointer px-[14px] py-2 ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

const CLASE_SECUNDARIA = `${CLASE_ACCION} bg-transparent text-azul-unam border-azul-unam hover:bg-accent-soft`

const ESTILO_ACCION: Record<AccionEncuesta, string> = {
  armar: CLASE_SECUNDARIA,
  ver: CLASE_SECUNDARIA,
  editar: CLASE_SECUNDARIA,
  duplicar: CLASE_SECUNDARIA,
  publicar: `${CLASE_ACCION} bg-azul-unam text-white border-azul-unam hover:brightness-110`,
  cerrar: CLASE_SECUNDARIA,
  eliminar: `${CLASE_ACCION} bg-oro-unam text-azul-unam border-oro-unam hover:brightness-110`,
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * El mismo aviso que daba el modal de solo lectura: una encuesta deja de ser
 * editable en cuanto abre, para que todo el mundo conteste lo mismo.
 */
function motivoBloqueo(encuesta: Encuesta, estado: EstadoEncuesta): string {
  if (estado === 'abierta') {
    return `Esta encuesta inició el ${formatFechaHora(encuesta.fechaInicioVigencia)} y ya está recibiendo respuestas. Para que todas las personas contesten exactamente lo mismo, ya no se puede editar.`
  }
  return 'Esta encuesta ya está cerrada. Se conserva tal como se aplicó para que sus resultados sigan siendo válidos.'
}

function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Error inesperado'
}

/**
 * La encuesta en su propia ruta. Sustituye a los botones que vivían en
 * la columna «Acciones» del dashboard, que ahora es solo un índice: todo lo que
 * se puede hacer con una encuesta se hace desde aquí.
 */
function EncuestaDetalle() {
  const { id } = useParams<{ id: string }>()
  // Pasar de una encuesta a otra sin salir de la ruta (duplicar, p. ej.) reusa
  // el componente y la encuesta nueva heredaria el estado de la anterior: la
  // copia se quedaba con los botones bloqueados. La key lo vuelve a montar.
  return <DetalleDeEncuesta key={id} id={id} />
}

function DetalleDeEncuesta({ id }: { id: string | undefined }) {
  const idEncuesta = Number(id)
  const idValido = Number.isFinite(idEncuesta) && idEncuesta > 0

  const session = getSession()
  const navigate = useNavigate()
  const location = useLocation()

  const [encuesta, setEncuesta] = useState<Encuesta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)

  // La copia recién duplicada llega aquí con el formulario abierto: es lo que
  // hacía el dashboard, y sin eso la copia se queda sin título ni vigencia.
  const [formAbierto, setFormAbierto] = useState(
    Boolean((location.state as { editar?: boolean } | null)?.editar),
  )
  const [armarAbierto, setArmarAbierto] = useState(false)
  const [previaAbierta, setPreviaAbierta] = useState(false)

  const [tipos, setTipos] = useState<TipoEncuesta[]>([])
  const [unidades, setUnidades] = useState<UnidadResponsable[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])

  const cargar = useCallback(async (): Promise<void> => {
    if (!idValido) return
    setLoading(true)
    try {
      const res = await obtenerEncuesta(idEncuesta)
      setEncuesta(res)
      setErrorCarga(null)
    } catch (err) {
      setEncuesta(null)
      setErrorCarga(
        err instanceof ApiError && err.status === 404
          ? 'Esta encuesta no existe o no pertenece a tu unidad.'
          : getErrorMessage(err),
      )
    } finally {
      setLoading(false)
    }
  }, [idEncuesta, idValido])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  useEffect(() => {
    listTiposEncuesta()
      .then(setTipos)
      .catch(() => setTipos([]))
    listUnidadesActivas()
      .then(setUnidades)
      .catch(() => setUnidades([]))
    listarEventos()
      .then(setEventos)
      .catch(() => setEventos([]))
  }, [])

  // El aviso de «abre el formulario» es de un solo uso: si no se limpia, una
  // recarga de la página lo vuelve a abrir con el historial.
  useEffect(() => {
    if ((location.state as { editar?: boolean } | null)?.editar) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  async function handlePublicar(): Promise<void> {
    if (!encuesta) return
    // FE-50: dónde aparece la encuesta ya se decidió en el formulario, con la
    // casilla «Mostrar en la vista de inicio». Aquí solo se recuerda.
    const destino = esActivo(encuesta.visibleEnInicio)
      ? 'y aparecerá en la pantalla de inicio pública'
      : 'y solo se llegará a ella por ese enlace'
    if (
      !window.confirm(
        `¿Publicar «${encuesta.titulo}»? Se generará su enlace público ${destino}.`,
      )
    ) {
      return
    }

    setProcesando(true)
    setError(null)
    try {
      await publicarEncuesta(encuesta.idEncuesta)
      await cargar()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcesando(false)
    }
  }

  async function handleDuplicar(): Promise<void> {
    if (!encuesta) return
    setProcesando(true)
    setError(null)
    try {
      const copia = await duplicarEncuesta(encuesta.idEncuesta)
      navigate(`/dashboard/encuestas/${copia.idEncuesta}`, {
        state: { editar: true },
      })
    } catch (err) {
      setError(getErrorMessage(err))
      setProcesando(false)
    }
  }

  async function handleCerrar(accion: AccionEncuesta): Promise<void> {
    if (!encuesta) return
    const verbo = accion === 'eliminar' ? 'Eliminar' : 'Cerrar'
    const aclaracion =
      accion === 'eliminar'
        ? 'Ya no aparecerá en el listado de activas.'
        : 'La encuesta dejará de estar disponible.'
    if (!window.confirm(`¿${verbo} «${encuesta.titulo}»? ${aclaracion}`)) return

    setProcesando(true)
    setError(null)
    try {
      if (accion === 'eliminar') {
        await eliminarEncuesta(encuesta.idEncuesta)
        // Eliminada deja de estar en el listado, así que tampoco tiene ya
        // pantalla propia: se vuelve al índice.
        navigate('/dashboard', { replace: true })
        return
      }
      await cerrarEncuesta(encuesta.idEncuesta)
      await cargar()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcesando(false)
    }
  }

  const volver = (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-azul-unam no-underline hover:underline"
    >
      ← Volver a las encuestas
    </Link>
  )

  if (!idValido || errorCarga) {
    return (
      <AppLayout>
        {volver}
        <section className="mt-4 bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
          <h1 className="text-ink">Encuesta no disponible</h1>
          <p className="mt-2">
            {idValido ? errorCarga : 'El identificador de la encuesta no es válido.'}
          </p>
        </section>
      </AppLayout>
    )
  }

  if (loading || !encuesta) {
    return (
      <AppLayout>
        {volver}
        <p className="mt-4">Cargando…</p>
      </AppLayout>
    )
  }

  const estado = calcularEstado(encuesta)
  // «Ver» abría el modal de solo lectura, que es justo esta pantalla.
  const acciones = accionesPorEstado(
    estado,
    Boolean(encuesta.tokenPublico),
  ).filter((accion) => accion !== 'ver')
  const editable = estado === 'borrador' || estado === 'programada'
  const evento =
    encuesta.idEvento === null
      ? null
      : (eventos.find((item) => item.idEvento === encuesta.idEvento) ?? null)
  const enlacePublico = encuesta.tokenPublico
    ? `${window.location.origin}/responder/${encuesta.tokenPublico}`
    : null

  const datos: [string, ReactNode][] = [
    ['Tipo', encuesta.tipoEncuesta?.tipoEncuesta ?? '—'],
    ['Unidad responsable', encuesta.unidadResponsable?.nombre ?? '—'],
    [
      'Evento',
      encuesta.idEvento === null
        ? 'Sin evento (se muestra suelta)'
        : (evento?.nombre ?? `Evento ${encuesta.idEvento}`),
    ],
    ['Inicio de vigencia', formatFechaHora(encuesta.fechaInicioVigencia)],
    ['Fin de vigencia', formatFechaHora(encuesta.fechaFinVigencia)],
    [
      'Pantalla de inicio',
      esActivo(encuesta.visibleEnInicio)
        ? 'Aparece en el inicio público'
        : 'Solo se llega con el enlace',
    ],
    [
      'Enlace público',
      enlacePublico ? (
        <a
          href={enlacePublico}
          target="_blank"
          rel="noreferrer"
          className="text-azul-unam font-semibold break-all"
        >
          {enlacePublico}
        </a>
      ) : (
        'Se genera al publicar la encuesta'
      ),
    ],
  ]

  return (
    <AppLayout>
      {volver}

      <section className="mt-4 bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-ink break-words">{encuesta.titulo}</h1>
            <p className="mt-1 text-sm opacity-70">
              {encuesta.tipoEncuesta?.tipoEncuesta ?? 'Sin tipo'} ·{' '}
              {encuesta.unidadResponsable?.nombre ?? 'Sin unidad'}
            </p>
          </div>
          <EstadoBadge estado={estado} />
        </header>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            type="button"
            onClick={() => setPreviaAbierta(true)}
            className={CLASE_SECUNDARIA}
          >
            Vista previa
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/encuestas/${encuesta.idEncuesta}/resultados`)
            }
            className={CLASE_SECUNDARIA}
          >
            Resultados
          </button>
          {acciones.map((accion) => (
            <button
              key={accion}
              type="button"
              disabled={procesando}
              onClick={() => {
                if (accion === 'editar') {
                  setFormAbierto(true)
                } else if (accion === 'armar') {
                  setArmarAbierto(true)
                } else if (accion === 'duplicar') {
                  void handleDuplicar()
                } else if (accion === 'publicar') {
                  void handlePublicar()
                } else {
                  void handleCerrar(accion)
                }
              }}
              className={ESTILO_ACCION[accion]}
            >
              {LABEL_ACCION[accion]}
            </button>
          ))}
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
            {motivoBloqueo(encuesta, estado)} Si necesitas una versión distinta,
            usa <strong>Duplicar</strong>: la copia se crea editable.
          </p>
        )}

        <dl className="m-0 mt-6 grid grid-cols-1 min-[520px]:grid-cols-[auto_1fr] gap-x-6 gap-y-1 min-[520px]:gap-y-3 text-sm">
          {datos.map(([etiqueta, valor]) => (
            <Fragment key={etiqueta}>
              <dt className="font-semibold text-ink mt-2 min-[520px]:mt-0">
                {etiqueta}
              </dt>
              <dd className="m-0 break-words">{valor}</dd>
            </Fragment>
          ))}
        </dl>
      </section>

      {armarAbierto && (
        <ConstructorPreguntasModal
          encuesta={encuesta}
          onClose={() => setArmarAbierto(false)}
        />
      )}

      {previaAbierta && (
        <VistaPreviaEncuestaModal
          encuesta={encuesta}
          onClose={() => setPreviaAbierta(false)}
        />
      )}

      {formAbierto && (
        <EncuestaFormModal
          modo="editar"
          encuesta={encuesta}
          tipos={tipos}
          unidades={unidades}
          rol={session?.user.rol ?? null}
          idUnidadPredeterminada={session?.user.idUnidadResponsable ?? null}
          onClose={() => setFormAbierto(false)}
          onSaved={() => {
            setFormAbierto(false)
            void cargar()
          }}
        />
      )}
    </AppLayout>
  )
}

export default EncuestaDetalle
