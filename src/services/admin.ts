import { api } from './http'
import type {
  Comentarios,
  EncuestaDetalle,
  EncuestaResumen,
  Opcion,
  Pregunta,
  Resultados,
  TipoEncuesta,
  TipoRespuesta,
  Unidad,
  UsuarioAdmin,
} from '../types/admin'

// ---------- Usuarios ----------

export const listarUsuarios = () => api<UsuarioAdmin[]>('/usuarios')

export const crearUsuario = (body: {
  correoElectronico: string
  idRol: number
  idUnidadResponsable?: number
  contrasena?: string
}) => api<UsuarioAdmin>('/usuarios', { method: 'POST', body })

export const actualizarUsuario = (id: number, body: Record<string, unknown>) =>
  api<UsuarioAdmin>(`/usuarios/${id}`, { method: 'PATCH', body })

// ---------- Unidades responsables ----------

export const listarUnidades = (soloActivos = true) =>
  api<Unidad[]>(`/unidades-responsables?soloActivos=${soloActivos}`)

export const crearUnidad = (unidadResponsable: string) =>
  api<Unidad>('/unidades-responsables', { method: 'POST', body: { unidadResponsable } })

export const actualizarUnidad = (id: number, body: Record<string, unknown>) =>
  api<Unidad>(`/unidades-responsables/${id}`, { method: 'PATCH', body })

// ---------- Catálogos ----------

const catalogo = <T>(ruta: string, soloActivos: boolean) =>
  api<T[]>(`/catalogos/${ruta}?soloActivos=${soloActivos}`)

export const listarTiposEncuesta = (soloActivos = true) =>
  catalogo<TipoEncuesta>('tipos-encuesta', soloActivos)
export const listarTiposRespuesta = (soloActivos = true) =>
  catalogo<TipoRespuesta>('tipos-respuesta', soloActivos)
export const listarPreguntas = (soloActivos = true) => catalogo<Pregunta>('preguntas', soloActivos)
export const listarOpciones = (soloActivos = true) => catalogo<Opcion>('opciones', soloActivos)

export const crearTipoEncuesta = (tipoEncuesta: string) =>
  api<TipoEncuesta>('/catalogos/tipos-encuesta', { method: 'POST', body: { tipoEncuesta } })
export const crearTipoRespuesta = (tipoRespuesta: string) =>
  api<TipoRespuesta>('/catalogos/tipos-respuesta', { method: 'POST', body: { tipoRespuesta } })
export const crearPregunta = (pregunta: string) =>
  api<Pregunta>('/catalogos/preguntas', { method: 'POST', body: { pregunta } })
export const crearOpcion = (opcion: string, peso?: number) =>
  api<Opcion>('/catalogos/opciones', { method: 'POST', body: { opcion, peso } })

export const actualizarPregunta = (id: number, body: Record<string, unknown>) =>
  api<Pregunta>(`/catalogos/preguntas/${id}`, { method: 'PATCH', body })
export const actualizarOpcion = (id: number, body: Record<string, unknown>) =>
  api<Opcion>(`/catalogos/opciones/${id}`, { method: 'PATCH', body })
export const actualizarTipoEncuesta = (id: number, body: Record<string, unknown>) =>
  api<TipoEncuesta>(`/catalogos/tipos-encuesta/${id}`, { method: 'PATCH', body })
export const actualizarTipoRespuesta = (id: number, body: Record<string, unknown>) =>
  api<TipoRespuesta>(`/catalogos/tipos-respuesta/${id}`, { method: 'PATCH', body })

// ---------- Encuestas ----------

export const listarEncuestas = () => api<EncuestaResumen[]>('/encuestas')

export const detalleEncuesta = (id: number) => api<EncuestaDetalle>(`/encuestas/${id}`)

export const crearEncuesta = (body: {
  titulo: string
  idTipoEncuesta: number
  fechaInicioVigencia?: string
  fechaFinVigencia?: string
  visibleEnInicio?: boolean
}) => api<EncuestaResumen>('/encuestas', { method: 'POST', body })

export const actualizarEncuesta = (id: number, body: Record<string, unknown>) =>
  api<EncuestaResumen>(`/encuestas/${id}`, { method: 'PATCH', body })

export const agregarPreguntaAEncuesta = (
  id: number,
  body: { idPregunta: number; idTipoRespuesta: number; idOpciones?: number[] },
) => api<{ idEncuestaPregunta: number; orden: number }>(`/encuestas/${id}/preguntas`, {
  method: 'POST',
  body,
})

export const quitarPreguntaDeEncuesta = (id: number, idEncuestaPregunta: number) =>
  api<{ quitada: number }>(`/encuestas/${id}/preguntas/${idEncuestaPregunta}`, { method: 'DELETE' })

export const reordenarPreguntas = (id: number, orden: number[]) =>
  api<EncuestaDetalle>(`/encuestas/${id}/orden`, { method: 'PATCH', body: { orden } })

export const duplicarEncuesta = (id: number) =>
  api<{ idEncuesta: number; titulo: string }>(`/encuestas/${id}/duplicar`, { method: 'POST' })

export const resultadosDeEncuesta = (id: number) => api<Resultados>(`/encuestas/${id}/resultados`)

export const comentariosDeEncuesta = (id: number, pagina = 1, limite = 20) =>
  api<Comentarios>(`/encuestas/${id}/comentarios?pagina=${pagina}&limite=${limite}`)
