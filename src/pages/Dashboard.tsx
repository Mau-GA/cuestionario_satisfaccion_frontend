import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { expireSession, getSession, logout } from '../services/auth'
import { ApiError } from '../services/http'
import { ROLES } from '../types/auth'
import { listSurveys, type Survey } from '../services/surveys'

function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function getErrorMessage(err: unknown): string {
    return err instanceof ApiError ? err.message : 'Error inesperado'
  }

  function loadSurveys(): void {
    setLoading(true)
    setError(null)
    listSurveys()
      .then(setSurveys)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    listSurveys()
      .then((data) => {
        if (!cancelled) setSurveys(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleForceExpire(e: FormEvent<HTMLButtonElement>): void {
    e.preventDefault()
    expireSession()
    loadSurveys()
  }

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main>
      <h1>Panel de encuestas</h1>
      <p>
        Bienvenido, {session?.user.name} ({session?.user.role})
      </p>
      {session?.user.role === ROLES.ADMIN && (
        <p>
          <Link to="/admin">Ir a administración</Link>
        </p>
      )}

      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : surveys.length > 0 ? (
        <ul>
          {surveys.map((s) => (
            <li key={s.id}>
              {s.title} — {s.responses} respuestas
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No hay encuestas.</p>
      )}

      <button type="button" onClick={loadSurveys}>
        Recargar
      </button>
      <button type="button" onClick={handleForceExpire}>
        Expirar token (demo)
      </button>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default Dashboard