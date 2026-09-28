import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import { isAuthenticated, login } from '../services/auth'

interface LocationState {
  from?: {
    pathname: string
  }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('administrador@cedetec.edu.bo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

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
      <div className="flex-1 grid place-items-center p-6 box-border bg-azul-unam">
        <main className="w-full max-w-[400px] box-border pt-10 px-8 pb-7 rounded-2xl bg-surface border border-outline shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
          <header className="text-center mb-7">
            <h1 className="m-0 mb-2 text-[26px] tracking-[-0.4px] text-ink">Cuestionario de satisfacción</h1>
            <p className="text-[15px]">Inicia sesión para continuar</p>
          </header>

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
                className="m-0 px-[14px] py-[10px] rounded-lg text-sm bg-[#fee2e2] text-[#b91c1c] dark:bg-[#450a0a] dark:text-[#fecaca]"
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

          <small className="block mt-[22px] text-center text-xs opacity-70">
            Demo: administrador@cedetec.edu.bo / Admin123!
          </small>
        </main>
      </div>
      <InstitutionalFooter />
    </div>
  )
}

export default Login
