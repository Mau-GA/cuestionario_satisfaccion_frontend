import { Link, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../services/auth'

function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()

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
      {session?.user.role === 'admin' && (
        <p>
          <Link to="/admin">Ir a administración</Link>
        </p>
      )}
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default Dashboard