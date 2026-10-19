import { useState, useEffect, useCallback, useRef } from 'react'
import { listSolicitudes, aprobarSolicitud, rechazarSolicitud } from '../services/solicitudAcceso'
import type { SolicitudAcceso, SolicitudEstado } from '../types/admin'

const LIMITE_PAGINA = 10
const LIMITE_MOTIVO = 500
// El rol no se elige: el backend lo fija al aprobar (solicitudes-acceso.service.ts)
// y también toma la unidad de la propia solicitud. Aquí solo se muestra en la confirmación.
const ROL_ASIGNADO_AL_APROBAR = 'Administrador de encuestas'

type FiltroEstado = 'todas' | SolicitudEstado

function EstadoBadge({ estado }: { estado: SolicitudEstado }) {
  const estilos: Record<SolicitudEstado, string> = {
    pendiente: 'bg-amber-100 text-amber-800',
    aprobada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estilos[estado]}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  )
}

function formatearFecha(valor: string | null): string {
  if (!valor) return '—'
  const date = new Date(valor)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-MX')
}

function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: LIMITE_PAGINA, total: 0, totalPages: 0 })
  const [estadoFilter, setEstadoFilter] = useState<FiltroEstado>('todas')
  const [search, setSearch] = useState('')
  // Cada carga lleva un número; solo se aplica la respuesta de la más reciente,
  // para que una petición lenta con una búsqueda vieja no pise a la nueva.
  const ultimaCarga = useRef(0)

  const [detalle, setDetalle] = useState<SolicitudAcceso | null>(null)
  const [motivo, setMotivo] = useState('')
  const [confirmandoAprobar, setConfirmandoAprobar] = useState(false)
  const [accionError, setAccionError] = useState<string | null>(null)
  const [enviandoAccion, setEnviandoAccion] = useState(false)

  const fetchSolicitudes = useCallback(async () => {
    const carga = ++ultimaCarga.current
    setLoading(true)
    setError(null)
    try {
      const res = await listSolicitudes({
        estado: estadoFilter === 'todas' ? undefined : estadoFilter,
        correo: search.trim() || undefined,
        page: pagination.page,
        limit: pagination.limit,
      })
      if (carga !== ultimaCarga.current) return
      setSolicitudes(res.data)
      setPagination(prev => ({ ...prev, total: res.total, totalPages: res.totalPages }))
    } catch (err) {
      if (carga !== ultimaCarga.current) return
      setError(err instanceof Error ? err.message : 'Error cargando solicitudes')
    } finally {
      if (carga === ultimaCarga.current) setLoading(false)
    }
  }, [pagination.page, pagination.limit, estadoFilter, search])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSolicitudes()
  }, [fetchSolicitudes])

  function abrirDetalle(solicitud: SolicitudAcceso) {
    setDetalle(solicitud)
    setMotivo('')
    setConfirmandoAprobar(false)
    setAccionError(null)
  }

  function cerrarDetalle() {
    setDetalle(null)
    setMotivo('')
    setConfirmandoAprobar(false)
    setAccionError(null)
  }

  async function handleAprobar() {
    if (!detalle) return
    setAccionError(null)
    setEnviandoAccion(true)
    try {
      await aprobarSolicitud(detalle.idSolicitudAcceso)
      cerrarDetalle()
      fetchSolicitudes()
    } catch (err) {
      setAccionError(err instanceof Error ? err.message : 'Error aprobando la solicitud')
    } finally {
      setEnviandoAccion(false)
    }
  }

  async function handleRechazar() {
    if (!detalle) return
    if (!motivo.trim()) {
      setAccionError('El motivo del rechazo es obligatorio')
      return
    }
    setAccionError(null)
    setEnviandoAccion(true)
    try {
      await rechazarSolicitud(detalle.idSolicitudAcceso, motivo.trim())
      cerrarDetalle()
      fetchSolicitudes()
    } catch (err) {
      setAccionError(err instanceof Error ? err.message : 'Error rechazando la solicitud')
    } finally {
      setEnviandoAccion(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Solicitudes de acceso</h1>
          <p className="text-sm text-gray-500">Bandeja de solicitudes para ingresar al sistema</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="bg-surface border border-outline rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Buscar por correo..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
                className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
              />
            </div>
            <div className="max-w-56">
              <select
                value={estadoFilter}
                onChange={(e) => { setEstadoFilter(e.target.value as FiltroEstado); setPagination(prev => ({ ...prev, page: 1 })) }}
                className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
                aria-label="Filtrar por estado"
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-outline">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3 hidden md:table-cell">Unidad</th>
                <th className="px-4 py-3 hidden lg:table-cell">Solicitado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron solicitudes</td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr key={solicitud.idSolicitudAcceso} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-ink">{solicitud.correoElectronico}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {solicitud.unidad?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatearFecha(solicitud.fechaSolicitud)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={solicitud.estado} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => abrirDetalle(solicitud)}
                        className="px-3 py-1.5 text-sm text-azul-unam hover:bg-azul-unam/10 rounded-lg transition-colors"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-outline flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1 text-sm border border-outline rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-3 py-1 text-sm border border-outline rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Detalle de solicitud</h2>
                <p className="text-sm text-gray-500">Solicitud #{detalle.idSolicitudAcceso}</p>
              </div>
              <button onClick={cerrarDetalle} className="p-1 text-gray-400 hover:text-ink rounded-lg hover:bg-gray-100" title="Cerrar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo electrónico</dt>
                  <dd className="text-sm text-ink mt-1 break-all">{detalle.correoElectronico}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad responsable</dt>
                  <dd className="text-sm text-ink mt-1">{detalle.unidad?.nombre ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</dt>
                  <dd className="mt-1"><EstadoBadge estado={detalle.estado} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de solicitud</dt>
                  <dd className="text-sm text-ink mt-1">{formatearFecha(detalle.fechaSolicitud)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de revisión</dt>
                  <dd className="text-sm text-ink mt-1">{formatearFecha(detalle.fechaRevision)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revisada por</dt>
                  <dd className="text-sm text-ink mt-1 break-all">{detalle.usuarioRevision?.correoElectronico ?? '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivos del rechazo</dt>
                  <dd className="text-sm text-ink mt-1 break-words">{detalle.motivosRechazo ?? '—'}</dd>
                </div>
              </dl>

              {detalle.estado === 'pendiente' ? (
                <div className="pt-2 space-y-3">
                  {accionError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
                      {accionError}
                    </div>
                  )}

                  {confirmandoAprobar ? (
                    <div className="rounded-lg border border-outline p-4 space-y-4">
                      <h3 className="text-base font-semibold text-ink">
                        ¿Aprobar solicitud de {detalle.correoElectronico}?
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad a asignar</dt>
                          <dd className="text-sm text-ink mt-1">{detalle.unidad?.nombre ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol a asignar</dt>
                          <dd className="text-sm text-ink mt-1">{ROL_ASIGNADO_AL_APROBAR}</dd>
                        </div>
                      </dl>
                      <p className="text-sm text-gray-500">
                        Se dará de alta al usuario con estos datos y podrá entrar al sistema.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirmandoAprobar(false)}
                          disabled={enviandoAccion}
                          className="px-4 py-2 border border-outline rounded-lg text-ink hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleAprobar}
                          disabled={enviandoAccion}
                          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                        >
                          {enviandoAccion ? 'Enviando...' : 'Confirmar aprobación'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="motivo-rechazo" className="block text-sm font-medium text-ink mb-1">
                          Motivo del rechazo (solo si se rechaza, máx. {LIMITE_MOTIVO} caracteres)
                        </label>
                        <textarea
                          id="motivo-rechazo"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value.slice(0, LIMITE_MOTIVO))}
                          rows={3}
                          maxLength={LIMITE_MOTIVO}
                          placeholder="La solicitud no cumple con los requisitos"
                          className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleRechazar}
                          disabled={enviandoAccion || !motivo.trim()}
                          className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          {enviandoAccion ? 'Enviando...' : 'Rechazar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoAprobar(true)}
                          disabled={enviandoAccion}
                          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                        >
                          {enviandoAccion ? 'Enviando...' : 'Aprobar'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 pt-2">
                  Esta solicitud ya fue revisada; no puede modificarse.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolicitudesPage
