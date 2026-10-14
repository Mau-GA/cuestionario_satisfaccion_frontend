import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { logout } from '../services/auth'

function SinAcceso() {
  const navigate = useNavigate()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7 text-center">
        <h1 className="text-ink">No tienes permiso</h1>
        <p className="mt-2">
          Tu cuenta no cuenta con los permisos necesarios para ver esta sección.
        </p>
        <div className="flex justify-center gap-3 mt-5 flex-wrap">
          <Link
            to="/"
            className="rounded-lg bg-azul-unam text-white font-bold no-underline cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Ir al inicio
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[background-color,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

export default SinAcceso
