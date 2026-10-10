export type TipoRespuesta = 'caritas' | 'estrellas' | 'barra' | 'texto'

export interface OpcionRespuesta {
  idOpcion: number
  etiqueta: string
  peso: number | string | null
}

export type ValorRespuesta = number | string | null

export interface PropsPreguntaBase {
  id: string
  pregunta: string
  requerida?: boolean
  error?: string | null
  deshabilitado?: boolean
}

export interface PropsPreguntaOpciones extends PropsPreguntaBase {
  opciones: OpcionRespuesta[]
  valor: number | null
  onChange: (idOpcion: number) => void
}

export interface PropsPreguntaTexto extends PropsPreguntaBase {
  valor: string
  onChange: (texto: string) => void
  maxLength?: number
  placeholder?: string
}
