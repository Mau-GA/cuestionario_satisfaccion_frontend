// Contrato de los catálogos (BE-19). Los nombres son los de los DTOs del backend,
// que valida con forbidNonWhitelisted: cualquier otro nombre responde 400.
// activo llega como tinyint (1/0) desde MySQL, se trata como truthy.

export interface Pregunta {
  idPregunta: number;
  pregunta: string;
  activo: boolean | number;
  fechaCreacion: string;
}

export interface Opcion {
  idOpcion: number;
  opcion: string;
  peso: number | null;
  activo: boolean | number;
  fechaCreacion: string;
}

export interface TipoEncuesta {
  idTipoEncuesta: number;
  tipoEncuesta: string;
  activo: boolean | number;
  fechaCreacion: string;
}

export interface TipoRespuesta {
  idTipoRespuesta: number;
  tipoRespuesta: string;
  activo: boolean | number;
  fechaCreacion: string;
}

export type ItemCatalogo = Pregunta | Opcion | TipoEncuesta | TipoRespuesta;

export interface CreatePreguntaData {
  pregunta: string;
}

export interface UpdatePreguntaData {
  pregunta?: string;
}

export interface CreateOpcionData {
  opcion: string;
  peso?: number;
}

export interface UpdateOpcionData {
  opcion?: string;
  peso?: number;
}

export interface CreateTipoEncuestaData {
  tipoEncuesta: string;
  activo?: boolean;
}

export interface UpdateTipoEncuestaData {
  tipoEncuesta?: string;
  activo?: boolean;
}

export interface CreateTipoRespuestaData {
  tipoRespuesta: string;
  activo?: boolean;
}

export interface UpdateTipoRespuestaData {
  tipoRespuesta?: string;
  activo?: boolean;
}
