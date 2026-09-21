import { Link } from 'react-router-dom'
import { useSession } from '../context/useSession'
import { Pagina } from '../components/Layout'
import { Boton } from '../components/ui'
import { ROL } from '../types/auth'
import type { CodigoRol } from '../types/auth'

interface Acceso {
  titulo: string
  texto: string
  a?: string
  roles: CodigoRol[]
}

const accesos: Acceso[] = [
  {
    titulo: 'Catálogos',
    texto: 'Preguntas, opciones y tipos de encuesta y de respuesta.',
    a: '/catalogos',
    roles: [ROL.ADMINISTRADOR, ROL.ADMINISTRADOR_ENCUESTAS],
  },
  {
    titulo: 'Usuarios',
    texto: 'Dar de alta cuentas, cambiar su rol y desactivarlas.',
    a: '/usuarios',
    roles: [ROL.ADMINISTRADOR],
  },
  {
    titulo: 'Unidades responsables',
    texto: 'Las áreas a las que se adscriben las cuentas.',
    a: '/unidades',
    roles: [ROL.ADMINISTRADOR],
  },
  {
    titulo: 'Solicitudes de acceso',
    texto: 'Revisar quién pide entrar y aprobar o rechazar.',
    roles: [ROL.ADMINISTRADOR],
  },
  {
    titulo: 'Mis encuestas',
    texto: 'Armar, publicar y consultar resultados.',
    roles: [ROL.ADMINISTRADOR_ENCUESTAS],
  },
]

export default function Inicio() {
  const { sesion, cerrarSesion } = useSession()
  const usuario = sesion!.usuario
  const visibles = accesos.filter((a) => usuario.rol && a.roles.includes(usuario.rol))

  return (
    <Pagina>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-unam-azul">{usuario.correoElectronico}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Entraste como <span className="font-medium">{usuario.rolNombre}</span>
            {usuario.idUnidadResponsable !== null && ' · unidad asignada'}
          </p>
        </div>
        <Boton variante="secundario" onClick={cerrarSesion}>
          Cerrar sesión
        </Boton>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((acceso) =>
          acceso.a ? (
            <Link
              key={acceso.titulo}
              to={acceso.a}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-unam-azul-claro hover:shadow-sm"
            >
              <h2 className="font-semibold text-slate-800">{acceso.titulo}</h2>
              <p className="mt-1 text-sm text-slate-500">{acceso.texto}</p>
            </Link>
          ) : (
            <article key={acceso.titulo} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-800">{acceso.titulo}</h2>
              <p className="mt-1 text-sm text-slate-500">{acceso.texto}</p>
              <p className="mt-3 text-xs font-medium text-unam-oro">Próximamente</p>
            </article>
          ),
        )}
      </div>
    </Pagina>
  )
}
