import type { PropsPreguntaOpciones } from '../../types/respuestas'
import CampoPregunta from './CampoPregunta'
import { caritaPara, idError, ordenarPorPeso } from './opciones'

function RespuestaCaritas({
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
  const columnas =
    ordenadas.length <= 5
      ? 'grid-flow-col auto-cols-fr'
      : 'grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))]'

  return (
    <CampoPregunta
      id={id}
      pregunta={pregunta}
      requerida={requerida}
      error={error}
    >
      <div className={`grid ${columnas} gap-1 sm:gap-2`}>
        {ordenadas.map((opcion, i) => {
          const seleccionada = opcion.idOpcion === valor
          return (
            <label
              key={opcion.idOpcion}
              className={`flex min-h-11 min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-azul-unam has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
                seleccionada
                  ? 'border-azul-unam bg-accent-soft'
                  : 'border-transparent hover:bg-surface-alt'
              }`}
            >
              <input
                type="radio"
                name={id}
                value={opcion.idOpcion}
                checked={seleccionada}
                onChange={() => onChange(opcion.idOpcion)}
                disabled={deshabilitado}
                aria-invalid={error ? true : undefined}
                aria-describedby={idError(id, error)}
                className="sr-only"
              />
              <span aria-hidden className="text-3xl leading-none sm:text-4xl">
                {caritaPara(i, ordenadas.length)}
              </span>
              <span className="w-full text-xs leading-tight hyphens-auto [overflow-wrap:anywhere]">
                {opcion.etiqueta}
              </span>
            </label>
          )
        })}
      </div>
    </CampoPregunta>
  )
}

export default RespuestaCaritas
