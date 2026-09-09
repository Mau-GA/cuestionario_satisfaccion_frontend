import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, login } from '../services/auth'

interface LocationState {
  from?: {
    pathname: string
  }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/'

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setError(null)
    try {
      login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>
      <label>
        Correo
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Entrar</button>
      <small>
        Demo: admin@example.com / admin-1234 · encuestas@example.com /
        survey_admin-1234
      </small>
    </form>
  )
}

export default Login