import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../context/useSession'
import { ApiError } from '../services/http'
import { Encabezado, PieDePagina } from '../components/Layout'
import { BotonGoogle } from '../components/BotonGoogle'
import { GOOGLE_CLIENT_ID } from '../config'

export default function Login() {
  const { iniciarSesion, iniciarSesionConGoogle } = useSession()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/usuario'

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function mensajeDeError(e: unknown) {
    return e instanceof ApiError ? e.message : 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(correo, contrasena)
      navegar(destino, { replace: true })
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  async function entrarConGoogle(credential: string) {
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesionConGoogle(credential)
      navegar(destino, { replace: true })
    } catch (e) {
      setError(mensajeDeError(e))
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

            {/* BotonGoogle no dibuja nada si no hay VITE_GOOGLE_CLIENT_ID, así
                que el separador tampoco tiene por qué aparecer sin él. */}
            <GoogleConSeparador enviando={enviando} onCredential={entrarConGoogle} />
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

/**
 * El separador "o" solo tiene sentido si el botón de Google va a aparecer:
 * por eso los dos se ocultan juntos cuando no hay VITE_GOOGLE_CLIENT_ID.
 */
function GoogleConSeparador({
  enviando,
  onCredential,
}: {
  enviando: boolean
  onCredential: (credential: string) => void
}) {
  if (!GOOGLE_CLIENT_ID) return null

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">o</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className={enviando ? 'pointer-events-none opacity-60' : undefined}>
        <BotonGoogle onCredential={onCredential} />
      </div>
    </>
  )
}
