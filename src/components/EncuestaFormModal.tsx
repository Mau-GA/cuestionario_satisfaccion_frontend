import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  actualizarEncuesta,
  calcularEstado,
  crearEncuesta,
  type Encuesta,
  type TipoEncuesta,
} from '../services/encuestas'
import type { UnidadResponsable } from '../services/unidades'
import { ROLES, type Role } from '../types/auth'
import { ApiError } from '../types/api'

interface Props {
  encuesta: Encuesta | null
  tipos: TipoEncuesta[]
  unidades: UnidadResponsable[]
  rol: Role | null
  idUnidadPredeterminada: number | null
  onClose: () => void
  onSaved: () => void
}

function aInputDatetime(iso: string | null): string {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function deInputDatetime(valor: string): string | null {
  if (!valor) return null
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return null
  return fecha.toISOString()
}

function estaActivo(valor: boolean | number | undefined): boolean {
  return valor === true || valor === 1
}

const CLASE_INPUT =
  'font-normal px-[14px] py-2.5 rounded-lg border border-outline bg-surface text-ink box-border ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-outline ' +
  'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]'

function EncuestaFormModal({
  encuesta,
  tipos,
  unidades,
  rol,
  idUnidadPredeterminada,
  onClose,
  onSaved,
}: Props) {
  const esEdicion = encuesta !== null
  const esAdminGlobal = rol === ROLES.ADMIN

  const [titulo, setTitulo] = useState(encuesta?.titulo ?? '')
  const [idTipo, setIdTipo] = useState(
    encuesta?.tipoEncuesta ? String(encuesta.tipoEncuesta.idTipoEncuesta) : '',
  )
  const [inicio, setInicio] = useState(
    aInputDatetime(encuesta?.fechaInicioVigencia ?? null),
  )
  const [fin, setFin] = useState(
    aInputDatetime(encuesta?.fechaFinVigencia ?? null),
  )
  const [mostrar, setMostrar] = useState(
    encuesta ? estaActivo(encuesta.activo) : true,
  )
  const [idUnidad, setIdUnidad] = useState(
    idUnidadPredeterminada ? String(idUnidadPredeterminada) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const opcionesTipos = useMemo(() => {
    const lista = [...tipos]
    const actual = encuesta?.tipoEncuesta
    if (actual && !lista.some((t) => t.idTipoEncuesta === actual.idTipoEncuesta)) {
      lista.unshift(actual)
    }
    return lista
  }, [tipos, encuesta])

  const iniciada =
    esEdicion &&
    (calcularEstado(encuesta) === 'abierta' ||
      calcularEstado(encuesta) === 'cerrada')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()
    setError(null)

    const tituloLimpio = titulo.trim()
    if (!tituloLimpio) {
      setError('El título es obligatorio.')
      return
    }
    if (!idTipo) {
      setError('Selecciona un tipo de encuesta.')
      return
    }

    const inicioISO = deInputDatetime(inicio)
    const finISO = deInputDatetime(fin)
    if (
      inicioISO &&
      finISO &&
      new Date(finISO).getTime() <= new Date(inicioISO).getTime()
    ) {
      setError('La fecha de fin debe ser posterior a la de inicio.')
      return
    }

    if (iniciada) {
      setError('La encuesta ya inició; sus datos no pueden editarse.')
      return
    }

    let unidad: number
    if (esEdicion) {
      unidad = encuesta.unidadResponsable?.idUnidadResponsable ?? 0
    } else if (esAdminGlobal) {
      unidad = Number(idUnidad)
    } else {
      unidad = idUnidadPredeterminada ?? 0
    }
    if (!esEdicion && unidad <= 0) {
      setError(
        esAdminGlobal
          ? 'Selecciona la unidad responsable.'
          : 'Tu usuario no tiene una unidad responsable asignada.',
      )
      return
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        await actualizarEncuesta(encuesta.idEncuesta, {
          titulo: tituloLimpio,
          idTipoEncuesta: Number(idTipo),
          fechaInicioVigencia: inicioISO,
          fechaFinVigencia: finISO,
          activo: mostrar,
        })
      } else {
        const creada = await crearEncuesta({
          titulo: tituloLimpio,
          idTipoEncuesta: Number(idTipo),
          idUnidadResponsable: unidad,
          fechaInicioVigencia: inicioISO,
          fechaFinVigencia: finISO,
        })
        if (!mostrar) {
          await actualizarEncuesta(creada.idEncuesta, { activo: false })
        }
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-encuesta-titulo"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-6 box-border"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5">
          <h2 id="form-encuesta-titulo" className="text-ink text-[20px]">
            {esEdicion ? 'Editar encuesta' : 'Nueva encuesta'}
          </h2>
          <p className="mt-1 text-sm opacity-70">
            {esEdicion
              ? 'Modifica los datos generales y la vigencia.'
              : 'Registra los datos generales de la encuesta.'}
          </p>
        </header>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>Título</span>
            <input
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              maxLength={255}
              required
              className={CLASE_INPUT}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>Tipo de encuesta</span>
            <select
              value={idTipo}
              onChange={(event) => setIdTipo(event.target.value)}
              required
              className={CLASE_INPUT}
            >
              <option value="">Selecciona un tipo…</option>
              {opcionesTipos.map((tipo) => (
                <option
                  key={tipo.idTipoEncuesta}
                  value={tipo.idTipoEncuesta}
                >
                  {tipo.tipoEncuesta}
                </option>
              ))}
            </select>
          </label>

          {esAdminGlobal && !esEdicion && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Unidad responsable</span>
              <select
                value={idUnidad}
                onChange={(event) => setIdUnidad(event.target.value)}
                required
                className={CLASE_INPUT}
              >
                <option value="">Selecciona una unidad…</option>
                {unidades.map((unidad) => (
                  <option
                    key={unidad.idUnidadResponsable}
                    value={unidad.idUnidadResponsable}
                  >
                    {unidad.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Inicio de vigencia</span>
              <input
                type="datetime-local"
                value={inicio}
                onChange={(event) => setInicio(event.target.value)}
                className={CLASE_INPUT}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              <span>Fin de vigencia</span>
              <input
                type="datetime-local"
                value={fin}
                onChange={(event) => setFin(event.target.value)}
                className={CLASE_INPUT}
              />
            </label>
          </div>

          <p className="text-xs opacity-70">
            La fecha de fin debe ser posterior a la de inicio. Sin fecha de
            inicio la encuesta queda en Borrador; con inicio futuro será
            Programada; dentro de la vigencia, Abierta.
          </p>

          <label className="flex items-start gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={mostrar}
              onChange={(event) => setMostrar(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#003D79]"
            />
            <span className="flex flex-col gap-0.5">
              <span>Mostrar en la vista de inicio</span>
              <span className="text-xs font-normal opacity-70">
                Si la desmarcas, la encuesta no aparecerá en el portal y quedará
                cerrada.
              </span>
            </span>
          </label>

          <p className="text-xs opacity-70 border-l-2 border-oro-unam pl-3">
            Una vez que la encuesta inicie, sus datos (título, tipo y vigencia)
            ya no podrán editarse.
          </p>

          {error && (
            <p
              className="m-0 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
                transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || iniciada}
              className="rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
                transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {guardando
                ? 'Guardando…'
                : esEdicion
                  ? 'Guardar cambios'
                  : 'Crear encuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EncuestaFormModal
