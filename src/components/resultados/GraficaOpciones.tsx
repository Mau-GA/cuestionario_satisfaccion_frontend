import type { ConteoOpcion, PreguntaResultado } from '../../services/resultados'
import { caritaPara, ordenarPorPeso } from '../respuestas/opciones'

interface Fila {
  clave: string
  etiqueta: string
  total: number
  peso: number | string | null
}

function filasDeOpciones(opciones: ConteoOpcion[]): Fila[] {
  const comparable = opciones.map((opcion) => ({
    idOpcion: opcion.idOpcion ?? 0,
    etiqueta: opcion.etiqueta,
    peso: opcion.peso,
  }))
  const ordenadas = ordenarPorPeso(comparable)
  return ordenadas.map((opcion) => {
    const conteo = opciones.find(
      (item) => (item.idOpcion ?? 0) === opcion.idOpcion,
    )
    return {
      clave: String(opcion.idOpcion),
      etiqueta: opcion.etiqueta,
      total: conteo?.total ?? 0,
      peso: opcion.peso,
    }
  })
}

function porcentaje(total: number, base: number): number {
  if (base <= 0) return 0
  return Math.round((total / base) * 100)
}

function GraficaBarras({
  filas,
  base,
}: {
  filas: Fila[]
  base: number
}) {
  return (
    <ul className="m-0 list-none p-0 flex flex-col gap-2.5">
      {filas.map((fila) => {
        const pct = porcentaje(fila.total, base)
        return (
          <li key={fila.clave} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="break-words text-ink">{fila.etiqueta}</span>
              <span className="whitespace-nowrap font-bold text-azul-unam">
                {fila.total} · {pct}%
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-surface-alt"
              role="img"
              aria-label={`${fila.etiqueta}: ${fila.total} respuestas (${pct}%)`}
            >
              <div
                className="h-full rounded-full bg-azul-unam transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function DistribucionCaritas({
  filas,
  base,
}: {
  filas: Fila[]
  base: number
}) {
  return (
    <ul className="m-0 list-none p-0 flex flex-col gap-2.5">
      {filas.map((fila, indice) => {
        const pct = porcentaje(fila.total, base)
        return (
          <li key={fila.clave} className="flex items-center gap-3">
            <span aria-hidden className="text-2xl leading-none">
              {caritaPara(indice, filas.length)}
            </span>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="break-words text-ink">{fila.etiqueta}</span>
                <span className="whitespace-nowrap font-bold text-azul-unam">
                  {fila.total} · {pct}%
                </span>
              </div>
              <div
                className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-surface-alt"
                role="img"
                aria-label={`${fila.etiqueta}: ${fila.total} respuestas (${pct}%)`}
              >
                <div
                  className="h-full rounded-full bg-oro-unam transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PromedioEstrellas({
  filas,
  base,
}: {
  filas: Fila[]
  base: number
}) {
  const conPeso = filas.filter(
    (fila) => fila.peso !== null && Number.isFinite(Number(fila.peso)),
  )
  const respuestas = conPeso.reduce((suma, fila) => suma + fila.total, 0)
  const promedio =
    respuestas > 0
      ? conPeso.reduce(
          (suma, fila) => suma + Number(fila.peso) * fila.total,
          0,
        ) / respuestas
      : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-3xl leading-none text-oro-unam">
          {respaldoEstrella(promedio)}
        </span>
        <div>
          <p className="font-bold text-azul-unam">
            Promedio: {promedio ? promedio.toFixed(2) : '—'}
          </p>
          <p className="text-xs opacity-70">{base} respuestas registradas</p>
        </div>
      </div>
      <GraficaBarras filas={filas} base={base} />
    </div>
  )
}

function respaldoEstrella(promedio: number): string {
  const llenas = Math.round(promedio)
  const total = 5
  const acotado = Math.max(0, Math.min(total, llenas))
  return '★'.repeat(acotado) + '☆'.repeat(total - acotado)
}

function GraficaOpciones({ pregunta }: { pregunta: PreguntaResultado }) {
  const filas = filasDeOpciones(pregunta.opciones)
  const base = pregunta.totalRespuestas

  if (filas.length === 0) {
    return <p className="text-sm opacity-70">Esta pregunta no tiene opciones.</p>
  }

  switch (pregunta.tipo.trim().toLowerCase()) {
    case 'caritas':
      return <DistribucionCaritas filas={filas} base={base} />
    case 'estrellas':
      return <PromedioEstrellas filas={filas} base={base} />
    default:
      return <GraficaBarras filas={filas} base={base} />
  }
}

export default GraficaOpciones
