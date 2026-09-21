import { Link } from 'react-router-dom'
import { AreaUsuario } from '../components/AreaUsuario'

export default function SinPermiso() {
  return (
    <AreaUsuario>
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-unam-azul">No tienes permiso</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tu sesión es válida, pero tu rol no puede entrar a esta sección.
        </p>
        <Link
          to="/usuario"
          className="mt-6 inline-block rounded-lg bg-unam-azul px-4 py-2 text-sm font-semibold text-white transition hover:bg-unam-azul-claro"
        >
          Volver al inicio
        </Link>
      </div>
    </AreaUsuario>
  )
}
