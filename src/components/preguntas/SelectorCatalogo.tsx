import { useId, useState } from 'react'
import {
  mismoTexto,
  normalizarTexto,
  type ItemCatalogo,
  type SeleccionCatalogo,
} from './catalogo'

interface Props {
  etiqueta: string
  placeholder: string
  sugerencias: ItemCatalogo[]
  valorInicial?: string
  disabled?: boolean
  autoFocus?: boolean
  /** Deja el campo vacío después de confirmar (el alta de una pregunta). */
  limpiarAlConfirmar?: boolean
  onConfirmar: (seleccion: SeleccionCatalogo) => void
}

const MAXIMO_SUGERENCIAS = 8

const CLASE_INPUT =
  'w-full font-normal px-[14px] py-2.5 rounded-lg border border-outline bg-surface text-ink box-border ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-outline ' +
  'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)] ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

/**
 * Campo de texto con el catálogo como sugerencia: se escribe libremente y, si
 * lo escrito no está en el catálogo, se ofrece darlo de alta. Es lo que hace
 * que armar una encuesta se sienta como escribir un formulario y no como
 * llenar dos selects.
 */
function SelectorCatalogo({
  etiqueta,
  placeholder,
  sugerencias,
  valorInicial = '',
  disabled = false,
  autoFocus = false,
  limpiarAlConfirmar = false,
  onConfirmar,
}: Props) {
  const idLista = useId()
  const [texto, setTexto] = useState(valorInicial)
  const [abierto, setAbierto] = useState(false)
  // Cuando el valor de fuera cambia (la pregunta se guardo y volvio del API),
  // el campo lo adopta. Se ajusta durante el render, que es como React pide
  // derivar estado de una prop, y no con un efecto.
  const [valorVisto, setValorVisto] = useState(valorInicial)
  // Lo último que se mandó a guardar. Confirmar al salir del campo es cómodo,
  // pero el valor de fuera tarda en volver del API: sin esta marca, soltar el
  // foco después de un Enter volvía a mandar el mismo cambio, y el segundo
  // envío chocaba con el primero («la pregunta ya está agregada»).
  const [ultimoConfirmado, setUltimoConfirmado] = useState(valorInicial)
  if (valorVisto !== valorInicial) {
    setValorVisto(valorInicial)
    setTexto(valorInicial)
    setUltimoConfirmado(valorInicial)
  }

  const escrito = texto.trim()
  const coincidencias = sugerencias
    .filter((item) => !escrito || mismoTexto(item.texto, escrito) || item.texto.toLocaleLowerCase('es').includes(escrito.toLocaleLowerCase('es')))
    .slice(0, MAXIMO_SUGERENCIAS)
  const exacta = sugerencias.filter((item) => mismoTexto(item.texto, escrito))
  const esNuevo = escrito.length > 0 && exacta.length === 0

  function confirmar(item: ItemCatalogo | null, textoElegido: string): void {
    const limpio = normalizarTexto(textoElegido)
    if (!limpio) return
    setAbierto(false)
    setUltimoConfirmado(limpiarAlConfirmar ? valorInicial : limpio)
    onConfirmar({ item, texto: limpio })
    setTexto(limpiarAlConfirmar ? '' : limpio)
  }

  function confirmarEscrito(): void {
    // Un solo renglón con ese texto exacto es el que la persona quiere decir;
    // con dos (mismo texto, pesos distintos) no se adivina: se elige a mano.
    confirmar(exacta.length === 1 ? exacta[0] : null, texto)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={texto}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        placeholder={placeholder}
        className={CLASE_INPUT}
        onChange={(event) => {
          setTexto(event.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            confirmarEscrito()
          } else if (event.key === 'Escape') {
            setAbierto(false)
            setTexto(valorInicial)
          }
        }}
        onBlur={() => {
          setAbierto(false)
          if (!texto.trim()) {
            setTexto(valorInicial)
            return
          }
          if (
            !mismoTexto(texto, valorInicial) &&
            !mismoTexto(texto, ultimoConfirmado)
          ) {
            confirmarEscrito()
          }
        }}
      />

      {abierto && (coincidencias.length > 0 || esNuevo) && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto m-0 p-1 list-none rounded-lg border border-outline bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          {coincidencias.map((item) => (
            <li key={`${item.id}-${item.texto}`}>
              <button
                type="button"
                role="option"
                aria-selected={mismoTexto(item.texto, escrito)}
                // mousedown en vez de click: el blur del input llega antes que
                // el click y cerraría la lista sin elegir nada.
                onMouseDown={(event) => {
                  event.preventDefault()
                  confirmar(item, item.texto)
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-md bg-transparent border-0 cursor-pointer text-ink hover:bg-accent-soft"
              >
                {item.texto}
                {item.pie && (
                  <span className="ml-2 text-xs opacity-60">{item.pie}</span>
                )}
              </button>
            </li>
          ))}
          {esNuevo && (
            <li>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  confirmar(null, texto)
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-md bg-transparent border-0 cursor-pointer font-bold text-azul-unam hover:bg-accent-soft"
              >
                + Crear «{escrito}»
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default SelectorCatalogo
