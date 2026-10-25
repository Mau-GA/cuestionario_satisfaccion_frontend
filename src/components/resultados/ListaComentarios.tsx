import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../types/api'
import {
  COMENTARIOS_POR_PAGINA,
  obtenerComentarios,
  type ComentariosPaginados,
} from '../../services/resultados'

interface Props {
  idEncuesta: number
  idEncuestaPregunta: number
}

function formatearFecha(valor: string): string {
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Los comentarios de texto libre viven en su propio endpoint paginado, asi que
 * cada pregunta abierta carga los suyos por separado y mantiene su propia
 * pagina. Son anonimos: el API no manda nada que identifique a quien escribio.
 */
function ListaComentarios({ idEncuesta, idEncuestaPregunta }: Props) {
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState<ComentariosPaginados | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Reintentar no vuelve a llamar a cargar() a mano: mueve este contador para
  // que el efecto corra otra vez y la peticion anterior quede cancelada por su
  // propia limpieza.
  const [intento, setIntento] = useState(0)

  // El efecto no enciende "cargando" por su cuenta: hacerlo de forma sincrona
  // dentro del efecto encadena renders. Lo prenden quien cambia de pagina y el
  // boton de reintentar, igual que hace la pantalla de resultados.
  const cargar = useCallback(() => {
    void intento
    let vigente = true
    obtenerComentarios(
      idEncuesta,
      idEncuestaPregunta,
      pagina,
      COMENTARIOS_POR_PAGINA,
    )
      .then((respuesta) => {
        if (!vigente) return
        setDatos(respuesta)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!vigente) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudieron cargar los comentarios',
        )
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [idEncuesta, idEncuestaPregunta, pagina, intento])

  useEffect(() => cargar(), [cargar])

  function irAPagina(siguiente: number) {
    setCargando(true)
    setError(null)
    setPagina(siguiente)
  }

  function reintentar() {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }

  if (cargando && datos === null) {
    return <p className="text-sm opacity-70">Cargando comentarios…</p>
  }

  // El error se muestra solo, sin el aviso de "sin comentarios": no sabemos si
  // los hay o no cuando la peticion fallo.
  if (error !== null) {
    return (
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
          className="mt-3 rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[14px] py-2 text-sm
            transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (datos === null || datos.total === 0) {
    return (
      <p className="text-sm opacity-70">Sin respuestas de texto para mostrar.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3" aria-busy={cargando}>
      <ul className="m-0 list-none p-0 flex flex-col gap-2">
        {datos.data.map((comentario) => (
          <li
            key={comentario.idEncuestaRespondida}
            className="rounded-lg border border-outline bg-surface-alt px-3 py-2 text-sm text-ink"
          >
            <p className="m-0 break-words whitespace-pre-wrap">
              {comentario.respuesta}
            </p>
            <p className="m-0 mt-1 text-xs opacity-60">
              {formatearFecha(comentario.fechaCreacion)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
        <span>
          {datos.total}{' '}
          {datos.total === 1 ? 'comentario' : 'comentarios'}
        </span>
        {datos.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={datos.page <= 1 || cargando}
              onClick={() => irAPagina(Math.max(1, datos.page - 1))}
              className="rounded-lg border border-outline bg-transparent px-3 py-1 font-bold text-azul-unam cursor-pointer
                transition-[background-color] duration-150 hover:bg-accent-soft
                disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="whitespace-nowrap">
              Página {datos.page} de {datos.totalPages}
            </span>
            <button
              type="button"
              disabled={datos.page >= datos.totalPages || cargando}
              onClick={() =>
                irAPagina(Math.min(datos.totalPages, datos.page + 1))
              }
              className="rounded-lg border border-outline bg-transparent px-3 py-1 font-bold text-azul-unam cursor-pointer
                transition-[background-color] duration-150 hover:bg-accent-soft
                disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListaComentarios
