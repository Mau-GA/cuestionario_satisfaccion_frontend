/**
 * Combinaciones predeterminadas de forma de responder + opciones.
 *
 * Existen para que armar una encuesta no empiece siempre desde cero: la mayoría
 * de las preguntas de satisfacción caen en una de estas cinco escalas. El
 * `tipoRespuesta` se busca por nombre en el catálogo, así que si el área cambia
 * la etiqueta hay que actualizar aquí también.
 */
export interface Preset {
  id: string
  nombre: string
  descripcion: string
  /** Nombre del tipo de respuesta en el catálogo. */
  tipoRespuesta: string
  opciones: { opcion: string; peso: number }[]
}

export const PRESETS: Preset[] = [
  {
    id: 'satisfaccion',
    nombre: 'Satisfacción',
    descripcion: 'Cinco niveles, de muy insatisfecho a muy satisfecho.',
    tipoRespuesta: 'Caritas',
    opciones: [
      { opcion: 'Muy insatisfecho', peso: 1 },
      { opcion: 'Insatisfecho', peso: 2 },
      { opcion: 'Neutral', peso: 3 },
      { opcion: 'Satisfecho', peso: 4 },
      { opcion: 'Muy satisfecho', peso: 5 },
    ],
  },
  {
    id: 'calificacion',
    nombre: 'Calificación',
    descripcion: 'De una a cinco estrellas.',
    tipoRespuesta: 'Estrellas',
    opciones: [
      { opcion: '1 estrella', peso: 1 },
      { opcion: '2 estrellas', peso: 2 },
      { opcion: '3 estrellas', peso: 3 },
      { opcion: '4 estrellas', peso: 4 },
      { opcion: '5 estrellas', peso: 5 },
    ],
  },
  {
    id: 'acuerdo',
    nombre: 'Grado de acuerdo',
    descripcion: 'Para afirmaciones: de total desacuerdo a total acuerdo.',
    tipoRespuesta: 'Barra',
    opciones: [
      { opcion: 'Totalmente en desacuerdo', peso: 1 },
      { opcion: 'En desacuerdo', peso: 2 },
      { opcion: 'Ni de acuerdo ni en desacuerdo', peso: 3 },
      { opcion: 'De acuerdo', peso: 4 },
      { opcion: 'Totalmente de acuerdo', peso: 5 },
    ],
  },
  {
    id: 'frecuencia',
    nombre: 'Frecuencia',
    descripcion: 'Qué tan seguido ocurre algo.',
    tipoRespuesta: 'Barra',
    opciones: [
      { opcion: 'Nunca', peso: 1 },
      { opcion: 'Casi nunca', peso: 2 },
      { opcion: 'A veces', peso: 3 },
      { opcion: 'Casi siempre', peso: 4 },
      { opcion: 'Siempre', peso: 5 },
    ],
  },
  {
    id: 'si-no',
    nombre: 'Sí / No',
    descripcion: 'Una pregunta cerrada de dos respuestas.',
    tipoRespuesta: 'Barra',
    opciones: [
      { opcion: 'No', peso: 1 },
      { opcion: 'Sí', peso: 2 },
    ],
  },
  {
    id: 'texto',
    nombre: 'Texto libre',
    descripcion: 'Un espacio abierto para escribir. No lleva opciones.',
    tipoRespuesta: 'Texto libre',
    opciones: [],
  },
]
