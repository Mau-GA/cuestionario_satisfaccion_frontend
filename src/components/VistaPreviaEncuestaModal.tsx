import { useCallback, useEffect, useState } from 'react'
import RespuestaPregunta from './respuestas/RespuestaPregunta'
import {
  listarOpcionesEncuesta,
  listarPreguntasEncuesta,
  type PreguntaEncuesta,
} from '../services/armado'
import type { Encuesta } from '../services/encuestas'
import type { Opcion } from '../types/catalogos'
import { ApiError } from '../types/api'
import type { OpcionRespuesta, ValorRespuesta } from '../types/respuestas'

const CLASE_TARJETA =
  'w-full max-w-[720px] max-h-[88vh] overflow-y-auto mx-auto box-border bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-5 sm:p-7'

const CLASE_OJIVA =
  'inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-oro-unam/20 text-azul-unam border border-oro-unam'

interface Props {
  encuesta: Encuesta
  onClose: () => void
}

// FE-18: replica exacta de la vista del encuestado reutilizando los
// componentes de respuesta de FE-22; los valores viven solo en memoria.
function VistaPreviaEncuestaModal({ encuesta, onClose }: Props) {
  const [preguntas, setPreguntas] = useState<PreguntaEncuesta[]>([])
  const [opcionesPorPregunta, setOpcionesPorPregunta] = useState<
    Record<number, Opcion[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<number, ValorRespuesta>>({})

  // El texto ('texto') es la única respuesta abierta; las cerradas traen sus
  // opciones desde BE-23 en la propia carga inicial.
  const esAbierta = (tipo: string): boolean => tipo.trim().toLowerCase() === 'texto'

  const cargar = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await listarPreguntasEncuesta(encuesta.idEncuesta)
      const filas = [...res].sort((a, b) => a.orden - b.orden)
      const cerradas = filas.filter(
        (item) => !esAbierta(item.tipoRespuesta.tipoRespuesta),
      )
      // Opciones de todas las preguntas cerradas en paralelo; si una falla
      // solo esa pregunta muestra el mensaje y el resto sigue intacta.
      const resultados = await Promise.allSettled(
        cerradas.map((item) =>
          listarOpcionesEncuesta(encuesta.idEncuesta, item.idEncuestaPregunta),
        ),
      )
      const mapa: Record<number, Opcion[]> = {}
      const fallos: string[] = []
      cerradas.forEach((item, i) => {
        const r = resultados[i]
        if (r.status === 'fulfilled') {
          mapa[item.idEncuestaPregunta] = r.value
        } else {
          const msg =
            r.reason instanceof ApiError
              ? r.reason.message
              : 'Error inesperado'
          fallos.push(`Opciones de «${item.pregunta.pregunta}»: ${msg}`)
        }
      })
      if (fallos.length > 0) {
        setError(fallos.join(' · '))
      }
      setOpcionesPorPregunta(mapa)
      setPreguntas(filas)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }, [encuesta.idEncuesta])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar()
  }, [cargar])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function cambiarValor(idPregunta: number, valor: ValorRespuesta): void {
    setValores((previos) => ({ ...previos, [idPregunta]: valor }))
  }

  // Mismo mapeo que la vista pública: el encuestado no ve los pesos.
  const aOpciones = (opciones: Opcion[]): OpcionRespuesta[] =>
    opciones.map((opcion) => ({
      idOpcion: opcion.idOpcion,
      etiqueta: opcion.opcion,
      peso: null,
    }))

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="previa-titulo"
      onClick={onClose}
    >
      <section className={CLASE_TARJETA} onClick={(event) => event.stopPropagation()}>
        <header>
          <h1 id="previa-titulo" className="text-ink break-words">
            {encuesta.titulo}
          </h1>
          <p className="mt-1 text-sm">
            <span className={CLASE_OJIVA}>Vista previa</span>{' '}
            Nada se guarda: es exactamente lo que verá quien responde,
            incluyendo el orden y el tipo de cada pregunta.
          </p>
        </header>

        {error && (
          <p
            className="mt-4 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-6">Cargando…</p>
        ) : preguntas.length === 0 ? (
          <p className="mt-6">Esta encuesta todavía no tiene preguntas.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-8">
            {preguntas.map((item, i) => {
              const tipo = item.tipoRespuesta.tipoRespuesta
              const idPregunta = item.idEncuestaPregunta
              return (
                <RespuestaPregunta
                  key={idPregunta}
                  id={`previa-${idPregunta}`}
                  tipo={tipo}
                  pregunta={`${i + 1}. ${item.pregunta.pregunta}`}
                  opciones={
                    esAbierta(tipo) ? [] : aOpciones(opcionesPorPregunta[idPregunta] ?? [])
                  }
                  valor={valores[idPregunta] ?? null}
                  onChange={(valor) => cambiarValor(idPregunta, valor)}
                  requerida={false}
                  error={null}
                />
              )
            })}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </section>
    </div>
  )
}

export default VistaPreviaEncuestaModal
