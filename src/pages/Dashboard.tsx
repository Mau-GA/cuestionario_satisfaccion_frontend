import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { expireSession, getSession, logout } from '../services/auth'
import { ApiError } from '../types/api'
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
    <AppLayout>
      <section className="bg-surface border border-outline rounded-xl shadow-[0_4px_12px_rgba(0,61,121,0.08)] p-7">
        <h1 className="text-ink">Panel de encuestas</h1>
        <p>
          Bienvenido, {session?.user.correoElectronico} ({session?.user.rol})
        </p>

        {error && (
          <p
            className="mt-4 px-[14px] py-3 rounded-lg text-sm bg-[#fee2e2] text-[#b91c1c] dark:bg-[#450a0a] dark:text-[#fecaca]"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p>Cargando…</p>
        ) : surveys.length > 0 ? (
          <ul className="list-none m-0 mt-4 p-0 flex flex-col gap-[10px]">
            {surveys.map((s) => (
              <li
                key={s.id}
                className="px-4 py-[14px] border border-outline rounded-lg bg-surface"
              >
                <strong>{s.title}</strong> — {s.responses} respuestas
              </li>
            ))}
          </ul>
        ) : (
          !error && <p>No hay encuestas.</p>
        )}

        <div className="flex gap-[10px] flex-wrap mt-[18px]">
          <button
            type="button"
            className="rounded-lg bg-azul-unam text-white font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
            onClick={loadSurveys}
          >
            Recargar
          </button>
          <button
            type="button"
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
            onClick={handleForceExpire}
          >
            Expirar token (demo)
          </button>
          <button
            type="button"
            className="rounded-lg bg-transparent text-azul-unam border border-azul-unam font-bold cursor-pointer px-[18px] py-[10px]
              transition-[filter,transform] duration-150 hover:bg-accent-soft active:scale-[0.98]"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

export default Dashboard
