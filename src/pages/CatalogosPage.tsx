import { useState, useEffect, useCallback, useRef } from 'react'
import {
  actualizarItemCatalogo,
  crearItemCatalogo,
  desactivarItemCatalogo,
  listarCatalogo,
  type ClaveCatalogo,
} from '../services/catalogos'
import type { ItemCatalogo } from '../types/catalogos'
import { ApiError } from '../types/api'

interface ConfigCatalogo {
  titulo: string
  descripcion: string
  campoTexto: string
  labelTexto: string
  maxLength: number
  placeholder: string
  conPeso: boolean
  // Las preguntas y opciones versionan: editar guarda un renglón nuevo y
  // la original no se modifica ni se desactiva (contrato del BE-19).
  versionaAlEditar: boolean
  singular: string
}

const CONFIGS: Record<ClaveCatalogo, ConfigCatalogo> = {
  preguntas: {
    titulo: 'Preguntas',
    descripcion: 'Catálogo de preguntas disponibles para armar encuestas',
    campoTexto: 'pregunta',
    labelTexto: 'Pregunta',
    maxLength: 500,
    placeholder: '¿Qué tan satisfecho quedó con la atención recibida?',
    conPeso: false,
    versionaAlEditar: true,
    singular: 'pregunta',
  },
  opciones: {
    titulo: 'Opciones',
    descripcion: 'Catálogo de opciones con su peso (el más negativo, el más positivo)',
    campoTexto: 'opcion',
    labelTexto: 'Opción',
    maxLength: 255,
    placeholder: 'Muy satisfecho',
    conPeso: true,
    versionaAlEditar: true,
    singular: 'opción',
  },
  'tipos-encuesta': {
    titulo: 'Tipos de encuesta',
    descripcion: 'Catálogo de tipos de encuesta',
    campoTexto: 'tipoEncuesta',
    labelTexto: 'Tipo de encuesta',
    maxLength: 100,
    placeholder: 'Satisfacción del servicio',
    conPeso: false,
    versionaAlEditar: false,
    singular: 'tipo de encuesta',
  },
  'tipos-respuesta': {
    titulo: 'Tipos de respuesta',
    descripcion: 'Catálogo de tipos de respuesta (componente que pinta el frontend)',
    campoTexto: 'tipoRespuesta',
    labelTexto: 'Tipo de respuesta',
    maxLength: 100,
    placeholder: 'Estrellas',
    conPeso: false,
    versionaAlEditar: false,
    singular: 'tipo de respuesta',
  },
}

function esActivo(item: ItemCatalogo): boolean {
  return Boolean(item.activo)
}

function idDe(item: ItemCatalogo): number {
  if ('idPregunta' in item) return item.idPregunta
  if ('idOpcion' in item) return item.idOpcion
  if ('idTipoEncuesta' in item) return item.idTipoEncuesta
  return item.idTipoRespuesta
}

function textoDe(item: ItemCatalogo, campo: string): string {
  return String((item as unknown as Record<string, unknown>)[campo] ?? '')
}

function pesoDe(item: ItemCatalogo): number | null {
  return 'peso' in item ? (item.peso ?? null) : null
}

