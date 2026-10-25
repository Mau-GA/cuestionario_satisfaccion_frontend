import { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { UNAUTHORIZED_EVENT } from './services/http'
import { getSession, logout } from './services/auth'
import { ROLES } from './types/auth'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from './pages/UsersPage'
import UnidadesPage from './pages/UnidadesPage'
import SolicitudesPage from './pages/SolicitudesPage'
import CatalogosPage from './pages/CatalogosPage'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import NoEncontrado from './pages/NoEncontrado'
import Resultados from './pages/Resultados'
import SinAcceso from './pages/SinAcceso'
import SolicitudAcceso from './pages/SolicitudAcceso'
import ResponderEncuesta from './pages/ResponderEncuesta'
import EventoPublico from './pages/EventoPublico'

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
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
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
        <Route path="/responder/:token" element={<ResponderEncuesta />} />
        <Route path="/eventos/:idEvento" element={<EventoPublico />} />
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
          path="/dashboard/encuestas/:id/resultados"
          element={
            <ProtectedRoute>
              <Resultados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="unidades" element={<UnidadesPage />} />
          <Route path="solicitudes" element={<SolicitudesPage />} />
          <Route path="catalogos/preguntas" element={<CatalogosPage catalogo="preguntas" />} />
          <Route path="catalogos/opciones" element={<CatalogosPage catalogo="opciones" />} />
          <Route path="catalogos/tipos-encuesta" element={<CatalogosPage catalogo="tipos-encuesta" />} />
          <Route path="catalogos/tipos-respuesta" element={<CatalogosPage catalogo="tipos-respuesta" />} />
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
