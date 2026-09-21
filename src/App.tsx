import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './context/SessionProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ROL } from './types/auth'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Usuarios from './pages/Usuarios'
import Unidades from './pages/Unidades'
import Catalogos from './pages/Catalogos'
import Encuestas from './pages/Encuestas'
import EncuestaDetalle from './pages/EncuestaDetalle'
import Resultados from './pages/Resultados'
import Responder from './pages/Responder'
import InicioPublico from './pages/InicioPublico'
import SinPermiso from './pages/SinPermiso'

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* Abiertas: quien responde no necesita cuenta. */}
          <Route path="/inicio" element={<InicioPublico />} />
          <Route path="/responder/:token" element={<Responder />} />

          <Route path="/login" element={<Login />} />
          <Route path="/sin-permiso" element={<SinPermiso />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR]}>
                <Unidades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalogos"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR, ROL.ADMINISTRADOR_ENCUESTAS]}>
                <Catalogos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/encuestas"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR_ENCUESTAS]}>
                <Encuestas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/encuestas/:id"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR_ENCUESTAS]}>
                <EncuestaDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/encuestas/:id/resultados"
            element={
              <ProtectedRoute roles={[ROL.ADMINISTRADOR_ENCUESTAS]}>
                <Resultados />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
