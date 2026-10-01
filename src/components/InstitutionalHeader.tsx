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
      <div
        className="mx-auto max-w-[1120px] px-6 py-3 grid grid-cols-[1fr_auto] items-center gap-2
          [grid-template-areas:'left_right'_'titles_titles']
          min-[720px]:grid-cols-[1fr_auto_1fr] min-[720px]:gap-4
          min-[720px]:[grid-template-areas:'left_titles_right']"
      >
        <Link
          to="/"
          className="[grid-area:left] justify-self-start flex items-center no-underline"
          aria-label="Inicio"
        >
          <img
            src="/logo-unam.png"
            alt="UNAM"
            className="h-[39px] min-[720px]:h-[50px] w-auto block"
          />
        </Link>

        <div className="[grid-area:titles] flex flex-col items-center gap-[3px] text-center text-white">
          <strong className="text-[15px] min-[720px]:text-[17px] tracking-[0.2px]">
            Universidad Nacional Autónoma de México
          </strong>
          <small className="text-[12.5px] min-[720px]:text-sm opacity-85 tracking-[0.3px]">
            Por mi raza hablará el espíritu
          </small>
        </div>

        <div className="[grid-area:right] justify-self-end flex items-center gap-3">
          {session && (
            <div className="flex flex-col items-end text-white text-right leading-tight">
              <span className="text-[13px] font-semibold tracking-[0.2px] truncate max-w-[220px]">
                {session.user.correoElectronico}
              </span>
              <span className="text-[11.5px] opacity-85 tracking-[0.2px]">
                {nombreUnidad ?? 'Sin unidad'}
              </span>
            </div>
          )}
          <img
            src="/logo-fesa-acatlan.png"
            alt="FES Acatlán"
            className="h-[39px] min-[720px]:h-[50px] w-auto block"
          />
        </div>
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
            <button
              type="button"
              onClick={handleLogout}
              className="ml-0 min-[720px]:ml-auto text-[13px] font-semibold text-white/85 cursor-pointer bg-transparent border border-white/30 rounded-md px-3 py-1
                hover:bg-white/10 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}

export default InstitutionalHeader