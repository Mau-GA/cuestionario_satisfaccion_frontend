import type { OpcionResultado, PreguntaResultado } from '../../services/resultados'
import { caritaPara } from '../respuestas/opciones'

/**
 * La distribucion llega del API ya ordenada de la opcion mas negativa a la mas
 * positiva y con el porcentaje calculado, asi que estas graficas solo pintan.
 */

function GraficaBarras({ distribucion }: { distribucion: OpcionResultado[] }) {
  return (
    <ul className="m-0 list-none p-0 flex flex-col gap-2.5">
      {distribucion.map((opcion) => (
        <li key={opcion.idOpcion} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="break-words text-ink">{opcion.opcion}</span>
            <span className="whitespace-nowrap font-bold text-azul-unam">
              {opcion.veces} · {opcion.porcentaje}%
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-surface-alt"
            role="img"
            aria-label={`${opcion.opcion}: ${opcion.veces} ${
              opcion.veces === 1 ? 'respuesta' : 'respuestas'
            } (${opcion.porcentaje}%)`}
          >
            <div
              className="h-full rounded-full bg-azul-unam transition-[width] duration-300"
              style={{ width: `${opcion.porcentaje}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function DistribucionCaritas({
  distribucion,
}: {
  distribucion: OpcionResultado[]
}) {
  return (
    <ul className="m-0 list-none p-0 flex flex-col gap-2.5">
      {distribucion.map((opcion, indice) => (
        <li key={opcion.idOpcion} className="flex items-center gap-3">
          <span aria-hidden className="text-2xl leading-none">
            {caritaPara(indice, distribucion.length)}
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="break-words text-ink">{opcion.opcion}</span>
              <span className="whitespace-nowrap font-bold text-azul-unam">
                {opcion.veces} · {opcion.porcentaje}%
              </span>
            </div>
            <div
              className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-surface-alt"
              role="img"
              aria-label={`${opcion.opcion}: ${opcion.veces} ${
                opcion.veces === 1 ? 'respuesta' : 'respuestas'
              } (${opcion.porcentaje}%)`}
            >
              <div
                className="h-full rounded-full bg-oro-unam transition-[width] duration-300"
                style={{ width: `${opcion.porcentaje}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function PromedioEstrellas({
  distribucion,
  promedio,
  respuestas,
}: {
  distribucion: OpcionResultado[]
  promedio: number | null
  respuestas: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-3xl leading-none text-oro-unam">
          {respaldoEstrella(promedio)}
        </span>
        <div>
          <p className="font-bold text-azul-unam">
            Promedio: {promedio === null ? '—' : promedio.toFixed(2)}
          </p>
          <p className="text-xs opacity-70">
            {respuestas}{' '}
            {respuestas === 1 ? 'respuesta registrada' : 'respuestas registradas'}
          </p>
        </div>
      </div>
      <GraficaBarras distribucion={distribucion} />
    </div>
  )
}

// El promedio ya viene ponderado por el peso de cada opcion; aqui solo se
// traduce a estrellas llenas. Una pregunta sin respuestas con peso no tiene
// promedio, y entonces no se pinta ninguna llena.
function respaldoEstrella(promedio: number | null): string {
  const total = 5
  const llenas = Math.max(0, Math.min(total, Math.round(promedio ?? 0)))
  return '★'.repeat(llenas) + '☆'.repeat(total - llenas)
}

function GraficaOpciones({ pregunta }: { pregunta: PreguntaResultado }) {
  if (pregunta.distribucion.length === 0) {
    return <p className="text-sm opacity-70">Esta pregunta no tiene opciones.</p>
  }

  switch (pregunta.tipoRespuesta.trim().toLowerCase()) {
    case 'caritas':
      return <DistribucionCaritas distribucion={pregunta.distribucion} />
    case 'estrellas':
      return (
        <PromedioEstrellas
          distribucion={pregunta.distribucion}
          promedio={pregunta.promedio}
          respuestas={pregunta.respuestas}
        />
      )
    default:
      return <GraficaBarras distribucion={pregunta.distribucion} />
  }
}

export default GraficaOpciones
