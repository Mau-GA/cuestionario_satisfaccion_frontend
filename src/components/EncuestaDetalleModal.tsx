import { Fragment, useEffect } from 'react'
import EstadoBadge from './EstadoBadge'
import {
  calcularEstado,
  type Encuesta,
  type EstadoEncuesta,
} from '../services/encuestas'

interface Props {
  encuesta: Encuesta
  onClose: () => void
}

function formatFechaHora(iso: string | null): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function motivoBloqueo(encuesta: Encuesta, estado: EstadoEncuesta): string {
  if (estado === 'abierta') {
    return `Esta encuesta inició el ${formatFechaHora(encuesta.fechaInicioVigencia)} y ya está recibiendo respuestas. Para que todas las personas contesten exactamente lo mismo, ya no se puede editar.`
  }
  return 'Esta encuesta ya está cerrada. Se conserva tal como se aplicó para que sus resultados sigan siendo válidos.'
}

function EncuestaDetalleModal({ encuesta, onClose }: Props) {
  const estado = calcularEstado(encuesta)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const datos: [string, string][] = [
    ['Tipo', encuesta.tipoEncuesta?.tipoEncuesta ?? '—'],
    ['Unidad responsable', encuesta.unidadResponsable?.nombre ?? '—'],
    ['Inicio de vigencia', formatFechaHora(encuesta.fechaInicioVigencia)],
    ['Fin de vigencia', formatFechaHora(encuesta.fechaFinVigencia)],
  ]

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-encuesta-titulo"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-6 box-border"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="detalle-encuesta-titulo" className="text-ink text-[20px]">
              {encuesta.titulo}
            </h2>
            <p className="mt-1 text-sm opacity-70">Solo lectura</p>
          </div>
          <EstadoBadge estado={estado} />
        </header>

        <p className="m-0 mb-5 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam">
          {motivoBloqueo(encuesta, estado)} Si necesitas una versión distinta,
          usa <strong>Duplicar</strong>: la copia se crea editable.
        </p>

        <dl className="m-0 grid grid-cols-1 min-[520px]:grid-cols-[auto_1fr] gap-x-6 gap-y-1 min-[520px]:gap-y-3 text-sm">
          {datos.map(([etiqueta, valor]) => (
            <Fragment key={etiqueta}>
              <dt className="font-semibold text-ink mt-2 min-[520px]:mt-0">
                {etiqueta}
              </dt>
              <dd className="m-0">{valor}</dd>
            </Fragment>
          ))}
        </dl>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
            transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default EncuestaDetalleModal
