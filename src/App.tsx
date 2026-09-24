import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './context/SessionProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ROL } from './types/auth'
import InicioPublico from './pages/InicioPublico'
import Responder from './pages/Responder'
import Login from './pages/Login'
import SolicitarAcceso from './pages/SolicitarAcceso'
import Usuario from './pages/Usuario'
import EncuestaDetalle from './pages/EncuestaDetalle'
import Resultados from './pages/Resultados'
import Usuarios from './pages/Usuarios'
import Unidades from './pages/Unidades'
import Catalogos from './pages/Catalogos'
import Solicitudes from './pages/Solicitudes'
import SinPermiso from './pages/SinPermiso'

const AMBOS = [ROL.ADMINISTRADOR, ROL.ADMINISTRADOR_ENCUESTAS]
const SOLO_ADMIN = [ROL.ADMINISTRADOR]

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas: quien responde no necesita cuenta. */}
          <Route path="/" element={<InicioPublico />} />
          <Route path="/responder/:token" element={<Responder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />

          {/* Detrás de la sesión. */}
          <Route
            path="/usuario"
            element={
              <ProtectedRoute roles={AMBOS}>
                <Usuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/encuestas/:id"
            element={
              <ProtectedRoute roles={AMBOS}>
                <EncuestaDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/encuestas/:id/resultados"
            element={
              <ProtectedRoute roles={AMBOS}>
                <Resultados />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/usuarios"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/unidades"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Unidades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/catalogos"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Catalogos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario/solicitudes"
            element={
              <ProtectedRoute roles={SOLO_ADMIN}>
                <Solicitudes />
              </ProtectedRoute>
            }
          />

          <Route path="/sin-permiso" element={<SinPermiso />} />
          {/* Lo desconocido va a la pantalla pública, no al login. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
