import { http } from './http'

/**
 * Lo que pinta la pantalla de inicio sin sesion. El API (BE-40) junta bajo una
 * sola tarjeta las encuestas que comparten evento y deja sueltas las demas,
 * asi que aqui llegan dos formas distintas discriminadas por `tipo`.
 */
export interface EncuestaPublicaResumen {
  titulo: string
  tipoEncuesta: string
  unidadResponsable: string
  fechaFinVigencia: string | null
  tokenPublico: string
}

export type TarjetaPublica =
  | ({ tipo: 'encuesta' } & EncuestaPublicaResumen)
  | {
      tipo: 'evento'
      idEvento: number
      nombre: string
      unidadResponsable: string
      fechaFinVigencia: string | null
      encuestas: number
    }

export interface EventoPublico {
  idEvento: number
  nombre: string
  unidadResponsable: string
  fechaInicioVigencia: string | null
  fechaFinVigencia: string | null
  encuestas: EncuestaPublicaResumen[]
}

export function listarInicioPublico(): Promise<TarjetaPublica[]> {
  return http.request<TarjetaPublica[]>('/publico/encuestas', { auth: false })
}

export function obtenerEventoPublico(idEvento: number): Promise<EventoPublico> {
  return http.request<EventoPublico>(`/publico/eventos/${idEvento}`, {
    auth: false,
  })
}
