import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import RespuestaPregunta from '../components/respuestas/RespuestaPregunta'
import {
  enviarRespuestas,
  marcarRespondida,
  obtenerEncuestaPublica,
  yaRespondida,
} from '../services/encuestaPublica'
import { ApiError } from '../types/api'
import type {
  EncuestaPublica,
  PreguntaPublica,
  RespuestaEnviada,
} from '../types/encuestasPublicas'
import type { OpcionRespuesta, ValorRespuesta } from '../types/respuestas'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'lista'; encuesta: EncuestaPublica }
  | { fase: 'enviada' }
  | { fase: 'respondida' }

const CLASE_TARJETA =
  'w-full max-w-[720px] mx-auto box-border bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-5 sm:p-7'

function idCampo(pregunta: PreguntaPublica): string {
  return `pregunta-${pregunta.idEncuestaPregunta}`
}

function esObligatoria(pregunta: PreguntaPublica): boolean {
  return pregunta.tipoRespuesta.tipoRespuesta.trim().toLowerCase() !== 'texto'
}

function estaVacia(valor: ValorRespuesta | undefined): boolean {
  if (valor === undefined || valor === null) return true
  return typeof valor === 'string' && valor.trim() === ''
}

function aOpciones(pregunta: PreguntaPublica): OpcionRespuesta[] {
  return pregunta.opciones.map((opcion) => ({
    idOpcion: opcion.idOpcion,
    etiqueta: opcion.opcion,
    peso: null,
  }))
}

function mensajeDeCarga(err: unknown): string {
  if (err instanceof ApiError && err.status === 404) {
    return 'Esta encuesta no existe o ya no está disponible.'
  }
  if (err instanceof ApiError) return err.message
  return 'No se pudo cargar la encuesta.'
}

function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <AppLayout>
      <section className={`${CLASE_TARJETA} text-center`}>
        <h1 className="text-ink">{titulo}</h1>
        <div className="mt-2">{children}</div>
      </section>
    </AppLayout>
  )
}

