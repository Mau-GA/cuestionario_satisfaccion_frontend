import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'

function NoEncontrado() {
  return (
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7 text-center">
        <h1 className="text-ink">Página no encontrada</h1>
        <p className="mt-2">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex justify-center mt-5">
          <Link
            to="/"
            className="rounded-lg bg-azul-unam text-white font-bold no-underline cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </AppLayout>
  )
}

export default NoEncontrado
