import type { OpcionPublica } from '../types/admin'

interface Props {
  idPregunta: number
  opciones: OpcionPublica[]
  valor: number | null
  onElegir: (idOpcion: number) => void
}

/**
 * Las opciones llegan ordenadas de lo más negativo a lo más positivo, así que
 * la posición en el arreglo es el nivel: el índice 0 es lo peor y el último lo
 * mejor. Eso es lo que permite pintar una escala con sentido.
 */

const CARITAS = ['😖', '🙁', '😐', '🙂', '😄']

export function Caritas({ opciones, valor, onElegir }: Props) {
  // Con cinco opciones o menos se reparte la escala de caritas; con más, se
  // interpola para que las puntas siempre sean la peor y la mejor.
  const carita = (i: number) =>
    CARITAS[
      opciones.length <= 1 ? 2 : Math.round((i / (opciones.length - 1)) * (CARITAS.length - 1))
    ]

  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o, i) => {
        const activa = valor === o.idOpcion
        return (
          <button
            key={o.idOpcion}
            type="button"
            onClick={() => onElegir(o.idOpcion)}
            aria-pressed={activa}
            className={`flex min-w-24 flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 transition ${
              activa
                ? 'border-unam-azul bg-unam-azul/5 ring-2 ring-unam-azul/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl leading-none">{carita(i)}</span>
            <span className="text-center text-xs text-slate-600">{o.opcion}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Estrellas({ opciones, valor, onElegir }: Props) {
  const elegida = opciones.findIndex((o) => o.idOpcion === valor)
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {opciones.map((o, i) => (
          <button
            key={o.idOpcion}
            type="button"
            onClick={() => onElegir(o.idOpcion)}
            aria-label={o.opcion}
            aria-pressed={valor === o.idOpcion}
            className="rounded p-1 text-2xl leading-none transition hover:scale-110"
          >
            <span className={i <= elegida ? 'text-unam-oro' : 'text-slate-300'}>★</span>
          </button>
        ))}
      </div>
      {elegida >= 0 && <p className="mt-1 text-sm text-slate-600">{opciones[elegida].opcion}</p>}
    </div>
  )
}

export function Barra({ opciones, valor, onElegir }: Props) {
  const elegida = opciones.findIndex((o) => o.idOpcion === valor)
  return (
    <div>
      <div className="flex overflow-hidden rounded-lg border border-slate-200">
        {opciones.map((o, i) => (
          <button
            key={o.idOpcion}
            type="button"
            onClick={() => onElegir(o.idOpcion)}
            aria-pressed={valor === o.idOpcion}
            // `min-w-0` deja que los segmentos se encojan por debajo del ancho de
            // su texto: sin eso, una escala con etiquetas largas empuja la barra
            // fuera de su contenedor. El texto se acomoda en varias líneas.
            className={`min-w-0 flex-1 border-r border-slate-200 px-2 py-2.5 text-xs transition last:border-r-0 ${
              i <= elegida && elegida >= 0
                ? 'bg-unam-azul text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {o.opcion}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TextoLibre({
  valor,
  onEscribir,
}: {
  valor: string
  onEscribir: (texto: string) => void
}) {
  return (
    <div>
      <textarea
        rows={4}
        maxLength={1000}
        value={valor}
        onChange={(e) => onEscribir(e.target.value)}
        placeholder="Escribe lo que quieras compartir…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
      />
      <p className="mt-1 text-right text-xs text-slate-400">{valor.length}/1000</p>
    </div>
  )
}
