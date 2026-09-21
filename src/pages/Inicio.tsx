import { useSession } from '../context/useSession'
import { Pagina } from '../components/Layout'
import { ROL } from '../types/auth'

export default function Inicio() {
  const { sesion, cerrarSesion } = useSession()
  const usuario = sesion!.usuario

  return (
    <Pagina>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-unam-azul">
            Hola, {usuario.correoElectronico}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entraste como <span className="font-medium">{usuario.rolNombre}</span>
          </p>
        </div>
        <button
          onClick={cerrarSesion}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {usuario.rol === ROL.ADMINISTRADOR && (
          <Tarjeta
            titulo="Solicitudes de acceso"
            texto="Revisar quién pide entrar y aprobar o rechazar."
          />
        )}
        {usuario.rol === ROL.ADMINISTRADOR && (
          <Tarjeta titulo="Usuarios y unidades" texto="Administrar cuentas y unidades responsables." />
        )}
        {usuario.rol === ROL.ADMINISTRADOR_ENCUESTAS && (
          <Tarjeta titulo="Mis encuestas" texto="Armar, publicar y consultar resultados." />
        )}
      </div>
    </Pagina>
  )
}

function Tarjeta({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-800">{titulo}</h2>
      <p className="mt-1 text-sm text-slate-500">{texto}</p>
      <p className="mt-3 text-xs font-medium text-unam-oro">Próximamente</p>
    </article>
  )
}
