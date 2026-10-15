import type { PropsPreguntaOpciones } from '../../types/respuestas'
import CampoPregunta from './CampoPregunta'
import { describedBy, idError, ordenarPorPeso } from './opciones'

function RespuestaBarra({
  id,
  pregunta,
  opciones,
  valor,
  onChange,
  requerida,
  error,
  deshabilitado,
}: PropsPreguntaOpciones) {
  const ordenadas = ordenarPorPeso(opciones)
  if (ordenadas.length === 0) return null

  const indice = ordenadas.findIndex((o) => o.idOpcion === valor)
  const sinRespuesta = indice === -1
  const posicion = sinRespuesta
    ? Math.floor((ordenadas.length - 1) / 2)
    : indice
  const idAyuda = `${id}-ayuda`

  function elegir(i: number): void {
    const opcion = ordenadas[i]
    if (opcion && opcion.idOpcion !== valor) onChange(opcion.idOpcion)
  }

  return (
    <CampoPregunta
      id={id}
      pregunta={pregunta}
      requerida={requerida}
      error={error}
    >
      <input
        type="range"
        min={0}
        max={ordenadas.length - 1}
        step={1}
        value={posicion}
        onChange={(event) => elegir(Number(event.target.value))}
        onPointerUp={(event) => elegir(Number(event.currentTarget.value))}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            elegir(posicion)
          }
        }}
        disabled={deshabilitado}
        aria-labelledby={`${id}-legend`}
        aria-valuetext={
          sinRespuesta ? 'Sin respuesta' : ordenadas[indice].etiqueta
        }
        aria-describedby={describedBy(idAyuda, idError(id, error))}
        aria-invalid={error ? true : undefined}
        className={`h-11 w-full cursor-pointer accent-azul-unam disabled:cursor-not-allowed ${
          sinRespuesta ? 'opacity-40' : ''
        }`}
      />
      <div aria-hidden className="flex justify-between gap-2 text-xs">
        <span>{ordenadas[0].etiqueta}</span>
        <span className="font-bold text-azul-unam dark:text-oro-unam">
          {sinRespuesta
            ? 'Toca la barra para responder'
            : ordenadas[indice].etiqueta}
        </span>
        <span className="text-right">
          {ordenadas[ordenadas.length - 1].etiqueta}
        </span>
      </div>
      <p id={idAyuda} className="sr-only">
        Usa las flechas para elegir y Enter o Espacio para confirmar.
      </p>
    </CampoPregunta>
  )
}

export default RespuestaBarra
