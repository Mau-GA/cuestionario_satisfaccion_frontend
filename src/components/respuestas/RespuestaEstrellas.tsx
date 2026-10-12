import { useState } from 'react'
import type { PropsPreguntaOpciones } from '../../types/respuestas'
import CampoPregunta from './CampoPregunta'
import { idError, ordenarPorPeso } from './opciones'

function RespuestaEstrellas({
  id,
  pregunta,
  opciones,
  valor,
  onChange,
  requerida,
  error,
  deshabilitado,
}: PropsPreguntaOpciones) {
  const [resaltada, setResaltada] = useState<number | null>(null)
  const ordenadas = ordenarPorPeso(opciones)
  const seleccionada = ordenadas.findIndex((o) => o.idOpcion === valor)
  const limite = resaltada ?? seleccionada
  const etiquetaVisible = ordenadas[limite]?.etiqueta

  return (
    <CampoPregunta
      id={id}
      pregunta={pregunta}
      requerida={requerida}
      error={error}
    >
      <div
        className="flex flex-wrap items-center gap-1"
        onMouseLeave={() => setResaltada(null)}
      >
        {ordenadas.map((opcion, i) => (
          <label
            key={opcion.idOpcion}
            onMouseEnter={() => !deshabilitado && setResaltada(i)}
            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-3xl leading-none transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-azul-unam has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
              i <= limite ? 'text-oro-unam' : 'text-gray-500'
            }`}
          >
            <input
              type="radio"
              name={id}
              value={opcion.idOpcion}
              checked={opcion.idOpcion === valor}
              onChange={() => onChange(opcion.idOpcion)}
              disabled={deshabilitado}
              aria-invalid={error ? true : undefined}
              aria-describedby={idError(id, error)}
              className="sr-only"
            />
            <span aria-hidden>{i <= limite ? '★' : '☆'}</span>
            <span className="sr-only">{`${i + 1} de ${ordenadas.length}: ${opcion.etiqueta}`}</span>
          </label>
        ))}
        {etiquetaVisible && (
          <span aria-hidden className="ml-2 text-sm">
            {etiquetaVisible}
          </span>
        )}
      </div>
    </CampoPregunta>
  )
}

export default RespuestaEstrellas
