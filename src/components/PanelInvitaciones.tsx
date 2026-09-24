import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Aviso, Boton, Tarjeta } from './ui'
import { ApiError } from '../services/http'
import { invitar, listarInvitaciones } from '../services/admin'
import type { EstadoInvitacion, ListaInvitaciones, ResumenInvitar } from '../types/admin'

const ESTILOS_ESTADO: Record<EstadoInvitacion, string> = {
  pendiente: 'bg-slate-100 text-slate-500',
  enviada: 'bg-amber-50 text-amber-700',
  respondida: 'bg-emerald-50 text-emerald-700',
}
const ETIQUETA_ESTADO: Record<EstadoInvitacion, string> = {
  pendiente: 'Pendiente',
  enviada: 'Enviada',
  respondida: 'Respondida',
}

/**
 * Enviar invitaciones y ver su estado.
 *
 * No usa useCargar para la lista: aquí hay dos disparadores de recarga
 * (cambiar de página, y terminar de enviar un lote) y ese hook solo pide
 * datos al montar. Un efecto propio, atado a un arreglo literal de
 * dependencias, es el patrón ya establecido en el proyecto para este caso.
 */
export function PanelInvitaciones({ idEncuesta }: { idEncuesta: number }) {
  const [correos, setCorreos] = useState('')
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [resumen, setResumen] = useState<ResumenInvitar | null>(null)
  const [enviando, setEnviando] = useState(false)

  const [pagina, setPagina] = useState(1)
  const [recargarTick, setRecargarTick] = useState(0)
  const [lista, setLista] = useState<ListaInvitaciones | null>(null)
  const [cargandoLista, setCargandoLista] = useState(true)
  const [errorLista, setErrorLista] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    void (async () => {
      setCargandoLista(true)
      setErrorLista(null)
      try {
        const datos = await listarInvitaciones(idEncuesta, pagina, 10)
        if (vigente) setLista(datos)
      } catch (e) {
        if (vigente) setErrorLista(e instanceof ApiError ? e.message : 'No se pudo cargar la lista')
      } finally {
        if (vigente) setCargandoLista(false)
      }
    })()
    return () => {
      vigente = false
    }
  }, [idEncuesta, pagina, recargarTick])

  async function enviarInvitaciones(evento: FormEvent) {
    evento.preventDefault()
    setErrorEnvio(null)
    setResumen(null)

    const destinatarios = correos
      .split(/[\n,;]+/)
      .map((c) => c.trim())
      .filter(Boolean)
    if (destinatarios.length === 0) {
      setErrorEnvio('Pega al menos un correo.')
      return
    }

    setEnviando(true)
    try {
      const r = await invitar(idEncuesta, destinatarios)
      setResumen(r)
      setCorreos('')
      setPagina(1)
      setRecargarTick((t) => t + 1)
    } catch (e) {
      setErrorEnvio(e instanceof ApiError ? e.message : 'No se pudieron enviar las invitaciones')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta titulo="Invitaciones" descripcion="Envía el enlace por correo a una lista de personas.">
      <form onSubmit={enviarInvitaciones} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700" htmlFor="correos-invitacion">
          Correos
        </label>
        <textarea
          id="correos-invitacion"
          rows={4}
          value={correos}
          onChange={(e) => setCorreos(e.target.value)}
          placeholder={'una@ejemplo.com\notra@ejemplo.com'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
        />
        <p className="text-xs text-slate-500">Uno por línea, o separados por coma.</p>

        <Aviso tipo="error">{errorEnvio}</Aviso>

        {resumen && (
          <div className="space-y-0.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {resumen.enviadas > 0 && <p>{resumen.enviadas} enviada(s).</p>}
            {resumen.reenviadas > 0 && <p>{resumen.reenviadas} reenviada(s) a quien seguía sin responder.</p>}
            {resumen.yaRespondieron > 0 && (
              <p>{resumen.yaRespondieron} ya habían respondido; se omitieron.</p>
            )}
            {resumen.fallidas > 0 && (
              <p className="text-red-700">{resumen.fallidas} fallaron al enviarse. Vuelve a intentar.</p>
            )}
          </div>
        )}

        <Boton type="submit" disabled={enviando} className="w-full">
          {enviando ? 'Enviando…' : 'Invitar'}
        </Boton>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          Enviadas {lista ? `(${lista.total})` : ''}
        </p>
        {cargandoLista && <p className="text-sm text-slate-500">Cargando…</p>}
        <Aviso tipo="error">{errorLista}</Aviso>
        {lista?.data.length === 0 && (
          <p className="text-sm text-slate-500">Todavía no hay invitaciones.</p>
        )}

        <ul className="space-y-1.5">
          {(lista?.data ?? []).map((i) => (
            <li key={i.idInvitacion} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-slate-700">{i.correoElectronico}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ESTILOS_ESTADO[i.estado]}`}
              >
                {ETIQUETA_ESTADO[i.estado]}
              </span>
            </li>
          ))}
        </ul>

        {(lista?.totalPages ?? 0) > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <Boton
              type="button"
              variante="secundario"
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              ← Anteriores
            </Boton>
            <span className="text-xs text-slate-500">
              Página {lista?.page} de {lista?.totalPages}
            </span>
            <Boton
              type="button"
              variante="secundario"
              disabled={pagina >= (lista?.totalPages ?? 1)}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguientes →
            </Boton>
          </div>
        )}
      </div>
    </Tarjeta>
  )
}
