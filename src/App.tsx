import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './context/SessionProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ROL } from './types/auth'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Usuarios from './pages/Usuarios'
import Unidades from './pages/Unidades'
import Catalogos from './pages/Catalogos'
import SinPermiso from './pages/SinPermiso'

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
