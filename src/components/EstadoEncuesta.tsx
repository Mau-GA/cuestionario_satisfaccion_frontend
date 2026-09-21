import type { EstadoEncuesta } from '../types/admin'

const estilos: Record<EstadoEncuesta, { clase: string; texto: string }> = {
  borrador: { clase: 'bg-slate-100 text-slate-600', texto: 'Borrador' },
  programada: { clase: 'bg-amber-50 text-amber-700', texto: 'Programada' },
  abierta: { clase: 'bg-emerald-50 text-emerald-700', texto: 'Abierta' },
  cerrada: { clase: 'bg-slate-200 text-slate-700', texto: 'Cerrada' },
}

export function EstadoPill({ estado }: { estado: EstadoEncuesta }) {
  const { clase, texto } = estilos[estado]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${clase}`}>{texto}</span>
}
