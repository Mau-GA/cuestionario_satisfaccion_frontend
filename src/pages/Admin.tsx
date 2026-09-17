import { useNavigate } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import { getSession, logout } from '../services/auth'
import './page.css'

function Admin() {
  const navigate = useNavigate()
  const session = getSession()

  function handleLogout(): void {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <InstitutionalHeader />
      <main className="page">
        <section className="page-panel">
          <h1>Administración</h1>
          <p>
            Solo accesible para el rol administrador ({session?.user.rol}).
          </p>
          <div className="page-toolbar">
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

export default Admin