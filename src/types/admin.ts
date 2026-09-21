export interface UsuarioAdmin {
  idUsuario: number
  correoElectronico: string
  activo: boolean
  tieneContrasena: boolean
  idRol: number | null
  rol: string | null
  rolNombre: string | null
  idUnidadResponsable: number | null
  unidadResponsable: string | null
}

export interface Unidad {
  idUnidadResponsable: number
  unidadResponsable: string
  activo: boolean
}

export interface TipoEncuesta {
  idTipoEncuesta: number
  tipoEncuesta: string
  activo: boolean
}

export interface TipoRespuesta {
  idTipoRespuesta: number
  tipoRespuesta: string
  activo: boolean
}

export interface Pregunta {
  idPregunta: number
  pregunta: string
  activo: boolean
}

export interface Opcion {
  idOpcion: number
  opcion: string
  /** Llega como cadena: es un decimal(5,2) y convertirlo a número pierde precisión. */
  peso: string | null
  activo: boolean
}

export type EstadoEncuesta = 'borrador' | 'programada' | 'abierta' | 'cerrada'

export interface EncuestaResumen {
  idEncuesta: number
  titulo: string
  idTipoEncuesta: number
  tipoEncuesta: string | null
  idUnidadResponsable: number
  fechaInicioVigencia: string | null
  fechaFinVigencia: string | null
  idEvento: number | null
  idEncuestaPrincipal: number | null
  visibleEnInicio: boolean
  tokenPublico: string | null
  activo: boolean
  estado: EstadoEncuesta
  /** Falso en cuanto la encuesta abre: a partir de ahí no se toca. */
  editable: boolean
}

export interface PreguntaDeEncuesta {
  idEncuestaPregunta: number
  idPregunta: number
  pregunta: string
  idTipoRespuesta: number
  tipoRespuesta: string
  orden: number
  opciones: { idOpcion: number; opcion: string; peso: string | null }[]
}

export interface EncuestaDetalle extends EncuestaResumen {
  preguntas: PreguntaDeEncuesta[]
}

// ---------- Público ----------

export interface OpcionPublica {
  idOpcion: number
  opcion: string
  peso: string | null
}

export interface PreguntaPublica {
  idEncuestaPregunta: number
  pregunta: string
  tipoRespuesta: string
  orden: number
  opciones: OpcionPublica[]
}

export interface CuestionarioPublico {
  titulo: string
  tipoEncuesta: string | null
  unidadResponsable: string | null
  fechaFinVigencia: string | null
  preguntas: PreguntaPublica[]
}

export interface EncuestaEnInicio {
  titulo: string
  tipoEncuesta: string | null
  unidadResponsable: string | null
  fechaFinVigencia: string | null
  token: string
}

/** Lo que el usuario lleva contestado: por pregunta, una opción o un texto. */
export type Respuesta = { idOpcion: number } | { respuesta: string }
