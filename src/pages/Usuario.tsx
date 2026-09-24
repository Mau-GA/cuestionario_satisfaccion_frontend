import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaUsuario } from '../components/AreaUsuario'
import { Aviso, Boton, Campo, Selector, Tarjeta } from '../components/ui'
import { EstadoPill } from '../components/EstadoEncuesta'
import { ModalContrasena } from '../components/ModalContrasena'
import { useCargar } from '../hooks'
import { useSession } from '../context/useSession'
import { ApiError } from '../services/http'
import { crearEncuesta, listarEncuestas, listarTiposEncuesta } from '../services/admin'
import { fecha } from '../utils/fechas'
import { ROL } from '../types/auth'
import type { EncuestaResumen, TipoEncuesta } from '../types/admin'

/** Ya pasaron las cerradas; el resto sigue vigente o por abrir. */
const yaPaso = (e: EncuestaResumen) => e.estado === 'cerrada'

export default function Usuario() {
  const { sesion } = useSession()
  const esEncuestador = sesion?.usuario.rol === ROL.ADMINISTRADOR_ENCUESTAS
  const encuestas = useCargar<EncuestaResumen[]>(listarEncuestas)
  const [creando, setCreando] = useState(false)
  const [modalContrasena, setModalContrasena] = useState(false)

  const todas = encuestas.datos ?? []
  const activas = todas.filter((e) => !yaPaso(e))
  const pasadas = todas.filter(yaPaso)

  return (
    <AreaUsuario>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-unam-azul">Encuestas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {esEncuestador
              ? 'Las encuestas de tu unidad responsable.'
              : 'Todas las unidades. Como administrador puedes consultarlas y ver sus resultados, pero no editarlas.'}
          </p>
        </div>
        {esEncuestador && <Boton onClick={() => setCreando(true)}>Crear encuesta</Boton>}
      </div>

      {/* Una cuenta que entró con Google nace sin contraseña: sin este aviso,
          perder el acceso a esa cuenta de Google la deja sin forma de entrar. */}
      {sesion && !sesion.usuario.tieneContrasena && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>
            <strong>Tu cuenta no tiene contraseña.</strong> Hoy solo puedes entrar con Google;
            crea una para poder entrar también con correo y contraseña.
          </p>
          <Boton onClick={() => setModalContrasena(true)}>Crear contraseña</Boton>
        </div>
      )}

      {modalContrasena && (
        <ModalContrasena tieneContrasena={false} onCerrar={() => setModalContrasena(false)} />
      )}

      {creando && <DialogoNueva onCerrar={() => setCreando(false)} />}

      {encuestas.cargando && <p className="mt-6 text-sm text-slate-500">Cargando…</p>}
      <div className="mt-6">
        <Aviso tipo="error">{encuestas.error}</Aviso>
      </div>

      {!encuestas.cargando && todas.length === 0 && (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
          {esEncuestador
            ? 'Todavía no has creado ninguna encuesta.'
            : 'Todavía no hay encuestas en el sistema.'}
        </p>
      )}

      {activas.length > 0 && (
        <Grupo titulo="Vigentes" nota="Abiertas, programadas y borradores" encuestas={activas} />
      )}
      {pasadas.length > 0 && (
        <Grupo titulo="Ya pasaron" nota="Cerraron su periodo de aplicación" encuestas={pasadas} apagadas />
      )}
    </AreaUsuario>
  )
}

function Grupo({
  titulo,
  nota,
  encuestas,
  apagadas,
}: {
  titulo: string
  nota: string
  encuestas: EncuestaResumen[]
  apagadas?: boolean
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{titulo}</h2>
      <p className="mb-3 text-xs text-slate-400">{nota}</p>
      <div className={`space-y-2 ${apagadas ? 'opacity-75' : ''}`}>
        {encuestas.map((e) => (
          <article
            key={e.idEncuesta}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-4"
          >
            <div className="min-w-56 flex-1">
              <Link
                to={`/usuario/encuestas/${e.idEncuesta}`}
                className="font-medium text-unam-azul hover:underline"
              >
                {e.titulo}
              </Link>
              <p className="mt-0.5 text-xs text-slate-500">
                {e.unidadResponsable ?? '—'} · {e.tipoEncuesta ?? 'sin tipo'}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {fecha(e.fechaInicioVigencia)} → {fecha(e.fechaFinVigencia)}
            </p>
            <EstadoPill estado={e.estado} />
            <Link
              to={`/usuario/encuestas/${e.idEncuesta}/resultados`}
              className="text-sm font-medium text-unam-azul hover:underline"
            >
              Resultados
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

/** Pide lo mínimo y lleva al constructor: la vigencia se fija ya armando. */
function DialogoNueva({ onCerrar }: { onCerrar: () => void }) {
  const navegar = useNavigate()
  const tipos = useCargar<TipoEncuesta[]>(() => listarTiposEncuesta(true))
  const [titulo, setTitulo] = useState('')
  const [idTipo, setIdTipo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function crear(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const e = await crearEncuesta({ titulo, idTipoEncuesta: Number(idTipo) })
      navegar(`/usuario/encuestas/${e.idEncuesta}`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la encuesta')
      setEnviando(false)
    }
  }

  return (
    <div className="mt-6">
      <Tarjeta
        titulo="Nueva encuesta"
        descripcion="Con esto basta para empezar: las fechas y las preguntas se definen enseguida."
      >
        <form onSubmit={crear} className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Título"
            required
            autoFocus
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
          <div className="sm:col-span-2">
            <Aviso tipo="error">{error}</Aviso>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Boton type="submit" disabled={enviando}>
              {enviando ? 'Creando…' : 'Crear y empezar a armarla'}
            </Boton>
            <Boton type="button" variante="secundario" onClick={onCerrar}>
              Cancelar
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
