import { rampaDivergente } from '../utils/escala'
import type { DistribucionOpcion } from '../types/admin'

/**
 * Barra apilada al 100% con la distribución de una pregunta.
 *
 * Debajo va siempre la tabla con las cifras exactas: el color ordena y da la
 * polaridad de un vistazo, pero quien necesite el número no depende de él.
 */
export function Distribucion({ distribucion }: { distribucion: DistribucionOpcion[] }) {
  const colores = rampaDivergente(distribucion.length)
  const conDatos = distribucion.some((d) => d.veces > 0)

  return (
    <div>
      {conDatos ? (
        <div className="flex h-6 gap-0.5 overflow-hidden rounded" role="img" aria-label="Distribución de respuestas">
          {distribucion.map((d, i) =>
            d.porcentaje > 0 ? (
              <div
                key={d.idOpcion}
                title={`${d.opcion}: ${d.veces} (${d.porcentaje}%)`}
                style={{ width: `${d.porcentaje}%`, background: colores[i] }}
                className="first:rounded-l last:rounded-r"
              />
            ) : null,
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Sin respuestas todavía.</p>
      )}

      <table className="mt-3 w-full text-sm">
        <tbody>
          {distribucion.map((d, i) => (
            <tr key={d.idOpcion}>
              <td className="w-4 py-1">
                <span
                  aria-hidden
                  style={{ background: colores[i] }}
                  className="inline-block size-3 rounded-sm align-middle"
                />
              </td>
              <td className="py-1 text-slate-700">{d.opcion}</td>
              <td className="py-1 text-right text-slate-500 tabular-nums">{d.veces}</td>
              <td className="w-14 py-1 text-right text-slate-500 tabular-nums">{d.porcentaje}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
