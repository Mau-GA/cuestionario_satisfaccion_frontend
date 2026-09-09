import { useNavigate } from 'react-router-dom'
import { getSession, logout } from '../services/auth'

function Admin() {
  const navigate = useNavigate()
  const session = getSession()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main>
      <h1>Administración</h1>
      <p>Solo accesible para el rol administrador ({session?.user.role}).</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default Admin