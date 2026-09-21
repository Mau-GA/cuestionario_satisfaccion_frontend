import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/http'

function mensaje(e: unknown) {
  return e instanceof ApiError ? e.message : 'No se pudo cargar la información'
}

/**
 * Carga datos del API al montar y expone estado, error y `recargar`.
 *
 * El cargador se guarda en un ref porque las páginas lo definen inline: su
 * identidad cambia en cada render y usarlo como dependencia dispararía una
 * petición por render.
 */
export function useCargar<T>(cargar: () => Promise<T>) {
  const cargarRef = useRef(cargar)
  useEffect(() => {
    cargarRef.current = cargar
  })

  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  /** Para volver a pedir los datos desde un manejador de eventos. */
  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setDatos(await cargarRef.current())
    } catch (e) {
      setError(mensaje(e))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // `vigente` evita escribir estado si el componente se desmontó durante la
    // petición, que es lo normal al navegar rápido entre pantallas.
    let vigente = true
    void (async () => {
      try {
        const resultado = await cargarRef.current()
        if (vigente) setDatos(resultado)
      } catch (e) {
        if (vigente) setError(mensaje(e))
      } finally {
        if (vigente) setCargando(false)
      }
    })()
    return () => {
      vigente = false
    }
  }, [])

  return { datos, error, cargando, recargar, setError }
}
