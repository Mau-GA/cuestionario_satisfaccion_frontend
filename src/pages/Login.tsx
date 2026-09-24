import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../context/useSession'
import { ApiError } from '../services/http'
import { Encabezado, PieDePagina } from '../components/Layout'

export default function Login() {
  const { iniciarSesion } = useSession()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/usuario'

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(correo, contrasena)
      navegar(destino, { replace: true })
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-superficie">
      <Encabezado />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-unam-azul">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-slate-500">
              Entra con la cuenta que te autorizó el administrador.
            </p>

            <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  required
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
                />
              </div>

              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-unam-azul-claro focus:ring-2 focus:ring-unam-azul-claro/20"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-lg bg-unam-azul px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-unam-azul-claro disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/solicitar-acceso" className="text-unam-azul hover:underline">
              Solicita acceso
            </Link>
          </p>
        </div>
      </main>
      <PieDePagina />
    </div>
  )
}
