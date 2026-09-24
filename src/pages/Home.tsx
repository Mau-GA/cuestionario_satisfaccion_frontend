import { Link } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'

function Home() {
  return (
    <>
      <InstitutionalHeader />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-8 box-border">
        <section className="rounded-xl bg-azul-unam text-white flex flex-col items-center text-center gap-[10px] px-8 py-12">
          <span className="text-oro-unam font-bold tracking-[0.3px]">
            Universidad Nacional Autónoma de México
          </span>
          <h1>Cuestionario de satisfacción</h1>
          <p>
            Sistema de atención a usuarios de los servicios universitarios.
          </p>
        </section>

        <nav className="flex gap-3 mt-6 flex-wrap justify-center">
          <Link
            to="/dashboard"
            className="rounded-lg bg-azul-unam text-white font-bold no-underline cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Panel de encuestas
          </Link>
          <Link
            to="/admin"
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold no-underline cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
          >
            Administración
          </Link>
        </nav>
      </main>
      <InstitutionalFooter />
    </>
  )
}

export default Home
