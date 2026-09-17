import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import { expireSession, getSession, logout } from '../services/auth'
import { ROLES } from '../types/auth'
import { ApiError } from '../types/api'
import { listSurveys, type Survey } from '../services/surveys'
import './page.css'

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
    <>
      <InstitutionalHeader />
      <main className="page">
        <section className="page-panel">
          <h1>Panel de encuestas</h1>
          <p>
            Bienvenido, {session?.user.correoElectronico} ({session?.user.rol})
          </p>

          {session?.user.rol === ROLES.ADMIN && (
            <p style={{ marginTop: '8px' }}>
              <Link to="/admin">Ir a administración</Link>
            </p>
          )}

          {error && (
            <p className="page-alert" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p>Cargando…</p>
          ) : surveys.length > 0 ? (
            <ul className="page-list">
              {surveys.map((s) => (
                <li key={s.id} className="page-list-item">
                  <strong>{s.title}</strong> — {s.responses} respuestas
                </li>
              ))}
            </ul>
          ) : (
            !error && <p>No hay encuestas.</p>
          )}

          <div className="page-toolbar">
            <button type="button" className="page-button" onClick={loadSurveys}>
              Recargar
            </button>
            <button
              type="button"
              className="page-button page-button--ghost"
              onClick={handleForceExpire}
            >
              Expirar token (demo)
            </button>
            <button
              type="button"
              className="page-button page-button--ghost"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
      </main>
      <InstitutionalFooter />
    </>
  )
}

export default Dashboard