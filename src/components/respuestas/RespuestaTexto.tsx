import type { PropsPreguntaTexto } from '../../types/respuestas'
import CampoPregunta from './CampoPregunta'
import { describedBy, idError } from './opciones'

function RespuestaTexto({
  id,
  pregunta,
  valor,
  onChange,
  requerida,
  error,
  deshabilitado,
  maxLength = 500,
  placeholder = 'Escribe tu respuesta',
}: PropsPreguntaTexto) {
  const idContador = `${id}-contador`

  return (
    <CampoPregunta
      id={id}
      pregunta={pregunta}
      requerida={requerida}
      error={error}
    >
      <textarea
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={4}
        placeholder={placeholder}
        disabled={deshabilitado}
        aria-labelledby={`${id}-legend`}
        aria-describedby={describedBy(idContador, idError(id, error))}
        aria-invalid={error ? true : undefined}
        className={`box-border block w-full resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-base text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-gray-500 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)] focus:outline-none disabled:opacity-50 ${
          error ? 'border-red-600' : 'border-outline'
        }`}
      />
      <p id={idContador} className="mt-1 text-right text-xs">
        {valor.length}/{maxLength}
      </p>
    </CampoPregunta>
  )
}

export default RespuestaTexto
