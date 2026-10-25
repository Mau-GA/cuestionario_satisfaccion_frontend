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
  | { fase: 'no-disponible'; motivo: MotivoNoDisponible }

// Por qué no se puede responder. Desde BE-50 el API lo dice: manda `motivo` en
// el cuerpo del error, con su propio código por si el cliente solo mira el
// status (404 invalida, 409 no-iniciada, 410 cerrada). 'invalida' también se
// detecta antes de pedir nada, por el formato del token, y 'desconocido' queda
// para un error que no traiga motivo.
type MotivoNoDisponible = 'no-iniciada' | 'cerrada' | 'invalida' | 'desconocido'

// Los motivos que manda el API, tal como vienen en el cuerpo.
const MOTIVOS_DEL_API: Record<string, MotivoNoDisponible> = {
  invalida: 'invalida',
  'no-iniciada': 'no-iniciada',
  cerrada: 'cerrada',
}

function motivoDeError(err: unknown): MotivoNoDisponible | null {
  if (!(err instanceof ApiError)) return null
  if (err.motivo !== null && err.motivo in MOTIVOS_DEL_API) {
    return MOTIVOS_DEL_API[err.motivo]
  }
  // Un API anterior a BE-50 responde 404 sin motivo para los tres casos.
  if (err.status === 404) return 'desconocido'
  return null
}

const AVISOS_NO_DISPONIBLE: Record<
  MotivoNoDisponible,
  { titulo: string; texto: string }
> = {
  'no-iniciada': {
    titulo: 'Esta encuesta todavía no inicia',
    texto:
      'Vuelve a abrir el enlace cuando comience el periodo para responderla.',
  },
  cerrada: {
    titulo: 'Esta encuesta ya cerró',
    texto:
      'El periodo para responderla terminó y ya no se reciben respuestas. Gracias por tu interés.',
  },
  invalida: {
    titulo: 'Enlace no válido',
    texto:
      'Revisa que el enlace esté completo o pide uno nuevo a quien te lo compartió.',
  },
  desconocido: {
    titulo: 'Esta encuesta no está disponible',
    texto:
      'El enlace no existe, o la encuesta todavía no inicia o ya cerró. Si crees que es un error, contacta a quien te compartió el enlace.',
  },
}

// El API genera el token con randomBytes(32).toString('hex').
const FORMATO_TOKEN = /^[0-9a-f]{64}$/i

const CLASE_TARJETA =
  'w-full max-w-[720px] mx-auto box-border bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-5 sm:p-7'

function idCampo(pregunta: PreguntaPublica): string {
  return `pregunta-${pregunta.idEncuestaPregunta}`
}

// El backend exige una respuesta para cada pregunta activa de la encuesta,
// sin excluir las de texto libre (responder-encuesta.service.ts valida que
// `respuesta` no venga vacío también para el tipo 'texto'), así que aquí
// todas son obligatorias.
function esObligatoria(): boolean {
  return true
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

function estadoInicial(token: string): Estado {
  if (!FORMATO_TOKEN.test(token)) {
    return { fase: 'no-disponible', motivo: 'invalida' }
  }
  if (yaRespondida(token)) return { fase: 'respondida' }
  return { fase: 'cargando' }
}

function estadoDeCarga(err: unknown): Estado {
  const motivo = motivoDeError(err)
  if (motivo !== null) {
    return { fase: 'no-disponible', motivo }
  }
  return {
    fase: 'error',
    mensaje:
      err instanceof ApiError ? err.message : 'No se pudo cargar la encuesta.',
  }
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
  // key={token} fuerza un remount completo al cambiar de encuesta por
  // navegación cliente (sin recarga), para que el estado de la anterior
  // nunca se le quede pegado a la nueva.
  return <ResponderEncuestaDeToken key={token} token={token} />
}

function ResponderEncuestaDeToken({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>(() => estadoInicial(token))
  const [valores, setValores] = useState<Record<number, ValorRespuesta>>({})
  const [errores, setErrores] = useState<Record<number, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  useEffect(() => {
    if (estadoInicial(token).fase !== 'cargando') return
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
        if (vigente) setEstado(estadoDeCarga(err))
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
        esObligatoria() &&
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

    // Ya se validó arriba que no falta ninguna obligatoria (ahora todas lo
    // son), así que esto manda una respuesta por cada pregunta activa, como
    // lo exige el backend.
    const respuestas: RespuestaEnviada[] = encuesta.preguntas.map(
      (pregunta) => {
        const valor = valores[pregunta.idEncuestaPregunta]
        if (typeof valor === 'number') {
          return {
            idEncuestaPregunta: pregunta.idEncuestaPregunta,
            idOpcion: valor,
          }
        }
        return {
          idEncuestaPregunta: pregunta.idEncuestaPregunta,
          respuesta: typeof valor === 'string' ? valor.trim() : '',
        }
      },
    )

    setEnviando(true)
    setErrorEnvio(null)
    try {
      await enviarRespuestas(token, respuestas)
      marcarRespondida(token)
      setEstado({ fase: 'enviada' })
    } catch (err) {
      // Si la encuesta dejo de estar disponible entre que se cargo y se envio,
      // el aviso sustituye al formulario: ya no hay nada que reintentar.
      const motivo = motivoDeError(err)
      if (motivo !== null) {
        setEstado({ fase: 'no-disponible', motivo })
        return
      }
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

  if (estado.fase === 'no-disponible') {
    const aviso = AVISOS_NO_DISPONIBLE[estado.motivo]
    return (
      <Aviso titulo={aviso.titulo}>
        <p>{aviso.texto}</p>
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
        <h1 className="text-ink [overflow-wrap:anywhere]">{encuesta.titulo}</h1>
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
                requerida={esObligatoria()}
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
