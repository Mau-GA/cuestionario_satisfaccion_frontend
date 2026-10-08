import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { getSession } from '../services/auth'
import { menuPorRol } from '../config/navigation'

function Home() {
  const session = getSession()
  const items = menuPorRol(session?.user.rol)

  return (
    <AppLayout>
      <section className="rounded-xl bg-azul-unam text-white flex flex-col items-center text-center gap-[10px] px-8 py-12">
        <span className="text-oro-unam font-bold tracking-[0.3px]">
          Universidad Nacional Autónoma de México
        </span>
        <h1>Cuestionario de satisfacción</h1>
        <p>Sistema de atención a usuarios de los servicios universitarios.</p>
      </section>

      <nav className="flex gap-3 mt-6 flex-wrap justify-center">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg bg-azul-unam text-white font-bold no-underline cursor-pointer px-[18px] py-[10px]
                transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              {item.label}
            </Link>
          ))
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-azul-unam text-white font-bold no-underline cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Iniciar sesión
          </Link>
        )}
      </nav>
    </AppLayout>
  )
}

export default Home