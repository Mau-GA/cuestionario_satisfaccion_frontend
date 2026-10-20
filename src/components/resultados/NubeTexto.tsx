import type { TextoRespuesta } from '../../services/resultados'

interface Props {
  textos: TextoRespuesta[]
}

function NubeTexto({ textos }: Props) {
  const conContenido = textos.filter(
    (item) => item.respuesta !== null && item.respuesta.trim().length > 0,
  )

  if (conContenido.length === 0) {
    return (
      <p className="text-sm opacity-70">Sin respuestas de texto para mostrar.</p>
    )
  }

  return (
    <ul className="m-0 list-none p-0 flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
      {conContenido.map((item, indice) => (
        <li
          key={`${indice}-${item.respuesta}`}
          className="rounded-lg border border-outline bg-surface-alt px-3 py-2 text-sm text-ink"
        >
          {item.respuesta}
          {item.total > 1 && (
            <span className="ml-2 whitespace-nowrap rounded-full bg-accent-soft px-2 py-[1px] text-xs font-bold text-azul-unam">
              ×{item.total}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default NubeTexto
