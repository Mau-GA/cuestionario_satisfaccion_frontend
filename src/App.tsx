import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { UNAUTHORIZED_EVENT } from './services/http'
import { logout } from './services/auth'
import { ROLES } from './types/auth'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'

function SessionWatcher() {
  const navigate = useNavigate()

  useEffect(() => {
    function onUnauthorized() {
      logout()
      navigate('/login', { replace: true })
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
      </Routes>
    </BrowserRouter>
  )
}

export default App