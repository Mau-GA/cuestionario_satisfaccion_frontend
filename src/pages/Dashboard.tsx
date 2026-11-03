import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import EstadoBadge from '../components/EstadoBadge'
import EncuestaFormModal from '../components/EncuestaFormModal'
import { getSession } from '../services/auth'
import {
  calcularEstado,
  esActivo,
  ESTADOS,
  ESTADO_LABEL,
  listEncuestas,
  listTiposEncuesta,
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

function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Error inesperado'
}

/**
 * El dashboard es el índice de las encuestas de la unidad. Cada fila
 * lleva a la pantalla de la encuesta (`/dashboard/encuestas/:id`), que es donde
 * viven las acciones que antes se apretaban desde aquí.
 */
function Dashboard() {
  const session = getSession()
  const navigate = useNavigate()
  const [encuestas, setEncuestas] = useState<Encuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoEncuesta | 'todas'>(
    'todas',
  )
  const [formAbierto, setFormAbierto] = useState(false)
  const [tipos, setTipos] = useState<TipoEncuesta[]>([])
  const [unidades, setUnidades] = useState<UnidadResponsable[]>([])

  const cargar = useCallback((): void => {
    listEncuestas()
      .then((data) => {
        // Una encuesta eliminada (de baja, activo=false) ya no se muestra:
        // una "cerrada" de verdad conserva activo=true, solo se le adelanta
        // la vigencia (cerrarEncuesta), asi que esto no oculta ninguna real.
        setEncuestas(data.filter((encuesta) => esActivo(encuesta.activo)))
        setError(null)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

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

  return (
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <h1 className="text-ink">Encuestas de mi unidad</h1>
        <p className="mt-1">Bienvenido, {session?.user.correoElectronico}</p>

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
            onClick={() => {
              setLoading(true)
              cargar()
            }}
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Recargar
          </button>
          <button
            type="button"
            onClick={() => setFormAbierto(true)}
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
                  <th className="py-2 font-bold">Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((encuesta) => (
                  <tr
                    key={encuesta.idEncuesta}
                    // La fila entera es el area clicable, pero quien navega de
                    // verdad es el enlace del titulo: asi el teclado y el menu
                    // contextual siguen funcionando como con cualquier enlace.
                    onClick={() =>
                      navigate(`/dashboard/encuestas/${encuesta.idEncuesta}`)
                    }
                    className="border-b border-outline/60 cursor-pointer transition-colors hover:bg-accent-soft"
                  >
                    <td className="py-3 pr-4 font-semibold text-ink">
                      <Link
                        to={`/dashboard/encuestas/${encuesta.idEncuesta}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-azul-unam no-underline hover:underline"
                      >
                        {encuesta.titulo}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      {encuesta.tipoEncuesta?.tipoEncuesta ?? '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {encuesta.unidadResponsable?.nombre ?? '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <EstadoBadge estado={calcularEstado(encuesta)} />
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      {formatVigencia(encuesta)}
                    </td>
                  </tr>
                ))}
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
          modo="crear"
          encuesta={null}
          tipos={tipos}
          unidades={unidades}
          rol={session?.user.rol ?? null}
          idUnidadPredeterminada={session?.user.idUnidadResponsable ?? null}
          onClose={() => setFormAbierto(false)}
          onSaved={() => {
            setFormAbierto(false)
            setLoading(true)
            cargar()
          }}
        />
      )}
    </AppLayout>
  )
}

export default Dashboard
