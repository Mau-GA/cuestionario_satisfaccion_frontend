import { Fragment, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Campo, Tabla, Tarjeta } from '../components/ui'
import { ApiError } from '../services/http'
import { aprobarSolicitud, listarSolicitudes, rechazarSolicitud } from '../services/admin'
import { fecha } from '../utils/fechas'
import type { EstadoSolicitud, ListaSolicitudes } from '../types/admin'

const ESTADOS: { valor: EstadoSolicitud | ''; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'aprobada', etiqueta: 'Aprobadas' },
  { valor: 'rechazada', etiqueta: 'Rechazadas' },
  { valor: '', etiqueta: 'Todas' },
]

export default function Solicitudes() {
  const [estado, setEstado] = useState<EstadoSolicitud | ''>('pendiente')
  const [pagina, setPagina] = useState(1)
  const [rechazando, setRechazando] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [datos, setDatos] = useState<ListaSolicitudes | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState<string | null>(null)

  /**
   * No usa useCargar: esa carga solo pide datos al montar, y aquí el filtro
   * (estado, página) cambia después. El efecto va atado a esos dos valores en
   * un arreglo literal, que es lo que exige la regla de hooks del proyecto.
   */
  async function recargar() {
    setCargando(true)
    setErrorLista(null)
    try {
      setDatos(await listarSolicitudes(estado || undefined, undefined, pagina, 20))
    } catch (e) {
      setErrorLista(e instanceof ApiError ? e.message : 'No se pudo cargar la información')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let vigente = true
    void (async () => {
      setCargando(true)
      setErrorLista(null)
      try {
        const resultado = await listarSolicitudes(estado || undefined, undefined, pagina, 20)
        if (vigente) setDatos(resultado)
      } catch (e) {
        if (vigente) setErrorLista(e instanceof ApiError ? e.message : 'No se pudo cargar la información')
      } finally {
        if (vigente) setCargando(false)
      }
    })()
    return () => {
      vigente = false
    }
  }, [estado, pagina])

  const lista = { datos, cargando, error: errorLista, recargar }

  function cambiarEstado(nuevo: EstadoSolicitud | '') {
    setEstado(nuevo)
    setPagina(1)
  }

  async function aprobar(id: number) {
    setError(null)
    try {
      await aprobarSolicitud(id)
      await lista.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo aprobar la solicitud')
    }
  }

  async function rechazar(id: number, motivo: string) {
    setError(null)
    try {
      await rechazarSolicitud(id, motivo)
      setRechazando(null)
      await lista.recargar()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo rechazar la solicitud')
    }
  }

  return (
    <AreaUsuario>
      <h1 className="mb-1 text-2xl font-semibold text-unam-azul">Solicitudes de acceso</h1>
      <p className="mb-6 text-sm text-slate-500">
        Aprobar da de alta la cuenta como administrador de encuestas de la unidad que pidió.
      </p>

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {ESTADOS.map((e) => (
          <button
            key={e.valor}
            type="button"
            onClick={() => cambiarEstado(e.valor)}
            aria-pressed={estado === e.valor}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              estado === e.valor ? 'bg-white text-unam-azul shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {e.etiqueta}
          </button>
        ))}
      </div>

      <Aviso tipo="error">{error}</Aviso>

      <Tarjeta titulo="Solicitudes">
        {lista.cargando && <p className="text-sm text-slate-500">Cargando…</p>}
        <Aviso tipo="error">{lista.error}</Aviso>

        {lista.datos?.data.length === 0 && (
          <p className="text-sm text-slate-500">No hay solicitudes en este estado.</p>
        )}

        {!!lista.datos?.data.length && (
          <Tabla columnas={['Correo', 'Unidad', 'Solicitada', 'Estado', '']}>
            {lista.datos.data.map((s) => (
              <Fragment key={s.idSolicitudAcceso}>
                <tr>
                  <td className="px-2 py-2.5">{s.correoElectronico}</td>
                  <td className="px-2 py-2.5 text-slate-600">{s.unidadResponsable ?? '—'}</td>
                  <td className="px-2 py-2.5 text-xs text-slate-500">{fecha(s.fechaSolicitud)}</td>
                  <td className="px-2 py-2.5">
                    <PillEstado estado={s.estado} />
                  </td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    {s.estado === 'pendiente' && (
                      <div className="flex justify-end gap-2">
                        <Boton onClick={() => void aprobar(s.idSolicitudAcceso)}>Aprobar</Boton>
                        <Boton
                          variante="secundario"
                          onClick={() =>
                            setRechazando((prev) =>
                              prev === s.idSolicitudAcceso ? null : s.idSolicitudAcceso,
                            )
                          }
                        >
                          Rechazar
                        </Boton>
                      </div>
                    )}
                  </td>
                </tr>
                {s.estado === 'rechazada' && s.motivosRechazo && (
                  <tr key={`${s.idSolicitudAcceso}-motivo`}>
                    <td colSpan={5} className="px-2 pb-2 text-xs text-slate-500">
                      Motivo: {s.motivosRechazo}
                    </td>
                  </tr>
                )}
                {rechazando === s.idSolicitudAcceso && (
                  <tr key={`${s.idSolicitudAcceso}-form`}>
                    <td colSpan={5} className="bg-slate-50 px-2 py-3">
                      <FormaRechazo
                        onCancelar={() => setRechazando(null)}
                        onRechazar={(motivo) => void rechazar(s.idSolicitudAcceso, motivo)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </Tabla>
        )}

        {(lista.datos?.totalPages ?? 0) > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Boton variante="secundario" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
              ← Anteriores
            </Boton>
            <span className="text-sm text-slate-500">
              Página {lista.datos?.page} de {lista.datos?.totalPages}
            </span>
            <Boton
              variante="secundario"
              disabled={pagina >= (lista.datos?.totalPages ?? 1)}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguientes →
            </Boton>
          </div>
        )}
      </Tarjeta>
    </AreaUsuario>
  )
}

const ESTILOS_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'bg-amber-50 text-amber-700',
  aprobada: 'bg-emerald-50 text-emerald-700',
  rechazada: 'bg-slate-100 text-slate-500',
}

function PillEstado({ estado }: { estado: EstadoSolicitud }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILOS_ESTADO[estado]}`}>
      {estado === 'pendiente' ? 'Pendiente' : estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
    </span>
  )
}

function FormaRechazo({
  onRechazar,
  onCancelar,
}: {
  onRechazar: (motivo: string) => void
  onCancelar: () => void
}) {
  const [motivo, setMotivo] = useState('')

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (motivo.trim()) onRechazar(motivo.trim())
  }

  return (
    <form onSubmit={enviar} className="flex flex-wrap items-end gap-2">
      <Campo
        etiqueta="Motivo del rechazo"
        required
        autoFocus
        maxLength={500}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="flex-1"
      />
      <Boton type="submit">Confirmar rechazo</Boton>
      <Boton type="button" variante="secundario" onClick={onCancelar}>
        Cancelar
      </Boton>
    </form>
  )
}
