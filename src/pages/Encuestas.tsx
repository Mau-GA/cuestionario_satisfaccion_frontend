import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Pagina } from '../components/Layout'
import { Aviso, Boton, Campo, Selector, Tabla, Tarjeta } from '../components/ui'
import { EstadoPill } from '../components/EstadoEncuesta'
import { fecha } from '../utils/fechas'
import { useCargar } from '../hooks'
import { ApiError } from '../services/http'
import {
  crearEncuesta,
  duplicarEncuesta,
  listarEncuestas,
  listarTiposEncuesta,
} from '../services/admin'
import type { EncuestaResumen, TipoEncuesta } from '../types/admin'

export default function Encuestas() {
  const encuestas = useCargar<EncuestaResumen[]>(listarEncuestas)
  const tipos = useCargar<TipoEncuesta[]>(() => listarTiposEncuesta(true))

  const [titulo, setTitulo] = useState('')
  const [idTipo, setIdTipo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function alta(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      // Nace como borrador: la vigencia se fija después, desde el detalle,
      // porque es la decisión que vuelve la encuesta inmodificable.
      await crearEncuesta({ titulo, idTipoEncuesta: Number(idTipo) })
      setTitulo('')
      await encuestas.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la encuesta')
    } finally {
      setEnviando(false)
    }
  }

  async function duplicar(id: number) {
    setError(null)
    try {
      await duplicarEncuesta(id)
      await encuestas.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo duplicar')
    }
  }

  return (
    <Pagina>
      <h1 className="mb-6 text-2xl font-semibold text-unam-azul">Mis encuestas</h1>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Tarjeta titulo="Nueva encuesta" descripcion="Nace como borrador: la vigencia se fija al armarla.">
          <form onSubmit={alta} className="space-y-4">
            <Campo
              etiqueta="Título"
              required
              maxLength={255}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <Selector
              etiqueta="Tipo de encuesta"
              required
              value={idTipo}
              onChange={(e) => setIdTipo(e.target.value)}
            >
              <option value="">Selecciona uno…</option>
              {(tipos.datos ?? []).map((t) => (
                <option key={t.idTipoEncuesta} value={t.idTipoEncuesta}>
                  {t.tipoEncuesta}
                </option>
              ))}
            </Selector>
            <Aviso tipo="error">{error}</Aviso>
            <Boton type="submit" disabled={enviando} className="w-full">
              {enviando ? 'Creando…' : 'Crear encuesta'}
            </Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Encuestas de mi unidad">
          {encuestas.cargando && <p className="text-sm text-slate-500">Cargando…</p>}
          <Aviso tipo="error">{encuestas.error}</Aviso>
          {encuestas.datos?.length === 0 && (
            <p className="text-sm text-slate-500">Todavía no hay encuestas.</p>
          )}
          {!!encuestas.datos?.length && (
            <Tabla columnas={['Título', 'Tipo', 'Vigencia', 'Estado', '']}>
              {encuestas.datos.map((e) => (
                <tr key={e.idEncuesta}>
                  <td className="px-2 py-2.5">
                    <Link to={`/encuestas/${e.idEncuesta}`} className="font-medium text-unam-azul hover:underline">
                      {e.titulo}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-slate-600">{e.tipoEncuesta ?? '—'}</td>
                  <td className="px-2 py-2.5 text-xs text-slate-600">
                    {fecha(e.fechaInicioVigencia)} → {fecha(e.fechaFinVigencia)}
                  </td>
                  <td className="px-2 py-2.5">
                    <EstadoPill estado={e.estado} />
                  </td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    <Link
                      to={`/encuestas/${e.idEncuesta}/resultados`}
                      className="mr-2 text-sm font-medium text-unam-azul hover:underline"
                    >
                      Resultados
                    </Link>
                    <Boton variante="secundario" onClick={() => void duplicar(e.idEncuesta)}>
                      Duplicar
                    </Boton>
                  </td>
                </tr>
              ))}
            </Tabla>
          )}
        </Tarjeta>
      </div>
    </Pagina>
  )
}
