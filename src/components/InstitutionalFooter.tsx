// TODO(#11): reemplazar por las URLs oficiales de la UNAM.
const ENLACES_LEGALES = [
  { label: 'Créditos', href: '#' },
  { label: 'Aviso de privacidad', href: '#' },
]

function InstitutionalFooter() {
  return (
    <footer className="mt-auto bg-azul-unam text-white">
      <div className="mx-auto max-w-[1120px] px-6 py-7 text-center">
        <p className="text-[14.5px] leading-[1.6] tracking-[0.25px] text-white/92">
          Hecho en México, todos los derechos reservados {new Date().getFullYear()}.
          Esta página puede ser reproducida con fines no lucrativos, siempre y
          cuando no se mutile, se cite la fuente completa y su dirección
          electrónica. De otra forma, requiere permiso previo por escrito de la
          institución.
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {ENLACES_LEGALES.map((enlace) => (
            <a
              key={enlace.label}
              href={enlace.href}
              className="text-[13.5px] font-semibold text-white/85 no-underline hover:text-oro-unam hover:underline transition-colors"
            >
              {enlace.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default InstitutionalFooter
