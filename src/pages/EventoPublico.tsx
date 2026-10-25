import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { TarjetaEncuesta } from '../components/TarjetasPublicas'
import { cierre } from '../components/publico/fechas'
import {
  obtenerEventoPublico,
  type EventoPublico as Evento,
} from '../services/inicioPublico'
import { ApiError } from '../types/api'

/**
 * FE-31: las encuestas de un evento, abiertas a cualquiera. Mismo layout de
 * tarjetas que el inicio; el API ya aplica aqui los mismos filtros, asi que no
 * se ve nada que no se viera alla.
 */
function EventoPublico() {
  const { idEvento } = useParams<{ idEvento: string }>()
  const id = Number(idEvento)
  const idValido = Number.isFinite(id) && id > 0

  const [evento, setEvento] = useState<Evento | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const cargar = useCallback(() => {
    void intento
    if (!idValido) return
    let vigente = true
    obtenerEventoPublico(id)
      .then((res) => {
        if (!vigente) return
        setEvento(res)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!vigente) return
        setEvento(null)
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Este evento no existe o ya no está disponible.'
            : err instanceof ApiError
              ? err.message
              : 'No se pudo cargar el evento',
        )
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [id, idValido, intento])

  useEffect(() => cargar(), [cargar])

  const mensaje = idValido ? error : 'Evento no válido.'

  return (
    <AppLayout>
      <div className="mb-4">
        <Link to="/" className="text-sm font-bold no-underline">
          ← Volver al inicio
        </Link>
      </div>

      {cargando && idValido ? (
        <p>Cargando evento…</p>
      ) : mensaje !== null ? (
        <div>
          <p
            className="px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="alert"
          >
            {mensaje}
          </p>
          {idValido && (
            <button
              type="button"
              onClick={() => {
                setCargando(true)
                setError(null)
                setIntento((n) => n + 1)
              }}
              className="mt-4 rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
                transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
            >
              Reintentar
            </button>
          )}
        </div>
      ) : evento !== null ? (
        <>
          <header className="rounded-xl bg-azul-unam text-white px-8 py-10 text-center flex flex-col items-center gap-2">
            <span className="text-oro-unam font-bold tracking-[0.3px]">
              {evento.unidadResponsable}
            </span>
            <h1 className="m-0 break-words">{evento.nombre}</h1>
            <p className="m-0 text-sm opacity-90">
              {cierre(evento.fechaFinVigencia)}
            </p>
          </header>

          <section className="mt-8">
            <h2 className="text-xl text-azul-unam">Encuestas de este evento</h2>
            <p className="mt-1 text-sm opacity-70">
              Puedes responder las que quieras, sin cuenta y de forma anónima.
            </p>
            <div className="mt-5">
              {evento.encuestas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline bg-surface-alt p-8 text-center">
                  <p className="text-lg font-bold text-azul-unam">
                    Este evento todavía no tiene encuestas abiertas
                  </p>
                  <p className="mt-1 text-sm opacity-70">
                    Vuelve más tarde: aquí aparecerán en cuanto se publiquen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {evento.encuestas.map((encuesta) => (
                    <TarjetaEncuesta
                      key={encuesta.tokenPublico}
                      encuesta={encuesta}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </AppLayout>
  )
}

export default EventoPublico
