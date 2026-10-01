import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../services/auth'
import { listUnidadesActivas } from '../services/unidades'
import { menuPorRol } from '../config/navigation'

function InstitutionalHeader() {
  const navigate = useNavigate()
  const session = getSession()
  const idUnidad = session?.user.idUnidadResponsable ?? null
  const [unidad, setUnidad] = useState<{ id: number; nombre: string } | null>(null)

  useEffect(() => {
    if (idUnidad == null) return
    let cancelled = false
    listUnidadesActivas()
      .then((unidades) => {
        if (cancelled) return
        const unidad = unidades.find((u) => u.idUnidadResponsable === idUnidad)
        setUnidad(unidad ? { id: idUnidad, nombre: unidad.nombre } : null)
      })
      .catch(() => {
        if (!cancelled) setUnidad(null)
      })
    return () => {
      cancelled = true
    }
  }, [idUnidad])

  const nombreUnidad =
    idUnidad != null && unidad?.id === idUnidad ? unidad.nombre : null
  const items = menuPorRol(session?.user.rol)

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-azul-unam border-b-[5px] border-oro-unam">
      {session && (
        <div className="bg-black/15">
          <div className="mx-auto max-w-[1120px] px-6 py-[6px] flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 min-w-0 rounded-full bg-white/10 px-3 py-[3px] text-white">
              <span className="h-2 w-2 rounded-full bg-oro-unam shrink-0" aria-hidden />
              <span className="text-[12.5px] font-semibold tracking-[0.2px] truncate max-w-[45vw] min-[720px]:max-w-[260px]">
                {session.user.correoElectronico}
              </span>
              <span className="text-white/30" aria-hidden>
                |
              </span>
              <span className="text-[12px] opacity-80 tracking-[0.2px] truncate max-w-[40vw] min-[720px]:max-w-[200px]">
                {nombreUnidad ?? 'Sin unidad'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[12px] font-semibold text-white/85 cursor-pointer bg-transparent border border-white/30 rounded-md px-3 py-[3px]
                hover:bg-white/10 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1120px] px-6 py-3 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center no-underline shrink-0"
          aria-label="Inicio"
        >
          <img
            src="/logo-unam.png"
            alt="UNAM"
            className="h-[39px] min-[720px]:h-[50px] w-auto block"
          />
        </Link>

        <img
          src="/logo-fesa-acatlan.png"
          alt="FES Acatlán"
          className="h-[39px] min-[720px]:h-[50px] w-auto block shrink-0"
        />
      </div>

      {items.length > 0 && (
        <nav className="border-t border-white/20 bg-azul-unam">
          <div className="mx-auto max-w-[1120px] px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-[14px] font-semibold no-underline tracking-[0.2px] py-1 ${
                    isActive
                      ? 'text-oro-unam border-b-2 border-oro-unam'
                      : 'text-white hover:text-oro-unam transition-colors'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

export default InstitutionalHeader