import { Barra, Caritas, Estrellas, TextoLibre } from './respuestas'
import type { OpcionPublica, PreguntaDeEncuesta } from '../types/admin'

/**
 * La encuesta como la verá quien responda, atenuada y sin poder tocarse.
 *
 * Se arma con los mismos componentes de la pantalla pública: el objetivo es que
 * quien la construye vea exactamente lo que va a salir, sin tener que abrir el
 * enlace en otra pestaña para enterarse.
 */
export function VistaPreviaEncuesta({
  preguntas,
  editable,
  onMover,
  onQuitar,
}: {
  preguntas: PreguntaDeEncuesta[]
  editable: boolean
  onMover: (indice: number, direccion: -1 | 1) => void
  onQuitar: (idEncuestaPregunta: number) => void
}) {
  if (preguntas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600">La encuesta todavía no tiene preguntas.</p>
        <p className="mt-1 text-sm text-slate-500">
          Agrega la primera con el botón de abajo y aquí irás viendo cómo queda.
        </p>
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {preguntas.map((p, i) => (
        <li key={p.idEncuestaPregunta} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium text-slate-800">
              <span className="text-slate-400">{p.orden}.</span> {p.pregunta}
            </p>
            {editable && (
              <div className="flex shrink-0 gap-1">
                <Control etiqueta="Subir" deshabilitado={i === 0} onClick={() => onMover(i, -1)}>
                  ↑
                </Control>
                <Control
                  etiqueta="Bajar"
                  deshabilitado={i === preguntas.length - 1}
                  onClick={() => onMover(i, 1)}
                >
                  ↓
                </Control>
                <Control etiqueta="Quitar" onClick={() => onQuitar(p.idEncuestaPregunta)}>
                  ✕
                </Control>
              </div>
            )}
          </div>

          {/* `inert`: es la encuesta vista, no contestada. */}
          <div inert className="mt-4 opacity-60">
            <Control2 tipoRespuesta={p.tipoRespuesta} opciones={p.opciones} />
          </div>
        </li>
      ))}
    </ol>
  )
}

function Control({
  etiqueta,
  onClick,
  deshabilitado,
  children,
}: {
  etiqueta: string
  onClick: () => void
  deshabilitado?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={etiqueta}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={onClick}
      className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Control2({
  tipoRespuesta,
  opciones,
}: {
  tipoRespuesta: string
  opciones: OpcionPublica[]
}) {
  const props = { idPregunta: 0, opciones, valor: null, onElegir: () => {} }

  if (opciones.length === 0) return <TextoLibre valor="" onEscribir={() => {}} />
  switch (tipoRespuesta.trim().toLowerCase()) {
    case 'estrellas':
      return <Estrellas {...props} />
    case 'barra':
      return <Barra {...props} />
    default:
      return <Caritas {...props} />
  }
}
