import { useId, useState, type KeyboardEvent } from 'react'
import {
  coincideNombre,
  mismoNombre,
  porRecientes,
  type Evento,
} from '../services/eventos'
import { esActivo } from '../services/encuestas'

interface Props {
  /** id del texto que nombra el campo (aria-labelledby). */
  idEtiqueta: string
  valor: string
  onCambiar: (valor: string) => void
  /** Eventos de la unidad con la que se va a guardar la encuesta. */
  eventos: Evento[]
  disabled?: boolean
  placeholder: string
  className: string
}

const MAXIMO_RECIENTES = 6
const MAXIMO_COINCIDENCIAS = 8

function fechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function vigencia(evento: Evento): string {
  const { fechaInicioVigencia: inicio, fechaFinVigencia: fin } = evento
  if (inicio && fin) return `Del ${fechaCorta(inicio)} al ${fechaCorta(fin)}`
  if (inicio) return `Desde el ${fechaCorta(inicio)}`
  if (fin) return `Hasta el ${fechaCorta(fin)}`
  return `Creado el ${fechaCorta(evento.fechaCreacion)}`
}

function terminado(evento: Evento): boolean {
  return (
    evento.fechaFinVigencia !== null &&
    new Date(evento.fechaFinVigencia).getTime() <= Date.now()
  )
}

type Opcion = { tipo: 'evento'; evento: Evento } | { tipo: 'nuevo'; nombre: string }

/**
 * Campo de evento con sugerencias: al enfocarlo muestra los eventos recientes
 * de la unidad, y al escribir filtra por cualquier palabra del nombre. Así no
 * hace falta recordar el nombre exacto, y crear uno nuevo es una opción que se
 * ve, no algo que pasa sin querer por un error de dedo.
 */
function BuscadorEvento({
  idEtiqueta,
  valor,
  onCambiar,
  eventos,
  disabled = false,
  placeholder,
  className,
}: Props) {
  const idLista = useId()
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(-1)

  const busqueda = valor.trim()
  const vigentes = porRecientes(eventos.filter((e) => esActivo(e.activo)))
  const eventosVisibles = busqueda
    ? vigentes
        .filter((e) => coincideNombre(e.nombre, busqueda))
        .slice(0, MAXIMO_COINCIDENCIAS)
    : vigentes.slice(0, MAXIMO_RECIENTES)
  const exacto = vigentes.some((e) => mismoNombre(e.nombre, busqueda))

  const opciones: Opcion[] = eventosVisibles.map((evento) => ({
    tipo: 'evento',
    evento,
  }))
  if (busqueda && !exacto) opciones.push({ tipo: 'nuevo', nombre: busqueda })

  const mostrarLista = abierto && !disabled && (opciones.length > 0 || !busqueda)

  function elegir(opcion: Opcion): void {
    onCambiar(opcion.tipo === 'evento' ? opcion.evento.nombre : opcion.nombre)
    setAbierto(false)
    setResaltado(-1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!abierto) {
        setAbierto(true)
        return
      }
      const paso = event.key === 'ArrowDown' ? 1 : -1
      setResaltado((actual) =>
        opciones.length === 0
          ? -1
          : (actual + paso + opciones.length) % opciones.length,
      )
    } else if (event.key === 'Enter' && mostrarLista && resaltado >= 0) {
      // Solo con una opción resaltada; si no, Enter sigue enviando el formulario.
      event.preventDefault()
      elegir(opciones[resaltado])
    } else if (event.key === 'Escape' && mostrarLista) {
      // Cierra la lista sin cerrar el modal que la contiene.
      event.stopPropagation()
      setAbierto(false)
      setResaltado(-1)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-labelledby={idEtiqueta}
        value={valor}
        maxLength={255}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        aria-expanded={mostrarLista}
        aria-controls={mostrarLista ? idLista : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          mostrarLista && resaltado >= 0 ? `${idLista}-${resaltado}` : undefined
        }
        onChange={(event) => {
          onCambiar(event.target.value)
          setAbierto(true)
          setResaltado(-1)
        }}
        onFocus={() => setAbierto(true)}
        onClick={() => setAbierto(true)}
        onBlur={() => {
          setAbierto(false)
          setResaltado(-1)
        }}
        onKeyDown={onKeyDown}
        className={`w-full ${className}`}
      />

      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto m-0 p-1 list-none rounded-lg border border-outline bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          {!busqueda && (
            <li
              role="presentation"
              className="px-3 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-[0.4px] opacity-60"
            >
              {vigentes.length > 0
                ? 'Eventos recientes de tu unidad'
                : 'Tu unidad todavía no tiene eventos: escribe el nombre para crear uno'}
            </li>
          )}
          {opciones.map((opcion, i) => (
            <li
              key={opcion.tipo === 'evento' ? opcion.evento.idEvento : 'nuevo'}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === resaltado}
              // mousedown en vez de click: el blur del input llega antes que
              // el click y cerraría la lista sin elegir nada.
              onMouseDown={(event) => {
                event.preventDefault()
                elegir(opcion)
              }}
              onMouseEnter={() => setResaltado(i)}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm ${
                i === resaltado ? 'bg-accent-soft' : ''
              }`}
            >
              {opcion.tipo === 'evento' ? (
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <span className="[overflow-wrap:anywhere]">
                      {opcion.evento.nombre}
                    </span>
                    {terminado(opcion.evento) && (
                      <span className="shrink-0 text-[11px] font-bold rounded-full px-2 py-px bg-outline/30 text-ink/70">
                        Terminado
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-normal opacity-65">
                    {vigencia(opcion.evento)}
                  </span>
                </span>
              ) : (
                <span className="font-bold text-azul-unam">
                  + Crear el evento «{opcion.nombre}»
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default BuscadorEvento
