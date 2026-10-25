import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import EstadoBadge from '../components/EstadoBadge'
import GraficaOpciones from '../components/resultados/GraficaOpciones'
import ListaComentarios from '../components/resultados/ListaComentarios'
import { ApiError } from '../types/api'
import {
  calcularEstado,
  type Encuesta,
} from '../services/encuestas'
import {
  obtenerEncuesta,
  obtenerResultados,
  type Participacion,
  type PreguntaResultado,
  type ResultadosEncuesta,
} from '../services/resultados'

function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Error inesperado'
}

function Dato({ etiqueta, valor, pie }: { etiqueta: string; valor: number; pie: string }) {
  return (
    <div className="rounded-xl border border-outline bg-surface-alt p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.4px] opacity-70">
        {etiqueta}
      </dt>
      <dd className="m-0 mt-1 text-3xl font-bold text-azul-unam">{valor}</dd>
      <dd className="m-0 text-xs opacity-70">{pie}</dd>
    </div>
  )
}

/**
 * Los tres numeros son los que calcula el API. Un envio esta completo cuando
 * contesto todas las preguntas activas de la encuesta; el resto quedo a medias.
 */
function TarjetaParticipacion({ participacion }: { participacion: Participacion }) {
  return (
    <dl className="grid grid-cols-1 gap-4 m-0 sm:grid-cols-3">
      <Dato
        etiqueta="Participación"
        valor={participacion.envios}
        pie={participacion.envios === 1 ? 'envío recibido' : 'envíos recibidos'}
      />
      <Dato
        etiqueta="Completos"
        valor={participacion.completos}
        pie={
          participacion.totalPreguntas === 1
            ? 'contestaron la única pregunta'
            : `contestaron las ${participacion.totalPreguntas} preguntas`
        }
      />
      <Dato
        etiqueta="Incompletos"
        valor={participacion.incompletos}
        pie="dejaron preguntas sin contestar"
      />
    </dl>
  )
}

function TarjetaPregunta({
  idEncuesta,
  pregunta,
}: {
  idEncuesta: number
  pregunta: PreguntaResultado
}) {
  const vacia = pregunta.respuestas === 0

  return (
    <article className="rounded-xl border border-outline bg-surface p-5">
      <header className="flex items-start justify-between gap-4">
        <h3 className="text-base text-azul-unam">
          {pregunta.orden}. {pregunta.pregunta}
        </h3>
        <span className="whitespace-nowrap rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-azul-unam">
          {pregunta.tipoRespuesta}
        </span>
      </header>
      <p className="mt-1 text-xs opacity-70">
        {pregunta.respuestas}{' '}
        {pregunta.respuestas === 1 ? 'respuesta' : 'respuestas'}
      </p>

      <div className="mt-4">
        {vacia ? (
          <p className="text-sm opacity-70">
            Aún no hay respuestas para esta pregunta.
          </p>
        ) : pregunta.esTextoLibre ? (
          <ListaComentarios
            idEncuesta={idEncuesta}
            idEncuestaPregunta={pregunta.idEncuestaPregunta}
          />
        ) : (
          <GraficaOpciones pregunta={pregunta} />
        )}
      </div>
    </article>
  )
}

function Resultados() {
  const { id } = useParams<{ id: string }>()
  const idEncuesta = Number(id)

  const [encuesta, setEncuesta] = useState<Encuesta | null>(null)
  const [resultados, setResultados] = useState<ResultadosEncuesta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const idValido = Number.isFinite(idEncuesta) && idEncuesta > 0

  const cargar = useCallback((): void => {
    if (!idValido) return

    Promise.all([obtenerEncuesta(idEncuesta), obtenerResultados(idEncuesta)])
      .then(([datosEncuesta, datosResultados]) => {
        setEncuesta(datosEncuesta)
        setResultados(datosResultados)
        setError(null)
      })
      .catch((err) => {
        setError(getErrorMessage(err))
        setEncuesta(null)
        setResultados(null)
      })
      .finally(() => setLoading(false))
  }, [idEncuesta, idValido])

  useEffect(() => {
    cargar()
  }, [cargar])

  const errorMostrado = idValido ? error : 'Encuesta no válida.'
  const estaCargando = idValido && loading

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to="/dashboard" className="text-sm font-bold no-underline">
          ← Volver al panel
        </Link>
      </div>

      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-ink">
              {encuesta ? encuesta.titulo : 'Resultados de la encuesta'}
            </h1>
            {encuesta && (
              <p className="mt-1 text-sm opacity-70">
                {encuesta.tipoEncuesta?.tipoEncuesta ?? 'Sin tipo'} ·{' '}
                {encuesta.unidadResponsable?.nombre ?? 'Sin unidad'}
              </p>
            )}
          </div>
          {encuesta && <EstadoBadge estado={calcularEstado(encuesta)} />}
        </header>

        {estaCargando ? (
          <p className="mt-6">Cargando resultados…</p>
        ) : errorMostrado ? (
          <div className="mt-6">
            <p
              className="px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
              role="alert"
            >
              {errorMostrado}
            </p>
            {idValido && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  cargar()
                }}
                className="mt-4 rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
                  transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : resultados ? (
          <div className="mt-6 flex flex-col gap-6">
            <TarjetaParticipacion participacion={resultados.participacion} />

            {resultados.preguntas.length === 0 ? (
              <p className="text-sm opacity-70">
                Esta encuesta todavía no tiene preguntas configuradas.
              </p>
            ) : resultados.participacion.envios === 0 ? (
              <div className="rounded-xl border border-dashed border-outline bg-surface-alt p-8 text-center">
                <p className="text-lg font-bold text-azul-unam">
                  Aún no hay respuestas
                </p>
                <p className="mt-1 text-sm opacity-70">
                  Cuando las personas respondan esta encuesta, aquí verás la
                  participación y una gráfica por pregunta.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {resultados.preguntas.map((pregunta) => (
                  <TarjetaPregunta
                    key={pregunta.idEncuestaPregunta}
                    idEncuesta={idEncuesta}
                    pregunta={pregunta}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}

export default Resultados
