import { ESTADO_LABEL, type EstadoEncuesta } from '../services/encuestas'

const ESTILOS: Record<EstadoEncuesta, string> = {
  borrador:
    'bg-accent-soft text-azul-unam border-azul-unam dark:text-oro-unam dark:border-oro-unam',
  programada: 'bg-oro-unam text-azul-unam border-oro-unam',
  abierta: 'bg-azul-unam text-white border-azul-unam',
  cerrada: 'bg-surface-alt text-ink border-outline',
}

function EstadoBadge({ estado }: { estado: EstadoEncuesta }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[12px] font-bold tracking-[0.2px] whitespace-nowrap ${ESTILOS[estado]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {ESTADO_LABEL[estado]}
    </span>
  )
}

export default EstadoBadge
