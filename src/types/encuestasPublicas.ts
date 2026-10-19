export interface PreguntaCatalogo {
  idPregunta: number
  pregunta: string
}
export interface TipoRespuestaPublica {
  idTipoRespuesta: number
  tipoRespuesta: string
}
export interface OpcionPublica {
  idOpcion: number
  opcion: string
}
export interface PreguntaPublica {
  idEncuestaPregunta: number
  orden: number
  pregunta: PreguntaCatalogo
  tipoRespuesta: TipoRespuestaPublica
  opciones: OpcionPublica[]
}
export interface EncuestaPublica {
  idEncuesta: number
  titulo: string
  preguntas: PreguntaPublica[]
}

export interface RespuestaEnviada {
  idEncuestaPregunta: number
  idOpcion?: number
  texto?: string
}
