import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Encabezado, PieDePagina } from '../components/Layout'
import { Boton } from '../components/ui'
import { Barra, Caritas, Estrellas, TextoLibre } from '../components/respuestas'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import {
  cuestionario,
  cuestionarioPorInvitacion,
  enviarRespuestas,
  enviarRespuestasInvitacion,
} from '../services/publico'
import { fecha } from '../utils/fechas'
import type { CuestionarioPublico, PreguntaPublica } from '../types/admin'

type Valor = { idOpcion: number } | { respuesta: string }

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <Encabezado />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
      <PieDePagina />
    </div>
  )
}

function Mensaje({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Marco>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-unam-azul">{titulo}</h1>
        <p className="mt-2 text-sm text-slate-600">{texto}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-unam-azul hover:underline">
          Ver otras encuestas abiertas
        </Link>
      </div>
    </Marco>
  )
}

interface Props {
  /** Por invitación, el token es de un solo uso: en vez de una regla del enlace público, es del propio token. */
  modo?: 'publico' | 'invitacion'
}

export default function Responder({ modo = 'publico' }: Props) {
  const { token = '' } = useParams<{ token: string }>()
  const obtenerCuestionario = modo === 'invitacion' ? cuestionarioPorInvitacion : cuestionario
  const mandarRespuestas = modo === 'invitacion' ? enviarRespuestasInvitacion : enviarRespuestas
  const encuesta = useCargar<CuestionarioPublico>(() => obtenerCuestionario(token))

  const [valores, setValores] = useState<Record<number, Valor>>({})
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState<{ completa: boolean } | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const respuestas = Object.entries(valores)
        // Un texto en blanco no cuenta como respuesta.
        .filter(([, v]) => !('respuesta' in v) || v.respuesta.trim().length > 0)
        .map(([id, v]) => ({ idEncuestaPregunta: Number(id), ...v }))

      if (respuestas.length === 0) {
        setError('Responde al menos una pregunta antes de enviar.')
        return
      }
      const r = await mandarRespuestas(token, respuestas)
      setListo({ completa: r.completa })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (encuesta.cargando) {
    return (
      <Marco>
        <p className="text-sm text-slate-500">Cargando…</p>
      </Marco>
    )
  }

  // El API distingue los casos; aquí solo se muestra su explicación.
  if (encuesta.error || !encuesta.datos) {
    return <Mensaje titulo="No se puede responder" texto={encuesta.error ?? 'El enlace no es válido.'} />
  }

  if (listo) {
    return (
      <Mensaje
        titulo="¡Gracias por responder!"
        texto={
          listo.completa
            ? 'Tus respuestas se registraron de forma anónima.'
            : 'Tus respuestas se registraron de forma anónima. Dejaste algunas preguntas sin contestar, y así quedaron.'
        }
      />
    )
  }

  const d = encuesta.datos

  return (
    <Marco>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-unam-azul">{d.titulo}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {d.unidadResponsable}
          {d.fechaFinVigencia && ` · abierta hasta el ${fecha(d.fechaFinVigencia)}`}
        </p>
        <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          Tus respuestas son <strong>anónimas</strong>: no se guarda ningún dato que permita saber
          quién respondió. Puedes dejar preguntas sin contestar.
        </p>
      </header>

      <form onSubmit={enviar} className="space-y-4">
        {d.preguntas.map((p) => (
          <fieldset key={p.idEncuestaPregunta} className="rounded-xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-medium text-slate-500">Pregunta {p.orden}</legend>
            <p className="mb-4 font-medium text-slate-800">{p.pregunta}</p>
            <Control
              pregunta={p}
              valor={valores[p.idEncuestaPregunta]}
              onCambiar={(v) => setValores((prev) => ({ ...prev, [p.idEncuestaPregunta]: v }))}
            />
          </fieldset>
        ))}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Boton type="submit" disabled={enviando} className="w-full py-3">
          {enviando ? 'Enviando…' : 'Enviar mis respuestas'}
        </Boton>
      </form>
    </Marco>
  )
}

function Control({
  pregunta,
  valor,
  onCambiar,
}: {
  pregunta: PreguntaPublica
  valor: Valor | undefined
  onCambiar: (v: Valor) => void
}) {
  const props = {
    idPregunta: pregunta.idEncuestaPregunta,
    opciones: pregunta.opciones,
    valor: valor && 'idOpcion' in valor ? valor.idOpcion : null,
    onElegir: (idOpcion: number) => onCambiar({ idOpcion }),
  }

  if (pregunta.opciones.length === 0) {
    return (
      <TextoLibre
        valor={valor && 'respuesta' in valor ? valor.respuesta : ''}
        onEscribir={(respuesta) => onCambiar({ respuesta })}
      />
    )
  }

  switch (pregunta.tipoRespuesta.trim().toLowerCase()) {
    case 'estrellas':
      return <Estrellas {...props} />
    case 'barra':
      return <Barra {...props} />
    // Caritas es el predeterminado: si aparece un tipo nuevo en el catálogo,
    // la encuesta se puede responder igual en vez de quedar en blanco.
    default:
      return <Caritas {...props} />
  }
}
