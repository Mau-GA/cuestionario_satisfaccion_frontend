import { Link } from 'react-router-dom'
import InstitutionalHeader from '../components/InstitutionalHeader'
import InstitutionalFooter from '../components/InstitutionalFooter'
import './page.css'

function Home() {
  return (
    <>
      <InstitutionalHeader />
      <main className="page">
        <section className="page-hero">
          <span className="page-accent">Universidad Nacional Autónoma de México</span>
          <h1>Cuestionario de satisfacción</h1>
          <p>
            Sistema de atención a usuarios de los servicios universitarios.
          </p>
        </section>

        <nav className="page-nav">
          <Link to="/dashboard" className="page-button">
            Panel de encuestas
          </Link>
          <Link to="/admin" className="page-button page-button--ghost">
            Administración
          </Link>
        </nav>
      </main>
      <InstitutionalFooter />
    </>
  )
}

export default Home