import type {
  OpcionRespuesta,
  PropsPreguntaBase,
  ValorRespuesta,
} from '../../types/respuestas'
import RespuestaBarra from './RespuestaBarra'
import RespuestaCaritas from './RespuestaCaritas'
import RespuestaEstrellas from './RespuestaEstrellas'
import RespuestaTexto from './RespuestaTexto'

interface Props extends PropsPreguntaBase {
  tipo: string
  opciones: OpcionRespuesta[]
  valor: ValorRespuesta
  onChange: (valor: ValorRespuesta) => void
}

function RespuestaPregunta({
  tipo,
  opciones,
  valor,
  onChange,
  ...base
}: Props) {
  const idOpcion = typeof valor === 'number' ? valor : null

  switch (tipo.trim().toLowerCase()) {
    case 'caritas':
      return (
        <RespuestaCaritas
          {...base}
          opciones={opciones}
          valor={idOpcion}
          onChange={onChange}
        />
      )
    case 'estrellas':
      return (
        <RespuestaEstrellas
          {...base}
          opciones={opciones}
          valor={idOpcion}
          onChange={onChange}
        />
      )
    case 'barra':
      return (
        <RespuestaBarra
          {...base}
          opciones={opciones}
          valor={idOpcion}
          onChange={onChange}
        />
      )
    case 'texto':
      return (
        <RespuestaTexto
          {...base}
          valor={typeof valor === 'string' ? valor : ''}
          onChange={onChange}
        />
      )
    default:
      return (
        <p role="alert" className="text-sm font-bold text-red-700">
          Tipo de respuesta no soportado: {tipo}
        </p>
      )
  }
}

export default RespuestaPregunta
