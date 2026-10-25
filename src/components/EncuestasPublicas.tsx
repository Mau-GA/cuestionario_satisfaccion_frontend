import { useCallback, useEffect, useState } from 'react'
import { Tarjetas } from './TarjetasPublicas'
import { listarInicioPublico, type TarjetaPublica } from '../services/inicioPublico'
import { ApiError } from '../types/api'

/**
 * FE-25: el listado abierto de la pantalla de inicio. No pide sesion, asi que
 * lo ve igual quien entra sin cuenta y quien ya inicio sesion.
 */
function EncuestasPublicas() {
  const [tarjetas, setTarjetas] = useState<TarjetaPublica[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const cargar = useCallback(() => {
    void intento
    let vigente = true
    listarInicioPublico()
      .then((res) => {
        if (!vigente) return
        setTarjetas(res)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!vigente) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudieron cargar las encuestas',
        )
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [intento])

  useEffect(() => cargar(), [cargar])

  function reintentar() {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl text-azul-unam">Encuestas abiertas</h2>
      <p className="mt-1 text-sm opacity-70">
        Puedes responderlas sin cuenta. Tus respuestas son anónimas.
      </p>

      <div className="mt-5">
        {cargando ? (
          <p>Cargando encuestas…</p>
        ) : error !== null ? (
          <div>
            <p
              className="px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
              role="alert"
            >
              {error}
            </p>
            <button
              type="button"
              onClick={reintentar}
              className="mt-4 rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
                transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
            >
              Reintentar
            </button>
          </div>
        ) : tarjetas === null || tarjetas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline bg-surface-alt p-8 text-center">
            <p className="text-lg font-bold text-azul-unam">
              No hay encuestas abiertas ahora mismo
            </p>
            <p className="mt-1 text-sm opacity-70">
              Cuando alguna área publique una, aparecerá aquí. Si recibiste un
              enlace por correo, puedes responder desde ahí aunque no esté
              listada.
            </p>
          </div>
        ) : (
          <Tarjetas tarjetas={tarjetas} />
        )}
      </div>
    </section>
  )
}

export default EncuestasPublicas