function CatalogosPage({ catalogo }: { catalogo: ClaveCatalogo }) {
  const config = CONFIGS[catalogo]
  const [items, setItems] = useState<ItemCatalogo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  // Cada carga lleva un número; solo se aplica la respuesta de la más reciente,
  // para que una petición lenta con una búsqueda vieja no pise a la nueva.
  const ultimaCarga = useRef(0)
  const [aviso, setAviso] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemCatalogo | null>(null)
  const [texto, setTexto] = useState('')
  const [peso, setPeso] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<ItemCatalogo | null>(null)
  const [desactivando, setDesactivando] = useState(false)

  const fetchItems = useCallback(async () => {
    const carga = ++ultimaCarga.current
    setLoading(true)
    setError(null)
    try {
      const res = await listarCatalogo(catalogo)
      if (carga !== ultimaCarga.current) return
      setItems([...res].sort((a, b) => idDe(a) - idDe(b)))
    } catch (err) {
      if (carga !== ultimaCarga.current) return
      setError(err instanceof Error ? err.message : `Error cargando ${config.titulo.toLowerCase()}`)
    } finally {
      if (carga === ultimaCarga.current) setLoading(false)
    }
  }, [catalogo, config.titulo])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems()
  }, [fetchItems])

  function itemsFiltrados(): ItemCatalogo[] {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => textoDe(item, config.campoTexto).toLowerCase().includes(q))
  }

  function openCreateModal() {
    setEditingItem(null)
    setTexto('')
    setPeso('')
    setFormError(null)
    setModalOpen(true)
  }

  function openEditModal(item: ItemCatalogo) {
    setEditingItem(item)
    setTexto(textoDe(item, config.campoTexto))
    setPeso(config.conPeso && pesoDe(item) !== null ? String(pesoDe(item)) : '')
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingItem(null)
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!texto.trim()) {
      setFormError(`El campo ${config.labelTexto.toLowerCase()} es obligatorio`)
      return
    }
    if (config.conPeso && peso.trim()) {
      const valor = Number(peso)
      if (Number.isNaN(valor) || valor < -999.99 || valor > 999.99) {
        setFormError('El peso debe ser un número entre -999.99 y 999.99')
        return
      }
    }

    setSubmitting(true)
    try {
      const data: Record<string, unknown> = { [config.campoTexto]: texto.trim() }
      if (config.conPeso && peso.trim()) data.peso = Number(peso)

      const res = await (editingItem
        ? actualizarItemCatalogo(catalogo, idDe(editingItem), data)
        : crearItemCatalogo(catalogo, data))

      closeModal()
      if (editingItem && config.versionaAlEditar && idDe(res) !== idDe(editingItem)) {
        // El backend creó un renglón nuevo: la original quedó intacta y activa.
        setAviso(`Se creó una ${config.singular} nueva e independiente (ID ${idDe(res)}); la original se conserva sin cambios.`)
      } else {
        setAviso(editingItem ? `${config.singular.charAt(0).toUpperCase()}${config.singular.slice(1)} actualizada.` : `${config.singular.charAt(0).toUpperCase()}${config.singular.slice(1)} creada.`)
      }
      fetchItems()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : `Error guardando ${config.singular}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDesactivar() {
    if (!deleteConfirm) return
    setDesactivando(true)
    try {
      await desactivarItemCatalogo(catalogo, idDe(deleteConfirm))
      setDeleteConfirm(null)
      setAviso(`La ${config.singular} quedó desactivada.`)
      fetchItems()
    } catch (err) {
      setDeleteConfirm(null)
      // Si ya se usó en una encuesta, el backend responde 409 con su mensaje.
      setError(err instanceof ApiError ? err.message : `Error desactivando ${config.singular}`)
    } finally {
      setDesactivando(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{config.titulo}</h1>
          <p className="text-sm text-gray-500">{config.descripcion}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-azul-unam text-white rounded-lg font-medium hover:bg-azul-unam/90 transition-colors"
        >
          + Nueva {config.singular}
        </button>
      </div>

      {aviso && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm" role="status">
          {aviso}
        </div>
      )}

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
                placeholder={`Buscar por ${config.labelTexto.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-outline">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{config.labelTexto}</th>
                {config.conPeso && <th className="px-4 py-3 hidden md:table-cell">Peso</th>}
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {loading ? (
                <tr>
                  <td colSpan={config.conPeso ? 5 : 4} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : itemsFiltrados().length === 0 ? (
                <tr>
                  <td colSpan={config.conPeso ? 5 : 4} className="px-4 py-8 text-center text-gray-500">No se encontraron registros</td>
                </tr>
              ) : (
                itemsFiltrados().map((item) => (
                  <tr key={idDe(item)} className={`hover:bg-gray-50 ${!esActivo(item) ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-500">{idDe(item)}</td>
                    <td className="px-4 py-3 text-sm text-ink">{textoDe(item, config.campoTexto)}</td>
                    {config.conPeso && (
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {pesoDe(item) ?? '—'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${esActivo(item) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {esActivo(item) ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-azul-unam hover:bg-azul-unam/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          disabled={!esActivo(item)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={esActivo(item) ? 'Desactivar' : 'Ya está inactiva'}
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-outline flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">
                {editingItem ? `Editar ${config.singular}` : `Nueva ${config.singular}`}
              </h2>
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

              {editingItem && config.versionaAlEditar && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm" role="note">
                  Al guardar se creará una {config.singular} <strong>nueva e independiente</strong>; la original
                  no se modifica ni se desactiva, para que las encuestas ya aplicadas conserven el texto que la gente leyó.
                </div>
              )}

              <div>
                <label htmlFor="campo-texto" className="block text-sm font-medium text-ink mb-1">
                  {config.labelTexto} *
                </label>
                <textarea
                  id="campo-texto"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.slice(0, config.maxLength))}
                  rows={config.maxLength > 255 ? 3 : 2}
                  maxLength={config.maxLength}
                  placeholder={config.placeholder}
                  required
                  className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
                />
                <p className="text-xs text-gray-400 mt-1">{texto.length}/{config.maxLength} caracteres</p>
              </div>

              {config.conPeso && (
                <div>
                  <label htmlFor="campo-peso" className="block text-sm font-medium text-ink mb-1">
                    Peso (opcional)
                  </label>
                  <input
                    id="campo-peso"
                    type="number"
                    step="0.01"
                    min="-999.99"
                    max="999.99"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-outline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azul-unam"
                  />
                </div>
              )}

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
                  {submitting ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">
                ¿Desactivar esta {config.singular}?
              </h3>
              <p className="text-gray-500 mb-6 break-words">
                “{textoDe(deleteConfirm, config.campoTexto)}” dejará de estar disponible.
                Si ya se usó en alguna encuesta, el sistema no permitirá desactivarla.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-outline rounded-lg text-ink hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDesactivar}
                  disabled={desactivando}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {desactivando ? 'Desactivando...' : 'Desactivar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogosPage
