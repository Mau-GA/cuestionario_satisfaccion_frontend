import { Barra, Caritas, Estrellas, TextoLibre } from './respuestas'
import type { OpcionPublica } from '../types/admin'

/**
 * Previsualización de cómo se verá una pregunta al responderla.
 *
 * Reusa los mismos componentes que la pantalla pública a propósito: una vista
 * previa que se dibuja aparte acaba mintiendo en cuanto uno de los dos cambia.
 */
export function VistaPrevia({
  tipoRespuesta,
  opciones,
}: {
  tipoRespuesta: string
  opciones: { opcion: string; peso?: number | null }[]
}) {
  const comoPublicas: OpcionPublica[] = opciones.map((o, i) => ({
    idOpcion: -(i + 1),
    opcion: o.opcion,
    peso: o.peso === undefined || o.peso === null ? null : String(o.peso),
  }))

  const props = {
    idPregunta: 0,
    opciones: comoPublicas,
    valor: null,
    onElegir: () => {},
  }

  // `inert` saca todo el subárbol del foco y de los eventos: es una muestra, no
  // un control, y sus botones no deben ser alcanzables con el teclado.
  if (comoPublicas.length === 0) {
    return (
      <div inert className="opacity-70">
        <TextoLibre valor="" onEscribir={() => {}} />
      </div>
    )
  }

  const control = (() => {
    switch (tipoRespuesta.trim().toLowerCase()) {
      case 'estrellas':
        return <Estrellas {...props} />
      case 'barra':
        return <Barra {...props} />
      default:
        return <Caritas {...props} />
    }
  })()

  // `overflow-hidden` porque una escala con etiquetas largas se sale de la
  // tarjeta del preset; en la pantalla real de responder no se toca.
  return (
    <div inert className="overflow-hidden rounded opacity-90">
      {control}
    </div>
  )
}
