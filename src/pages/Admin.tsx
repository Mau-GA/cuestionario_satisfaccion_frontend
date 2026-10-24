import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { getSession, logout } from '../services/auth'

function Admin() {
  const navigate = useNavigate()
  const session = getSession()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <h1 className="text-ink">Administración</h1>
        <p>Solo accesible para el rol administrador ({session?.user.rol}).</p>
        <div className="flex gap-[10px] flex-wrap mt-[18px]">
          <button
            type="button"
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

export default Admin
