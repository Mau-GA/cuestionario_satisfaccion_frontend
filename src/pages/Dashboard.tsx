import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import EstadoBadge from '../components/EstadoBadge'
import EncuestaFormModal from '../components/EncuestaFormModal'
import { getSession } from '../services/auth'
import {
  accionesPorEstado,
  calcularEstado,
  cerrarEncuesta,
  ESTADOS,
  ESTADO_LABEL,
  listEncuestas,
  listTiposEncuesta,
  type AccionEncuesta,
  type Encuesta,
  type EstadoEncuesta,
  type TipoEncuesta,
} from '../services/encuestas'
import {
  listUnidadesActivas,
  type UnidadResponsable,
} from '../services/unidades'
import { ApiError } from '../types/api'

const CLASE_INPUT =
  'font-normal px-[14px] py-2.5 rounded-lg border border-outline bg-surface text-ink box-border ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-outline ' +
  'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]'

const LABEL_ACCION: Record<AccionEncuesta, string> = {
  editar: 'Editar',
  cerrar: 'Cerrar',
  eliminar: 'Eliminar',
}

const ESTILO_ACCION: Record<AccionEncuesta, string> = {
  editar: 'text-azul-unam border-azul-unam hover:bg-accent-soft',
  cerrar: 'text-azul-unam border-azul-unam hover:bg-accent-soft',
  eliminar:
    'bg-oro-unam text-azul-unam border-oro-unam hover:brightness-110',
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatVigencia(encuesta: Encuesta): string {
  if (!encuesta.fechaInicioVigencia && !encuesta.fechaFinVigencia) {
    return 'Sin vigencia'
  }
  return `${formatFecha(encuesta.fechaInicioVigencia)} – ${formatFecha(encuesta.fechaFinVigencia)}`
}

function Dashboard() {
  const session = getSession()
  const [encuestas, setEncuestas] = useState<Encuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoEncuesta | 'todas'>(
    'todas',
  )
  const [formAbierto, setFormAbierto] = useState<Encuesta | 'nueva' | null>(
    null,
  )
  const [tipos, setTipos] = useState<TipoEncuesta[]>([])
  const [unidades, setUnidades] = useState<UnidadResponsable[]>([])
  const [procesando, setProcesando] = useState<number | null>(null)

  function getErrorMessage(err: unknown): string {
    return err instanceof ApiError ? err.message : 'Error inesperado'
  }

  function cargar(): void {
    setLoading(true)
    setError(null)
    listEncuestas()
      .then(setEncuestas)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    listEncuestas()
      .then((data) => {
        if (!cancelled) setEncuestas(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    listTiposEncuesta()
      .then(setTipos)
      .catch(() => setTipos([]))
    listUnidadesActivas()
      .then(setUnidades)
      .catch(() => setUnidades([]))
  }, [])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return encuestas.filter((encuesta) => {
      const estado = calcularEstado(encuesta)
      if (filtroEstado !== 'todas' && estado !== filtroEstado) return false
      if (!texto) return true
      const enTitulo = encuesta.titulo.toLowerCase().includes(texto)
      const enTipo =
        encuesta.tipoEncuesta?.tipoEncuesta.toLowerCase().includes(texto) ??
        false
      return enTitulo || enTipo
    })
  }, [encuestas, busqueda, filtroEstado])

  const resumen = useMemo(() => {
    const conteo: Record<EstadoEncuesta, number> = {
      borrador: 0,
      programada: 0,
      abierta: 0,
      cerrada: 0,
    }
    encuestas.forEach((encuesta) => {
      conteo[calcularEstado(encuesta)] += 1
    })
    return conteo
  }, [encuestas])

  async function handleCerrar(
    encuesta: Encuesta,
    accion: AccionEncuesta,
  ): Promise<void> {
    const verbo = accion === 'eliminar' ? 'Eliminar' : 'Cerrar'
    const detalle =
      accion === 'eliminar'
        ? 'Ya no aparecerá en el listado de activas.'
        : 'La encuesta dejará de estar disponible.'
    if (!window.confirm(`¿${verbo} «${encuesta.titulo}»? ${detalle}`)) return

    setProcesando(encuesta.idEncuesta)
    setError(null)
    try {
      await cerrarEncuesta(encuesta.idEncuesta)
      cargar()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcesando(null)
    }
  }

  return (
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <h1 className="text-ink">Encuestas de mi unidad</h1>
        <p className="mt-1">
          Bienvenido, {session?.user.correoElectronico}
        </p>

        <ul className="list-none m-0 mt-4 p-0 flex flex-wrap gap-x-5 gap-y-2">
          {ESTADOS.map((estado) => (
            <li key={estado} className="flex items-center gap-2 text-[13px]">
              <EstadoBadge estado={estado} />
              <span className="font-semibold text-ink">{resumen[estado]}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por título o tipo…"
            aria-label="Buscar encuestas"
            className={`${CLASE_INPUT} flex-1 min-w-[220px]`}
          />
          <select
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(event.target.value as EstadoEncuesta | 'todas')
            }
            aria-label="Filtrar por estado"
            className={CLASE_INPUT}
          >
            <option value="todas">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {ESTADO_LABEL[estado]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={cargar}
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Recargar
          </button>
          <button
            type="button"
            onClick={() => setFormAbierto('nueva')}
            className="rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Nueva encuesta
          </button>
        </div>

        {error && (
          <p
            className="mt-4 px-[14px] py-3 rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4">Cargando…</p>
        ) : visibles.length > 0 ? (
          <div className="overflow-x-auto mt-5">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-outline text-ink">
                  <th className="py-2 pr-4 font-bold">Título</th>
                  <th className="py-2 pr-4 font-bold">Tipo</th>
                  <th className="py-2 pr-4 font-bold">Unidad</th>
                  <th className="py-2 pr-4 font-bold">Estado</th>
                  <th className="py-2 pr-4 font-bold">Vigencia</th>
                  <th className="py-2 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((encuesta) => {
                  const estado = calcularEstado(encuesta)
                  const acciones = accionesPorEstado(estado)
                  const bloqueada = procesando === encuesta.idEncuesta
                  return (
                    <tr
                      key={encuesta.idEncuesta}
                      className="border-b border-outline/60"
                    >
                      <td className="py-3 pr-4 font-semibold text-ink">
                        {encuesta.titulo}
                      </td>
                      <td className="py-3 pr-4">
                        {encuesta.tipoEncuesta?.tipoEncuesta ?? '—'}
                      </td>
                      <td className="py-3 pr-4">
                        {encuesta.unidadResponsable?.nombre ?? '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <EstadoBadge estado={estado} />
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {formatVigencia(encuesta)}
                      </td>
                      <td className="py-3 text-right">
                        {acciones.length === 0 ? (
                          <span className="text-xs opacity-50">
                            Sin acciones
                          </span>
                        ) : (
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            {acciones.map((accion) => (
                              <button
                                key={accion}
                                type="button"
                                disabled={bloqueada}
                                onClick={() => {
                                  if (accion === 'editar') {
                                    setFormAbierto(encuesta)
                                  } else {
                                    void handleCerrar(encuesta, accion)
                                  }
                                }}
                                className={`text-[13px] font-bold rounded-lg border bg-transparent cursor-pointer px-3 py-1.5 transition-colors disabled:opacity-50 ${ESTILO_ACCION[accion]}`}
                              >
                                {LABEL_ACCION[accion]}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : !error ? (
          <p className="mt-4">
            {encuestas.length === 0
              ? 'Aún no hay encuestas registradas para tu unidad.'
              : 'No se encontraron encuestas con esos filtros.'}
          </p>
        ) : null}
      </section>

      {formAbierto && (
        <EncuestaFormModal
          encuesta={formAbierto === 'nueva' ? null : formAbierto}
          tipos={tipos}
          unidades={unidades}
          rol={session?.user.rol ?? null}
          idUnidadPredeterminada={session?.user.idUnidadResponsable ?? null}
          onClose={() => setFormAbierto(null)}
          onSaved={() => {
            setFormAbierto(null)
            cargar()
          }}
        />
      )}
    </AppLayout>
  )
}

export default Dashboard
