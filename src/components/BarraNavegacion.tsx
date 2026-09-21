import { NavLink, useNavigate } from 'react-router-dom'
import { LogoFESAcatlan, LogoUNAM } from './Logos'
import { useSession } from '../context/useSession'
import { ROL } from '../types/auth'
import type { CodigoRol } from '../types/auth'

interface Entrada {
  a: string
  texto: string
  roles: CodigoRol[]
}

/**
 * El encuestador no tiene entradas propias: su pantalla principal ya son sus
 * encuestas, y las preguntas y opciones las crea mientras arma, sin pasar por
 * el catálogo.
 */
const ENTRADAS: Entrada[] = [
  { a: '/usuario/solicitudes', texto: 'Solicitudes', roles: [ROL.ADMINISTRADOR] },
  { a: '/usuario/usuarios', texto: 'Usuarios', roles: [ROL.ADMINISTRADOR] },
  { a: '/usuario/unidades', texto: 'Unidades', roles: [ROL.ADMINISTRADOR] },
  { a: '/usuario/catalogos', texto: 'Catálogos', roles: [ROL.ADMINISTRADOR] },
]

export function BarraNavegacion() {
  const { sesion, cerrarSesion } = useSession()
  const navegar = useNavigate()
  const rol = sesion?.usuario.rol
  const entradas = ENTRADAS.filter((e) => rol && e.roles.includes(rol))

  return (
    <header className="bg-unam-azul text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
        <NavLink to="/usuario" aria-label="Inicio">
          <LogoUNAM className="h-15" />
        </NavLink>

        <nav className="flex flex-wrap items-center gap-1">
          <Enlace a="/usuario" texto="Encuestas" fin />
          {entradas.map((e) => (
            <Enlace key={e.a} a={e.a} texto={e.texto} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-xs text-white/70 sm:inline">
            {sesion?.usuario.correoElectronico}
          </span>
          <button
            onClick={() => {
              cerrarSesion()
              navegar('/login', { replace: true })
            }}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
          >
            Salir
          </button>
          {/* Se oculta en pantallas angostas: ahí la barra ya va apretada. */}
          <LogoFESAcatlan className="hidden h-15 lg:block" />
        </div>
      </div>
    </header>
  )
}

function Enlace({ a, texto, fin }: { a: string; texto: string; fin?: boolean }) {
  return (
    <NavLink
      to={a}
      end={fin}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {texto}
    </NavLink>
  )
}
