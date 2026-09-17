import { Link } from 'react-router-dom'
import './InstitutionalHeader.css'

function InstitutionalHeader() {
  return (
    <header className="inst-header">
      <div className="inst-header-inner">
        <Link to="/" className="inst-header-left" aria-label="Inicio">
          <img
            src="/logo-unam.png"
            alt="UNAM"
            className="inst-header-logo"
          />
        </Link>

        <div className="inst-header-titles">
          <strong>Universidad Nacional Autónoma de México</strong>
          <small>Por mi raza hablará el espíritu</small>
        </div>

        <div className="inst-header-right">
          <img
            src="/logo-fesa-acatlan.png"
            alt="FES Acatlán"
            className="inst-header-logo"
          />
        </div>
      </div>
    </header>
  )
}

export default InstitutionalHeader