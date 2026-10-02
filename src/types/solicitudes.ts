export interface UnidadResponsable {
  idUnidadResponsable: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface SolicitudAccesoRequest {
  idUnidadResponsable: number;
  correoElectronico: string;
}

export interface SolicitudAccesoResponse {
  idSolicitudAcceso: number;
  correoElectronico: string;
  autorizada: boolean | null;
  fechaSolicitud: string;
  unidad: UnidadResponsable;
}