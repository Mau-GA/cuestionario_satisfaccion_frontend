import './InstitutionalFooter.css'

function InstitutionalFooter() {
  return (
    <footer className="inst-footer">
      <div className="inst-footer-inner">
        <a
          className="inst-footer-site"
          href="https://www.unam.mx"
          target="_blank"
          rel="noreferrer"
        >
          www.unam.mx
        </a>

        <p className="inst-footer-legal">
          Hecho en México, todos los derechos reservados 2021. Esta página puede
          ser reproducida con fines no lucrativos, siempre y cuando no se
          mutile, se cite la fuente completa y su dirección electrónica. De otra
          forma, requiere permiso previo por escrito de la institución.
        </p>
      </div>
    </footer>
  )
}

export default InstitutionalFooter