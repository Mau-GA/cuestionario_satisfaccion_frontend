import type { ReactNode } from 'react'

interface Props {
  id: string
  pregunta: string
  requerida?: boolean
  error?: string | null
  children: ReactNode
}

function CampoPregunta({ id, pregunta, requerida, error, children }: Props) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend
        id={`${id}-legend`}
        className="mb-3 p-0 text-base font-bold text-azul-unam dark:text-oro-unam"
      >
        {pregunta}
        {requerida && (
          <>
            <span aria-hidden className="ml-1 text-red-600">
              *
            </span>
            <span className="sr-only"> (obligatoria)</span>
          </>
        )}
      </legend>
      <div className={error ? 'border-l-4 border-red-600 pl-3' : ''}>
        {children}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default CampoPregunta
