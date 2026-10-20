import { useState, useEffect, useCallback, useRef } from 'react'
import { listUnidades, createUnidad, updateUnidad, deleteUnidad, toggleUnidadActive } from '../services/unidades'

function UnidadesPage() {
  const [unidades, setUnidades] = useState<{ idUnidadResponsable: number; nombre: string; activo: boolean; fechaCreacion: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  // Cada carga lleva un número; solo se aplica la respuesta de la más reciente,
  // para que una petición lenta con una búsqueda vieja no pise a la nueva.
  const ultimaCarga = useRef(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnidad, setEditingUnidad] = useState<{ idUnidadResponsable: number; nombre: string; activo: boolean; fechaCreacion: string } | null>(null)
  const [formData, setFormData] = useState({ nombre: '', activo: true })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchUnidades = useCallback(async () => {
    const carga = ++ultimaCarga.current
    setLoading(true)
    setError(null)
    try {
      const params = { page: pagination.page, limit: pagination.limit, search: search || undefined }
      const res = await listUnidades(params)
      if (carga !== ultimaCarga.current) return
      setUnidades(res.data)
      setPagination(prev => ({
        ...prev,
        page: res.totalPages > 0 ? Math.min(prev.page, res.totalPages) : 1,
        total: res.total,
        totalPages: res.totalPages,
      }))
    } catch (err) {
      if (carga !== ultimaCarga.current) return
      setError(err instanceof Error ? err.message : 'Error cargando unidades')
    } finally {
      if (carga === ultimaCarga.current) setLoading(false)
    }
  }, [pagination.page, search, pagination.limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnidades()
  }, [fetchUnidades])

  function openCreateModal() {
    setEditingUnidad(null)
    setFormData({ nombre: '', activo: true })
    setFormError(null)
    setModalOpen(true)
  }

  function openEditModal(unidad: { idUnidadResponsable: number; nombre: string; activo: boolean; fechaCreacion: string }) {
    setEditingUnidad(unidad)
    setFormData({ nombre: unidad.nombre, activo: unidad.activo })
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingUnidad(null)
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (!formData.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      setSubmitting(false)
      return
    }

    try {
      const data = { nombre: formData.nombre.trim(), activo: formData.activo }

      if (editingUnidad) {
        await updateUnidad(editingUnidad.idUnidadResponsable, data)
      } else {
        await createUnidad(data)
      }
      closeModal()
      fetchUnidades()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error guardando unidad')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(unidad: { idUnidadResponsable: number; activo: boolean }) {
    try {
      await toggleUnidadActive(unidad.idUnidadResponsable, !unidad.activo)
      fetchUnidades()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cambiando estado')
    }
  }

  function confirmDelete(id: number) {
    setDeleteConfirm(id)
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    try {
      await deleteUnidad(deleteConfirm)
      setDeleteConfirm(null)
      fetchUnidades()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando unidad')
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Unidades Responsables</h1>
          <p className="text-sm text-gray-500">Administración de unidades organizacionales</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-azul-unam text-white rounded-lg font-medium hover:bg-azul-unam/90 transition-colors"
        >
          + Nueva Unidad
        </button>
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
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
                className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-outline">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : unidades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron unidades</td>
                </tr>
              ) : (
                unidades.map((unidad) => (
                  <tr key={unidad.idUnidadResponsable} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-ink">{unidad.nombre}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(unidad)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${unidad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {unidad.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {unidad.fechaCreacion ? new Date(unidad.fechaCreacion).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(unidad)}
                          className="p-2 text-azul-unam hover:bg-azul-unam/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(unidad.idUnidadResponsable)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">{editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-ink rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre de la unidad"
                  required
                  className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-unam"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={e => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  className="w-4 h-4 text-azul-unam border-outline rounded focus:ring-azul-unam"
                />
                <label htmlFor="activo" className="text-sm text-ink">Activo</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-outline rounded-lg text-ink hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-azul-unam text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : (editingUnidad ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">¿Eliminar unidad?</h3>
              <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. La unidad será desactivada (baja lógica).</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-outline rounded-lg text-ink hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnidadesPage