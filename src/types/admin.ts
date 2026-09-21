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
