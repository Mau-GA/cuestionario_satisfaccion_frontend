import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { UNAUTHORIZED_EVENT } from './services/http'
import { getSession, logout } from './services/auth'
import { ROLES } from './types/auth'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import NoEncontrado from './pages/NoEncontrado'
import SinAcceso from './pages/SinAcceso'
import SolicitudAcceso from './pages/SolicitudAcceso'

function SessionWatcher() {
  const navigate = useNavigate()

  useEffect(() => {
    function onUnauthorized(event: Event): void {
      const detail = (event as CustomEvent<{ refreshToken: string | null }>)
        .detail
      const eventToken = detail?.refreshToken ?? null
      const currentToken = getSession()?.refreshToken ?? null

      // Ignora el evento solo si ya hay una sesión distinta a la que falló
      // (p. ej. un login nuevo), para no borrar una sesión recién creada.
      if (currentToken !== null && currentToken !== eventToken) {
        return
      }

      logout()
      navigate('/login', { replace: true, state: { expired: true } })
    }

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [navigate])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <SessionWatcher />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/solicitar-acceso" element={<SolicitudAcceso />} />
        <Route path="/sin-acceso" element={<SinAcceso />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
