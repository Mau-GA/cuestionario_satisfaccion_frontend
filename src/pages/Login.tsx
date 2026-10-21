import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import { isAuthenticated, login, loginGoogle } from '../services/auth'

interface LocationState {
  from?: {
    pathname: string
  }
  expired?: boolean
}

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const state = location.state as LocationState | null
  const from = state?.from?.pathname ?? '/'

  const handleGoogleCredential = useCallback(
    (idToken: string): void => {
      setError(null)
      setSubmitting(true)
      loginGoogle(idToken)
        .then(() => navigate(from, { replace: true }))
        .catch((err) => setError((err as Error).message))
        .finally(() => setSubmitting(false))
    },
    [navigate, from],
  )

  const handleGoogleError = useCallback((message: string): void => {
    setError(message)
  }, [])

  // Tras un login exitoso, el finally de handleSubmit cambia submitting y
  // vuelve a renderizar antes de que surta efecto el navigate(from) de abajo;
  // isAuthenticated() ya es true en ese re-render, así que este Navigate debe
  // apuntar a la misma ruta pedida, no a "/", o se la pisa.
  if (isAuthenticated()) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col">
      <InstitutionalHeader />
      <div className="flex-1 grid place-items-center p-6 box-border bg-[#ffffff]">
        <main className="w-full max-w-[400px] box-border pt-10 px-8 pb-7 rounded-2xl bg-[#ffffff] border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
          <header className="text-center mb-7">
            <h1 className="m-0 mb-2 text-[26px] tracking-[-0.4px] text-ink">Cuestionario de satisfacción</h1>
            <p className="text-[15px]">Inicia sesión para continuar</p>
          </header>

          {state?.expired && !error && (
            <p
              className="m-0 mb-4 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
              role="status"
            >
              Tu sesión expiró. Vuelve a iniciar sesión.
            </p>
          )}

          <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-[6px] text-sm font-semibold">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@dominio.com"
                required
                className="font-normal px-[14px] py-3 rounded-lg border border-outline bg-surface text-ink box-border
                  transition-[border-color,box-shadow] duration-200
                  placeholder:text-outline
                  focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]"
              />
            </label>

            <label className="flex flex-col gap-[6px] text-sm font-semibold">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="font-normal px-[14px] py-3 rounded-lg border border-outline bg-surface text-ink box-border
                  transition-[border-color,box-shadow] duration-200
                  placeholder:text-outline
                  focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]"
              />
            </label>

            {error && (
              <p
                className="m-0 px-[14px] py-[10px] rounded-lg text-sm bg-oro-unam/15 text-azul-unam border border-oro-unam dark:text-oro-unam"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="font-semibold px-4 py-[13px] rounded-lg text-white bg-accent cursor-pointer
                transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          {GOOGLE_ENABLED && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] opacity-60">
                <span className="h-px flex-1 bg-outline" />
                o
                <span className="h-px flex-1 bg-outline" />
              </div>
              <GoogleLoginButton
                onCredential={handleGoogleCredential}
                onError={handleGoogleError}
              />
            </>
          )}

          <p className="mt-6 text-center text-sm">
            ¿Aún no tienes cuenta? <Link to="/solicitar-acceso" className="text-accent hover:underline font-medium">Solicitar acceso</Link>
          </p>
        </main>
      </div>
      <InstitutionalFooter />
    </div>
  )
}

export default Login