function ResponderEncuesta() {
  const { token = '' } = useParams()
  const [estado, setEstado] = useState<Estado>(() =>
    yaRespondida(token) ? { fase: 'respondida' } : { fase: 'cargando' },
  )
  const [valores, setValores] = useState<Record<number, ValorRespuesta>>({})
  const [errores, setErrores] = useState<Record<number, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  useEffect(() => {
    if (yaRespondida(token)) return
    let vigente = true
    obtenerEncuestaPublica(token)
      .then((encuesta) => {
        if (!vigente) return
        const preguntas = [...encuesta.preguntas].sort(
          (a, b) => a.orden - b.orden,
        )
        setEstado({ fase: 'lista', encuesta: { ...encuesta, preguntas } })
      })
      .catch((err) => {
        if (vigente) setEstado({ fase: 'error', mensaje: mensajeDeCarga(err) })
      })
    return () => {
      vigente = false
    }
  }, [token])

  function cambiarValor(idPregunta: number, valor: ValorRespuesta): void {
    setValores((previos) => ({ ...previos, [idPregunta]: valor }))
    setErrores((previos) => {
      if (!previos[idPregunta]) return previos
      const resto = { ...previos }
      delete resto[idPregunta]
      return resto
    })
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    encuesta: EncuestaPublica,
  ): Promise<void> {
    event.preventDefault()
    if (enviando) return

    const faltantes: Record<number, string> = {}
    for (const pregunta of encuesta.preguntas) {
      if (
        esObligatoria(pregunta) &&
        estaVacia(valores[pregunta.idEncuestaPregunta])
      ) {
        faltantes[pregunta.idEncuestaPregunta] = 'Esta pregunta es obligatoria.'
      }
    }
    setErrores(faltantes)

    const primera = encuesta.preguntas.find(
      (pregunta) => faltantes[pregunta.idEncuestaPregunta],
    )
    if (primera) {
      document
        .getElementById(`${idCampo(primera)}-legend`)
        ?.closest('fieldset')
        ?.querySelector<HTMLElement>('input, textarea')
        ?.focus()
      return
    }

    const respuestas: RespuestaEnviada[] = []
    for (const pregunta of encuesta.preguntas) {
      const valor = valores[pregunta.idEncuestaPregunta]
      if (typeof valor === 'number') {
        respuestas.push({
          idEncuestaPregunta: pregunta.idEncuestaPregunta,
          idOpcion: valor,
        })
      } else if (typeof valor === 'string' && valor.trim()) {
        respuestas.push({
          idEncuestaPregunta: pregunta.idEncuestaPregunta,
          texto: valor.trim(),
        })
      }
    }

    setEnviando(true)
    setErrorEnvio(null)
    try {
      await enviarRespuestas(token, respuestas)
      marcarRespondida(token)
      setEstado({ fase: 'enviada' })
    } catch (err) {
      setErrorEnvio(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron enviar tus respuestas. Intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  if (estado.fase === 'cargando') {
    return (
      <Aviso titulo="Cargando encuesta…">
        <p>Un momento, por favor.</p>
      </Aviso>
    )
  }

  if (estado.fase === 'error') {
    return (
      <Aviso titulo="No pudimos abrir la encuesta">
        <p>{estado.mensaje}</p>
      </Aviso>
    )
  }

  if (estado.fase === 'enviada') {
    return (
      <Aviso titulo="¡Gracias por responder!">
        <p>Tus respuestas se registraron de forma anónima.</p>
      </Aviso>
    )
  }

  if (estado.fase === 'respondida') {
    return (
      <Aviso titulo="Ya respondiste esta encuesta">
        <p>Gracias por tu participación.</p>
      </Aviso>
    )
  }

  const { encuesta } = estado
  const { preguntas } = encuesta
  const totalFaltantes = Object.keys(errores).length

  return (
    <AppLayout>
      <section className={CLASE_TARJETA}>
        <h1 className="text-ink">{encuesta.titulo}</h1>
        <p className="mt-2 text-sm">
          Tus respuestas son anónimas. Las preguntas marcadas con{' '}
          <span className="text-red-600">*</span> son obligatorias.
        </p>

        {preguntas.length === 0 ? (
          <p className="mt-6">Esta encuesta todavía no tiene preguntas.</p>
        ) : (
          <form
            noValidate
            className="mt-6 flex flex-col gap-8"
            onSubmit={(event) => void handleSubmit(event, encuesta)}
          >
            {preguntas.map((pregunta, i) => (
              <RespuestaPregunta
                key={pregunta.idEncuestaPregunta}
                id={idCampo(pregunta)}
                tipo={pregunta.tipoRespuesta.tipoRespuesta}
                pregunta={`${i + 1}. ${pregunta.pregunta.pregunta}`}
                opciones={aOpciones(pregunta)}
                valor={valores[pregunta.idEncuestaPregunta] ?? null}
                onChange={(valor) =>
                  cambiarValor(pregunta.idEncuestaPregunta, valor)
                }
                requerida={esObligatoria(pregunta)}
                error={errores[pregunta.idEncuestaPregunta] ?? null}
                deshabilitado={enviando}
              />
            ))}

            {totalFaltantes > 0 && (
              <p
                role="alert"
                className="m-0 px-[14px] py-3 rounded-lg text-sm font-bold text-red-700 border border-red-600"
              >
                {totalFaltantes === 1
                  ? 'Te falta responder 1 pregunta obligatoria.'
                  : `Te faltan ${totalFaltantes} preguntas obligatorias.`}
              </p>
            )}

            {errorEnvio && (
              <p
                role="alert"
                className="m-0 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam"
              >
                {errorEnvio}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full sm:w-auto sm:self-end rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
                transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Enviar respuestas'}
            </button>
          </form>
        )}
      </section>
    </AppLayout>
  )
}

export default ResponderEncuesta
